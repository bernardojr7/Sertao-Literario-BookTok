import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function registerReading(data) {
  return addDoc(collection(db, 'readings'), {
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
}

export async function approveReading(id, approvedBy) {
  await updateDoc(doc(db, 'readings', id), {
    status: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString()
  });
}

export async function rejectReading(id, approvedBy, reason) {
  await updateDoc(doc(db, 'readings', id), {
    status: 'rejected',
    approvedBy,
    rejectionReason: reason,
    approvedAt: new Date().toISOString()
  });
}

export async function deleteReading(id) {
  await deleteDoc(doc(db, 'readings', id));
}

export async function getReadingsByUser(userId) {
  const q = query(
    collection(db, 'readings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPendingReadings(className) {
  const q = query(
    collection(db, 'readings'),
    where('className', '==', className),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllPendingReadings() {
  const q = query(
    collection(db, 'readings'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
