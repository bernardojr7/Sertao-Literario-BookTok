import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function awardReward(userId, type, coins, xp, sourceId) {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) throw new Error('Usuário não encontrado');

    const user = userSnap.data();
    const newCoins = (user.cactoscoins || 0) + coins;
    const newXp = (user.xp || 0) + xp;
    const newLevel = Math.floor(newXp / 100) + 1;

    transaction.update(userRef, {
      cactoscoins: newCoins,
      xp: newXp,
      level: newLevel,
      booksRead: type === 'reading' ? (user.booksRead || 0) + 1 : user.booksRead
    });

    const txRef = doc(collection(db, 'rewardTransactions'));
    transaction.set(txRef, {
      userId,
      type,
      coins,
      xp,
      sourceId,
      createdAt: new Date().toISOString()
    });
  });
}

export async function deductCoins(userId, coins) {
  await runTransaction(db, async (transaction) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) throw new Error('Usuário não encontrado');

    const user = userSnap.data();
    const balance = user.cactoscoins || 0;

    if (balance < coins) throw new Error('Saldo insuficiente');

    transaction.update(userRef, {
      cactoscoins: balance - coins
    });
  });
}

export async function getUserTransactions(userId) {
  const q = query(
    collection(db, 'rewardTransactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
