# Itzik Touch — מגע של איציק

WebView רספונסיבי ומובייל־פירסט להזמנת טיפולי עיסוי.

## הרצה

```bash
npm install
npm run dev
```

## חיבור Firebase פעיל

- Firebase Web App: `itzik-touch`
- Authentication: Email/Password
- Firestore: Standard edition, `europe-west3 (Frankfurt)`
- Analytics events: `select_treatment`, `booking_completed`, `whatsapp_click`
- WhatsApp: `https://wa.me/972548764111`

טופס הפרופיל יוצר משתמש חדש או מתחבר למשתמש קיים, ושומר פרופיל ב־`users/{uid}`. הזמנות של משתמש מחובר נשמרות גם ב־`bookings` ובמקביל נשמרות מקומית לחוויית עבודה רציפה.

Storage להעלאת תמונות ודוח מייל אוטומטי נשארו מושהים כדי להישאר במסלול Spark ללא חיובים נוספים. האפליקציה משתמשת באווטרים מובנים בשלב זה.

## מבנה

- `src/main.jsx` — אפליקציית React, ניווט, הרשמה/כניסה, הזמנה ופרופיל.
- `src/styles.css` — שפת המותג, RTL/LTR, Light/Dark ורספונסיביות.
- `src/lib/firebase.js` — אתחול Firebase.
- `src/lib/analytics.js` — אירועי Analytics ללא פרטי משתמש אישיים.
- `src/lib/cloudStore.js` — שמירת פרופילים והזמנות ב־Firestore.
- `public/illustrations/` — איורי הקרוסלה.
- `firestore.rules` — כללי אבטחה.

## תצורה מקומית

`.env.local` מכיל את תצורת Web של Firebase ואינו נכלל ב־Git. אין לשמור סיסמאות, Service Account או מפתחות פרטיים בקוד.
