import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, firebaseConfigured } from './firebase';

export async function saveUserProfile(uid, profile) {
  if (!firebaseConfigured || !db || !uid) return { saved: false, reason: 'firebase-not-configured' };
  await setDoc(doc(db, 'users', uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
  return { saved: true };
}

export async function saveBooking(uid, booking) {
  if (!firebaseConfigured || !db || !uid) return { saved: false, reason: 'firebase-not-configured' };
  const reference = await addDoc(collection(db, 'bookings'), { ...booking, userId: uid, createdAt: serverTimestamp() });
  return { saved: true, id: reference.id };
}
