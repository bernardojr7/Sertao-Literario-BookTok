const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const XP_PER_READING = 25;
const COINS_PER_READING = 15;

exports.approveReading = onCall(async (request) => {
  const { readingId, approve, reason } = request.data;
  const callerId = request.auth?.uid;

  if (!callerId) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await db.collection('users').doc(callerId).get();
  const caller = callerDoc.data();

  if (!['teacher', 'coordinator'].includes(caller.role)) {
    throw new HttpsError('permission-denied', 'Apenas professores e coordenadores podem aprovar.');
  }

  const readingRef = db.collection('readings').doc(readingId);
  const readingDoc = await readingRef.get();

  if (!readingDoc.exists) throw new HttpsError('not-found', 'Leitura não encontrada.');
  const reading = readingDoc.data();

  if (reading.status !== 'pending') {
    throw new HttpsError('failed-precondition', 'Esta leitura já foi processada.');
  }

  if (approve) {
    await db.runTransaction(async (tx) => {
      tx.update(readingRef, {
        status: 'approved',
        approvedBy: callerId,
        approvedAt: new Date().toISOString()
      });

      const userRef = db.collection('users').doc(reading.userId);
      const userDoc = await tx.get(userRef);

      if (userDoc.exists) {
        const user = userDoc.data();
        tx.update(userRef, {
          cactoscoins: (user.cactoscoins || 0) + COINS_PER_READING,
          xp: (user.xp || 0) + XP_PER_READING,
          level: Math.floor(((user.xp || 0) + XP_PER_READING) / 100) + 1,
          booksRead: (user.booksRead || 0) + 1
        });

        tx.set(db.collection('rewardTransactions').doc(), {
          userId: reading.userId,
          type: 'reading',
          coins: COINS_PER_READING,
          xp: XP_PER_READING,
          sourceId: readingId,
          createdAt: new Date().toISOString()
        });
      }
    });

    return { success: true, message: 'Leitura aprovada e recompensa concedida.' };
  } else {
    await readingRef.update({
      status: 'rejected',
      approvedBy: callerId,
      rejectionReason: reason || 'Não especificado.',
      approvedAt: new Date().toISOString()
    });

    return { success: true, message: 'Leitura rejeitada.' };
  }
});

exports.createUserProfile = onDocumentCreated('users/{userId}', async (event) => {
  const data = event.data?.data();
  if (!data) return;

  if (!data.role) {
    await event.data.ref.update({ role: 'student' });
  }
});

exports.approveMission = onCall(async (request) => {
  const { completionId, approve } = request.data;
  const callerId = request.auth?.uid;

  if (!callerId) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await db.collection('users').doc(callerId).get();
  const caller = callerDoc.data();

  if (!['teacher', 'coordinator'].includes(caller.role)) {
    throw new HttpsError('permission-denied', 'Apenas professores e coordenadores.');
  }

  const completionRef = db.collection('missionCompletions').doc(completionId);
  const completionDoc = await completionRef.get();
  if (!completionDoc.exists) throw new HttpsError('not-found', 'Não encontrado.');

  const completion = completionDoc.data();

  if (approve) {
    const missionDoc = await db.collection('missions').doc(completion.missionId).get();
    const mission = missionDoc.data();

    await db.runTransaction(async (tx) => {
      tx.update(completionRef, { status: 'approved', approvedBy: callerId, approvedAt: new Date().toISOString() });

      const userRef = db.collection('users').doc(completion.userId);
      const userDoc = await tx.get(userRef);
      if (userDoc.exists) {
        const user = userDoc.data();
        tx.update(userRef, {
          cactoscoins: (user.cactoscoins || 0) + (mission.coins || 0),
          xp: (user.xp || 0) + (mission.xp || 0),
          level: Math.floor(((user.xp || 0) + (mission.xp || 0)) / 100) + 1
        });

        tx.set(db.collection('rewardTransactions').doc(), {
          userId: completion.userId,
          type: 'mission',
          coins: mission.coins || 0,
          xp: mission.xp || 0,
          sourceId: completion.missionId,
          createdAt: new Date().toISOString()
        });
      }
    });
  } else {
    await completionRef.update({ status: 'rejected', approvedBy: callerId, rejectionReason: 'Missão não aprovada.', approvedAt: new Date().toISOString() });
  }

  return { success: true };
});

exports.generateReport = onCall(async (request) => {
  const callerId = request.auth?.uid;
  if (!callerId) throw new HttpsError('unauthenticated', 'Login necessário.');

  const callerDoc = await db.collection('users').doc(callerId).get();
  if (callerDoc.data().role !== 'coordinator') {
    throw new HttpsError('permission-denied', 'Apenas coordenador.');
  }

  const { className } = request.data;

  let usersQuery = db.collection('users');
  if (className) {
    usersQuery = usersQuery.where('className', '==', className);
  }

  const usersSnap = await usersQuery.get();
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const classes = className
    ? [className]
    : [...new Set(users.map(u => u.className).filter(Boolean))];

  const reports = [];

  for (const c of classes) {
    const readingsSnap = await db.collection('readings')
      .where('className', '==', c)
      .get();

    const readings = readingsSnap.docs.map(d => d.data());
    const classUsers = users.filter(u => u.className === c);
    const students = classUsers.filter(u => u.role === 'student');

    reports.push({
      className: c,
      studentCount: students.length,
      totalBooks: students.reduce((s, u) => s + (u.booksRead || 0), 0),
      totalXp: students.reduce((s, u) => s + (u.xp || 0), 0),
      approvedReadings: readings.filter(r => r.status === 'approved').length,
      pendingReadings: readings.filter(r => r.status === 'pending').length,
      rejectedReadings: readings.filter(r => r.status === 'rejected').length
    });
  }

  const reportRef = await db.collection('reports').add({
    generatedBy: callerId,
    filters: className ? { className } : { all: true },
    data: reports,
    createdAt: new Date().toISOString()
  });

  return { reportId: reportRef.id, data: reports };
});
