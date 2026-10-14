import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { app, firebaseConfigured } from './firebase';

let analyticsPromise;

export async function track(eventName, params = {}) {
  if (!firebaseConfigured || !app || typeof window === 'undefined') return;
  analyticsPromise ??= isSupported().then((supported) => (supported ? getAnalytics(app) : null));
  const analytics = await analyticsPromise;
  if (analytics) logEvent(analytics, eventName, params);
}
