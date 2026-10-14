import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  HeartPulse,
  Home,
  ImagePlus,
  Leaf,
  LogIn,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Navigation,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
  UserRound,
  Waves,
  X,
} from 'lucide-react';
import './styles.css';
import { track } from './lib/analytics';
import { auth, firebaseConfigured } from './lib/firebase';
import { saveBooking, saveUserProfile } from './lib/cloudStore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

const STORAGE = {
  lang: 'itzik-touch-lang',
  theme: 'itzik-touch-theme',
  profile: 'itzik-touch-profile',
  orders: 'itzik-touch-orders',
};

const treatments = [
  {
    id: 'reflexology',
    title: { he: 'רפלקסולוגיה', en: 'Reflexology' },
    eyebrow: { he: 'איזון דרך כפות הרגליים', en: 'Balance through the feet' },
    description: { he: 'טיפול מדויק ועדין עם אמבט מים חמים ומלחים לריכוך כפות הרגליים ולהגברת אפקט הטיפול.', en: 'A precise, gentle treatment with a warm salt-water foot bath to soften the feet and enhance the treatment.' },
    duration: 50,
    price: 220,
    image: '/illustrations/reflexology-men-carousel.jpg',
    preTreatmentImage: '/illustrations/footbath-men.png',
    tone: 'sage',
  },
  {
    id: 'swedish',
    title: { he: 'עיסוי', en: 'Massage' },
    eyebrow: { he: 'מרגיע ומשחרר', en: 'Relax and release' },
    description: { he: 'מגע זורם ונעים לשחרור עומסים, מנוחה וחידוש אנרגיה.', en: 'Flowing, soothing touch for releasing tension, resting and restoring energy.' },
    duration: 60,
    price: 260,
    image: '/illustrations/massage-men-carousel.jpg',
    tone: 'mist',
  },
  {
    id: 'cupping',
    title: { he: 'שילוב כוסות רוח', en: 'Cupping therapy' },
    eyebrow: { he: 'טיפול משלים בהתאמה אישית', en: 'Personalized complementary care' },
    description: { he: 'שילוב כוסות רוח כחלק מטיפול מקצועי, רגוע ומכבד.', en: 'Cupping as part of a professional, calm and respectful treatment.' },
    duration: 60,
    price: 300,
    image: '/illustrations/cupping-men-carousel.jpg',
    tone: 'gold',
  },
];

const carouselSlides = [
  { id: 'carousel-massage-certificate', title: { he: 'תעודת עיסוי', en: 'Massage certification' }, eyebrow: { he: 'הסמכה מקצועית', en: 'Professional certification' }, description: { he: 'תעודת עיסוי מקצועית ממכון גולדמן לשיקום פיזיקלי.', en: 'Professional massage certificate from the Goldman Institute for Physical Rehabilitation.' }, image: '/illustrations/01-massage-certificate.jpg', tone: 'mist', isCredential: true },
  { id: 'carousel-reflexology-certificate', title: { he: 'תעודת רפלקסולוגיה', en: 'Reflexology certificate' }, eyebrow: { he: 'רפואה משלימה', en: 'Complementary care' }, description: { he: 'תעודת סיום קורס רפלקסולוגיה מבית הספר לרפואה משלימה.', en: 'Reflexology course certificate from the School of Complementary Medicine.' }, image: '/illustrations/02-reflexology-certificate.jpg', tone: 'sage', isCredential: true },
  { id: 'carousel-reflexology-certificate-2', title: { he: 'שנה שנייה ברפלקסולוגיה', en: 'Second year of reflexology' }, eyebrow: { he: 'דרגת בכיר ומאבחן פנטגרמי', en: 'Senior and pentagram diagnostician level' }, description: { he: 'שנה שנייה ללימודי רפלקסולוגיה לדרגת בכיר ומאבחן פנטגרמי.', en: 'Second year of reflexology studies toward senior and pentagram diagnostician level.' }, image: '/illustrations/03-reflexology-certificate-2.jpg', tone: 'gold', isCredential: true },
  { id: 'swedish', title: { he: 'עיסוי', en: 'Massage' }, eyebrow: { he: 'מרגיע ומשחרר', en: 'Relax and release' }, description: { he: 'מעסה מקצועי מעניק עיסוי לגבר באווירה רגועה, נעימה ומכבדת.', en: 'A professional massage in a calm, comfortable and respectful setting.' }, duration: 60, price: 260, image: '/illustrations/04-massage-men.webp', tone: 'mist' },
  { id: 'carousel-reflexology', treatmentId: 'reflexology', title: { he: 'רפלקסולוגיה', en: 'Reflexology' }, eyebrow: { he: 'איזון דרך כפות הרגליים', en: 'Balance through the feet' }, description: { he: 'טיפול רפלקסולוגיה של 60 דקות ב־300 ש״ח, כולל אמבט חמים ומפנק לכפות הרגליים.', en: 'A 60-minute reflexology treatment for ₪300, including a warm, soothing foot bath.' }, duration: 60, price: 300, image: '/illustrations/reflexology-men-carousel.jpg', tone: 'sage' },
  { id: 'carousel-satisfaction', title: { he: 'לא קמים מהטיפול עד שלא מרוצים ומשוחררים!', en: 'You do not leave until you feel satisfied and released!' }, eyebrow: { he: 'הטיפול שלך — בקצב שלך', en: 'Your treatment, your pace' }, description: { he: 'במהלך הטיפול חייבים לבקש חלש או חזק יותר, לבקש שוב אזור שצריך, ואני מחויב לספק עד שאתם מרוצים.', en: 'During the treatment, ask for lighter or deeper pressure and request any area again. I am committed to serving you until you are satisfied.' }, image: '/illustrations/06-satisfaction-massage.webp', tone: 'blue', isMessage: true },
];

const copy = {
  he: {
    home: 'דף הבית',
    treatments: 'סוגי טיפולים',
    book: 'קביעת תור',
    orders: 'ההזמנות שלי',
    profile: 'פרופיל',
    contact: 'צור קשר ב־WhatsApp',
    menu: 'תפריט ניווט',
    language: 'שפה',
    theme: 'תצוגה',
    light: 'בהיר',
    dark: 'כהה',
    welcome: 'ברוך שובך',
    guest: 'אורח/ת',
    whatToday: 'מה תרצה/י היום?',
    heroText: 'זמן לעצור, לנשום ולהרגיש טוב יותר — במגע מקצועי ומכבד.',
    bookNow: 'קביעת תור',
    explore: 'לכל סוגי הטיפולים',
    featured: 'הטיפולים שלנו',
    featuredText: 'בחירה רגועה שמתאימה לקצב שלך.',
    why: 'למה Itzik Touch?',
    whyText: 'טיפול אישי, אווירה שקטה ודרך פשוטה להזמין את הזמן שמגיע לך.',
    professional: 'מקצועי ומכבד',
    professionalText: 'מגע מותאם לנשים ולגברים, באווירה רגועה ועם גבולות ברורים.',
    atClinic: 'בקליניקה',
    atHome: 'בבית הלקוח',
    atClinicText: 'מרחב שקט ומוכן לטיפול',
    atHomeText: 'המגע מגיע עד אליך',
    stepTreatment: 'טיפול',
    stepLocation: 'מיקום',
    stepExtras: 'תוספות',
    stepTime: 'מועד',
    stepSummary: 'סיכום',
    chooseTreatment: 'איזה טיפול מתאים לך?',
    chooseTreatmentText: 'בחר/י את הטיפול שמרגיש נכון להיום.',
    continue: 'המשך',
    back: 'חזרה',
    chooseLocation: 'איפה תרצה/י לקבל את הטיפול?',
    address: 'כתובת הטיפול',
    addressPlaceholder: 'רחוב, מספר, עיר',
    shareLocation: 'שיתוף המיקום הנוכחי',
    locationShared: 'המיקום נוסף להזמנה',
    distance: 'מרחק משוער בק״מ',
    openingFee: 'דמי פתיחה',
    perKm: 'מחיר לכל ק״מ',
    travelFee: 'תוספת הגעה',
    iceBath: 'הוספת אמבטיית קרח לפני הטיפול',
    iceBathPrice: '25 ₪',
    iceNotice: 'אמבטיית קרח מותנית באישור רופא. במקרה של ספק, יש להתייעץ עם גורם רפואי מוסמך.',
    chooseDate: 'בחר/י תאריך ושעה',
    date: 'תאריך',
    time: 'שעה',
    available: 'שעות זמינות',
    summary: 'סיכום ההזמנה',
    treatment: 'טיפול',
    location: 'מיקום',
    addOns: 'תוספות',
    total: 'סה״כ',
    confirm: 'אישור ושמירת הזמנה',
    saved: 'ההזמנה נשמרה בהצלחה',
    ordersTitle: 'ההזמנות שלי',
    ordersText: 'כל הרגעים שקבעת לעצמך במקום אחד.',
    noOrders: 'עדיין אין הזמנות',
    noOrdersText: 'זה זמן טוב לבחור טיפול ולהתחיל.',
    firstBooking: 'קביעת ההזמנה הראשונה',
    upcoming: 'הזמנות קרובות',
    past: 'הזמנות קודמות',
    pending: 'ממתינה לאישור',
    profileTitle: 'הפרופיל שלי',
    profileText: 'פרטים אישיים שיעזרו לנו להעניק לך חוויה מדויקת יותר.',
    firstName: 'שם פרטי',
    email: 'כתובת מייל',
    phone: 'מספר נייד',
    password: 'סיסמה',
    passwordHint: 'לפחות 8 תווים',
    gender: 'אני',
    woman: 'אישה',
    man: 'גבר',
    avatar: 'בחירת אווטר',
    upload: 'העלאת תמונת פרופיל',
    saveProfile: 'שמירת פרופיל',
    profileSaved: 'הפרופיל עודכן',
    signup: 'הרשמה ל־Itzik Touch',
    signupHint: 'כמה פרטים קטנים, ואפשר להתחיל.',
    secure: 'פרטיות ואבטחה',
    secureText: 'הפרטים שלך נשמרים בצורה מאובטחת ומשמשים רק לניהול הטיפולים וההזמנות.',
    whatsappText: 'יש לך שאלה? דברו איתנו',
    footer: 'מגע אישי. קצב רגוע. תחושה טובה יותר.',
    demoNote: 'הזמנת הדגמה — ללא חיוב',
    datePlaceholder: 'בחר/י תאריך',
    chooseTime: 'בחר/י שעה',
    bookingDetails: 'פרטי ההזמנה',
    orderNumber: 'מספר הזמנה',
    locationClinic: 'קליניקה / מקום העסק',
    locationHome: 'הגעה לבית הלקוח',
    forWomenMen: 'לנשים ולגברים',
    iceShort: 'אמבטיית קרח',
    none: 'ללא',
    savedAddress: 'כתובת שנשמרה',
    close: 'סגירה',
  },
  en: {
    home: 'Home',
    treatments: 'Treatments',
    book: 'Book a treatment',
    orders: 'My bookings',
    profile: 'Profile',
    contact: 'Contact on WhatsApp',
    menu: 'Navigation menu',
    language: 'Language',
    theme: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    welcome: 'Welcome back',
    guest: 'guest',
    whatToday: 'What would you like today?',
    heroText: 'A moment to pause, breathe and feel better — with professional, respectful touch.',
    bookNow: 'Book a treatment',
    explore: 'Explore treatments',
    featured: 'Our treatments',
    featuredText: 'A calm choice for the pace you need today.',
    why: 'Why Itzik Touch?',
    whyText: 'Personal care, a quiet atmosphere and an easy way to reserve your time.',
    professional: 'Professional and respectful',
    professionalText: 'Personalized touch for women and men, with calm boundaries.',
    atClinic: 'At the clinic',
    atHome: 'At your home',
    atClinicText: 'A quiet space ready for you',
    atHomeText: 'Care comes to you',
    stepTreatment: 'Treatment',
    stepLocation: 'Location',
    stepExtras: 'Extras',
    stepTime: 'Time',
    stepSummary: 'Summary',
    chooseTreatment: 'Which treatment feels right?',
    chooseTreatmentText: 'Choose the care that matches your day.',
    continue: 'Continue',
    back: 'Back',
    chooseLocation: 'Where would you like your treatment?',
    address: 'Treatment address',
    addressPlaceholder: 'Street, number, city',
    shareLocation: 'Share current location',
    locationShared: 'Location added to your booking',
    distance: 'Estimated distance in km',
    openingFee: 'Opening fee',
    perKm: 'Price per km',
    travelFee: 'Travel fee',
    iceBath: 'Add an ice bath before treatment',
    iceBathPrice: '₪25',
    iceNotice: 'An ice bath requires medical approval. If unsure, consult a qualified medical professional.',
    chooseDate: 'Choose a date and time',
    date: 'Date',
    time: 'Time',
    available: 'Available times',
    summary: 'Booking summary',
    treatment: 'Treatment',
    location: 'Location',
    addOns: 'Add-ons',
    total: 'Total',
    confirm: 'Confirm and save booking',
    saved: 'Booking saved successfully',
    ordersTitle: 'My bookings',
    ordersText: 'Every moment you reserved for yourself, in one place.',
    noOrders: 'No bookings yet',
    noOrdersText: 'It is a good time to choose a treatment and begin.',
    firstBooking: 'Book your first treatment',
    upcoming: 'Upcoming bookings',
    past: 'Past bookings',
    pending: 'Waiting for confirmation',
    profileTitle: 'My profile',
    profileText: 'Personal details that help us make your experience more precise.',
    firstName: 'First name',
    email: 'Email address',
    phone: 'Mobile number',
    password: 'Password',
    passwordHint: 'At least 8 characters',
    gender: 'I am',
    woman: 'Woman',
    man: 'Man',
    avatar: 'Choose an avatar',
    upload: 'Upload profile photo',
    saveProfile: 'Save profile',
    profileSaved: 'Profile updated',
    signup: 'Sign up to Itzik Touch',
    signupHint: 'A few details, then you are ready to begin.',
    secure: 'Privacy and security',
    secureText: 'Your details are stored securely and used only to manage treatments and bookings.',
    whatsappText: 'Have a question? Talk to us',
    footer: 'Personal touch. Calm pace. A better feeling.',
    demoNote: 'Demo booking — no charge',
    datePlaceholder: 'Choose a date',
    chooseTime: 'Choose a time',
    bookingDetails: 'Booking details',
    orderNumber: 'Booking number',
    locationClinic: 'Clinic / business location',
    locationHome: 'At the client’s home',
    forWomenMen: 'For women and men',
    iceShort: 'Ice bath',
    none: 'None',
    savedAddress: 'Saved address',
    close: 'Close',
  },
};

const avatars = ['◒', '◓', '◉', '◌', '✦', '◐'];
const timeSlots = ['09:00', '10:30', '12:00', '16:00', '17:30', '19:00'];
const openingFee = 20;
const pricePerKm = 3;

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString('he-IL')} ₪`;
}

function formatDate(value, lang) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(lang === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function LogoMark() {
  return null;
}

function WhatsAppButton({ label, compact = false }) {
  const text = encodeURIComponent('שלום איציק, אשמח לקבל פרטים על טיפולי העיסוי.');
  return (
    <a className={`whatsapp-button ${compact ? 'compact' : ''}`} href={`https://wa.me/972548764111?text=${text}`} onClick={() => track('whatsapp_click')} target="_blank" rel="noreferrer">
      <MessageCircle size={18} strokeWidth={2.2} />
      <span>{label}</span>
    </a>
  );
}

function CertificateVisual({ lang }) {
  return <div className="certificate-visual" role="img" aria-label={lang === 'he' ? 'תעודת עיסוי מקצועית' : 'Professional massage certificate'}>
    <div className="certificate-seal"><ShieldCheck size={18} /></div>
    <span className="certificate-kicker">ITZIK TOUCH</span>
    <strong>{lang === 'he' ? 'תעודת עיסוי' : 'Massage Certificate'}</strong>
    <span>{lang === 'he' ? 'הכשרה מקצועית בעיסוי ואנטומיה' : 'Professional training in massage and anatomy'}</span>
    <div className="certificate-line" />
    <small>{lang === 'he' ? 'הסמכה מקצועית' : 'Professional certification'}</small>
  </div>;
}

function App() {
  const [lang, setLang] = useState(() => readStorage(STORAGE.lang, 'he'));
  const [theme, setTheme] = useState(() => readStorage(STORAGE.theme, 'light'));
  const [profile, setProfile] = useState(() => readStorage(STORAGE.profile, { firstName: '', email: '', phone: '', gender: 'woman', avatar: '◒', profileImage: '' }));
  const [orders, setOrders] = useState(() => readStorage(STORAGE.orders, []));
  const [view, setView] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState('swedish');
  const [toast, setToast] = useState('');
  const t = copy[lang];
  const rtl = lang === 'he';

  useEffect(() => {
    window.localStorage.setItem(STORAGE.lang, JSON.stringify(lang));
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [lang, rtl]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE.theme, JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const navigate = (nextView) => {
    setView(nextView);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectTreatment = (id) => {
    setSelectedTreatment(id);
    track('select_treatment', { treatment_id: id });
    navigate('book');
  };

  const saveProfile = async (nextProfile) => {
    const { password, ...safeProfile } = nextProfile;
    if (firebaseConfigured && auth && !auth.currentUser) {
      if (!password || password.length < 8) {
        setToast(lang === 'he' ? 'יש להזין סיסמה של 8 תווים לפחות' : 'Enter a password of at least 8 characters');
        return;
      }
      try {
        const credential = await createUserWithEmailAndPassword(auth, safeProfile.email, password);
        await updateProfile(credential.user, { displayName: safeProfile.firstName });
        await saveUserProfile(credential.user.uid, safeProfile);
      } catch (error) {
        if (error?.code === 'auth/email-already-in-use') {
          try {
            const credential = await signInWithEmailAndPassword(auth, safeProfile.email, password);
            await saveUserProfile(credential.user.uid, safeProfile);
          } catch {
            setToast(lang === 'he' ? 'המייל כבר רשום או שהסיסמה שגויה' : 'The email is registered or the password is incorrect');
            return;
          }
        } else {
          const message = lang === 'he' ? 'לא ניתן להשלים את ההרשמה כרגע' : 'Registration could not be completed right now';
          setToast(message);
          return;
        }
      }
    } else if (firebaseConfigured && auth?.currentUser) {
      await saveUserProfile(auth.currentUser.uid, safeProfile);
    }
    setProfile(safeProfile);
    window.localStorage.setItem(STORAGE.profile, JSON.stringify(nextProfile));
    setToast(t.profileSaved);
  };

  const saveOrder = async (order) => {
    const nextOrders = [order, ...orders];
    setOrders(nextOrders);
    window.localStorage.setItem(STORAGE.orders, JSON.stringify(nextOrders));
    let cloudSaveFailed = false;
    if (firebaseConfigured && auth?.currentUser) {
      try {
        await saveBooking(auth.currentUser.uid, order);
      } catch {
        cloudSaveFailed = true;
      }
    }
    track('booking_completed', { treatment_id: order.treatmentId, location_type: order.locationType, ice_bath: Boolean(order.iceBath) });
    setToast(cloudSaveFailed ? (lang === 'he' ? 'ההזמנה נשמרה מקומית; שמירת הענן נכשלה' : 'Booking saved locally; cloud save failed') : t.saved);
    navigate('orders');
  };

  return (
    <div className="app-shell">
      <Header t={t} profile={profile} onMenu={() => setDrawerOpen(true)} onHome={() => navigate('home')} />
      <Drawer open={drawerOpen} t={t} lang={lang} theme={theme} profile={profile} view={view} onClose={() => setDrawerOpen(false)} onNavigate={navigate} onLang={() => setLang(lang === 'he' ? 'en' : 'he')} onTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
      <main className="page-shell">
        {view === 'home' && <HomeView t={t} lang={lang} profile={profile} selectedTreatment={selectedTreatment} onBook={() => navigate('book')} onTreatments={() => navigate('treatments')} onSelectTreatment={selectTreatment} />}
        {view === 'treatments' && <TreatmentsView t={t} lang={lang} onSelectTreatment={selectTreatment} />}
        {view === 'book' && <BookingView t={t} lang={lang} selectedTreatment={selectedTreatment} onBack={() => navigate('home')} onSelectTreatment={setSelectedTreatment} onSave={saveOrder} />}
        {view === 'orders' && <OrdersView t={t} lang={lang} orders={orders} onBook={() => navigate('book')} />}
        {view === 'profile' && <ProfileView t={t} lang={lang} profile={profile} onSave={saveProfile} />}
      </main>
      <Footer t={t} />
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </div>
  );
}

function Header({ t, profile, onMenu, onHome }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button className="icon-button menu-trigger" onClick={onMenu} aria-label={t.menu}><Menu size={22} /></button>
        <button className="brand" onClick={onHome} aria-label="Itzik Touch home">
          <LogoMark />
          <span className="brand-copy"><strong>Itzik Touch</strong><small>מגע של איציק</small></span>
        </button>
      </div>
    </header>
  );
}

function Drawer({ open, t, lang, theme, profile, view, onClose, onNavigate, onLang, onTheme }) {
  const items = [
    { id: 'home', label: t.home, icon: <Home size={18} /> },
    { id: 'treatments', label: t.treatments, icon: <Sparkles size={18} /> },
    { id: 'book', label: t.book, icon: <CalendarDays size={18} /> },
    { id: 'orders', label: t.orders, icon: <ShoppingBag size={18} /> },
    { id: 'profile', label: t.profile, icon: <UserRound size={18} /> },
  ];
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-label={t.menu}>
        <div className="drawer-head"><div className="drawer-brand"><LogoMark /><span>Itzik Touch</span></div><button className="icon-button" onClick={onClose} aria-label={t.close}><X size={21} /></button></div>
        <div className="drawer-user"><div className="drawer-avatar">{profile.profileImage ? <img src={profile.profileImage} alt="" /> : profile.avatar || '◒'}</div><div><small>{profile.firstName ? t.welcome : t.signup}</small><strong>{profile.firstName || t.guest}</strong></div></div>
        <nav className="drawer-nav">
          {items.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>{item.icon}<span>{item.label}</span>{view === item.id && <span className="nav-dot" />}</button>)}
        </nav>
        <div className="drawer-settings">
          <div className="drawer-label"><span>{t.language}</span><button className="text-toggle" onClick={onLang}>{lang === 'he' ? 'English' : 'עברית'}</button></div>
          <div className="drawer-label"><span>{t.theme}</span><button className="text-toggle" onClick={onTheme}>{theme === 'light' ? <><Moon size={14} />{t.dark}</> : <><Sun size={14} />{t.light}</>}</button></div>
        </div>
        <WhatsAppButton label={t.contact} />
        <p className="drawer-note"><ShieldCheck size={14} /> {t.secureText}</p>
      </aside>
    </>
  );
}

function HomeView({ t, lang, profile, onBook, onTreatments, onSelectTreatment }) {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const item = carouselSlides[active];
  const firstName = profile.firstName || t.guest;
  useEffect(() => {
    if (isPaused) return undefined;
    const timer = window.setTimeout(() => setActive((current) => (current + 1) % carouselSlides.length), 5000);
    return () => window.clearTimeout(timer);
  }, [active, isPaused]);
  const move = (direction) => setActive((current) => (current + direction + carouselSlides.length) % carouselSlides.length);
  return (
    <div className="home-view">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />{t.welcome}, {firstName}</span>
          <h1>{t.whatToday}</h1>
          <p>{t.heroText}</p>
          <div className="hero-actions"><button className="primary-button" onClick={onBook}>{t.bookNow}<ArrowLeft size={17} /></button><button className="quiet-button" onClick={onTreatments}>{t.explore}<ArrowLeft size={16} /></button></div>
          <div className="trust-row"><span><ShieldCheck size={16} />{t.professional}</span><span><HeartPulse size={16} />{t.forWomenMen}</span></div>
        </div>
      </section>

      <section className="carousel-section">
        <div className="section-heading"><div><span className="section-kicker">01 / {t.featured}</span><h2>{t.featuredText}</h2></div><div className="carousel-controls"><button className="circle-button" onClick={() => move(-1)} aria-label="Previous"><ChevronRight size={19} /></button><span>{String(active + 1).padStart(2, '0')} <em>/</em> {String(carouselSlides.length).padStart(2, '0')}</span><button className="circle-button" onClick={() => move(1)} aria-label="Next"><ChevronLeft size={19} /></button></div></div>
        <div className={`simple-carousel-slide ${item.id === 'carousel-massage-certificate' ? 'simple-carousel-certificate' : ''}`} onClick={() => setIsPaused(true)} onTouchStart={() => setIsPaused(true)} role="button" tabIndex={0} aria-label={lang === 'he' ? 'לחיצה עוצרת את הקרוסלה' : 'Click to pause carousel'}>
          <img key={item.id} className="simple-carousel-image" src={item.image} alt={item.title[lang]} />
          <div className="simple-carousel-caption"><span className="feature-number">{String(active + 1).padStart(2, '0')}</span><span className="eyebrow">{item.eyebrow[lang]}</span><h3>{item.title[lang]}</h3><p>{item.description[lang]}</p>{item.isCredential ? <span className="credential-label"><ShieldCheck size={16} />{lang === 'he' ? 'הסמכה מוצגת' : 'Credential displayed'}</span> : item.isMessage ? <span className="credential-label"><HeartPulse size={16} />{lang === 'he' ? 'המחויבות שלי אליך' : 'My commitment to you'}</span> : <div className="feature-meta"><span><Clock3 size={15} />{item.duration} {lang === 'he' ? 'דקות' : 'min'}</span><span>{formatCurrency(item.price)}</span></div>}</div>
        </div>
        <div className="carousel-dots">{carouselSlides.map((slide, index) => <button key={slide.id} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={slide.title[lang]} />)}</div>
      </section>

      <section className="home-grid-section"><div className="section-heading compact"><div><span className="section-kicker">02 / {t.why}</span><h2>{t.whyText}</h2></div></div><div className="choice-grid"><button className="choice-card" onClick={onBook}><span className="choice-icon sage"><MapPin size={20} /></span><span><strong>{t.atClinic}</strong><small>{t.atClinicText}</small></span><ArrowLeft size={17} /></button><button className="choice-card" onClick={onBook}><span className="choice-icon blue"><Home size={20} /></span><span><strong>{t.atHome}</strong><small>{t.atHomeText}</small></span><ArrowLeft size={17} /></button></div></section>

      <section className="whatsapp-panel"><div className="whatsapp-symbol"><MessageCircle size={25} /></div><div><strong>{t.whatsappText}</strong><p>Itzik Touch · 054-876-4111</p></div><WhatsAppButton label={t.contact} compact /></section>
    </div>
  );
}

function TreatmentsView({ t, lang, onSelectTreatment }) {
  return <div className="content-view"><PageIntro number="01" title={t.treatments} text={t.chooseTreatmentText} icon={<Sparkles size={22} />} /><div className="treatment-list">{treatments.map((item, index) => <article className={`treatment-row ${item.tone}`} key={item.id}><div className="row-index">0{index + 1}</div><div className="row-art"><img src={item.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><Leaf className="row-fallback" size={30} /></div><div className="row-copy"><span className="eyebrow">{item.eyebrow[lang]}</span><h2>{item.title[lang]}</h2><p>{item.description[lang]}</p><div className="feature-meta"><span><Clock3 size={14} />{item.duration} {lang === 'he' ? 'דקות' : 'min'}</span><strong>{formatCurrency(item.price)}</strong></div></div><button className="row-action" onClick={() => onSelectTreatment(item.id)}><span>{t.bookNow}</span><ArrowLeft size={17} /></button></article>)}</div><div className="professional-note"><ShieldCheck size={22} /><div><strong>{t.professional}</strong><p>{t.professionalText}</p></div></div></div>;
}

function PageIntro({ number, title, text, icon }) {
  return <div className="page-intro"><div className="intro-mark">{icon}</div><span className="section-kicker">{number} / ITZIK TOUCH</span><h1>{title}</h1><p>{text}</p></div>;
}

function BookingView({ t, lang, selectedTreatment, onBack, onSelectTreatment, onSave }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ treatmentId: selectedTreatment, locationType: 'clinic', address: '', distanceKm: 8, iceBath: false, date: '', time: '' });
  const item = treatments.find((treatment) => treatment.id === draft.treatmentId) || treatments[0];
  const travelFee = draft.locationType === 'home' ? openingFee + (Number(draft.distanceKm) || 0) * pricePerKm : 0;
  const total = item.price + travelFee + (draft.iceBath ? 25 : 0);
  const update = (changes) => setDraft((current) => ({ ...current, ...changes }));
  const canContinue = (step === 1 && Boolean(draft.treatmentId)) || (step === 2 && (draft.locationType === 'clinic' || draft.address.trim())) || step === 3 || (step === 4 && draft.date && draft.time);
  const next = () => { if (step < 5) setStep((current) => current + 1); };
  const shareLocation = () => {
    if (!navigator.geolocation) return update({ address: t.locationShared });
    navigator.geolocation.getCurrentPosition((position) => update({ address: `${t.locationShared} · ${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}` }), () => update({ address: t.locationShared }));
  };
  const confirm = () => onSave({ id: `IT-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), status: 'pending', ...draft, title: item.title[lang], price: item.price, travelFee, total });
  const steps = [t.stepTreatment, t.stepLocation, t.stepExtras, t.stepTime, t.stepSummary];
  return <div className="content-view booking-view"><button className="back-link" onClick={onBack}>{<ArrowRight size={17} />} {t.home}</button><PageIntro number="02" title={t.book} text={t.demoNote} icon={<CalendarDays size={22} />} /><div className="stepper">{steps.map((label, index) => <div className={`step ${step > index + 1 ? 'done' : ''} ${step === index + 1 ? 'current' : ''}`} key={label}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><small>{label}</small></div>)}</div>
    {step === 1 && <section className="booking-panel"><h2>{t.chooseTreatment}</h2><p className="panel-subtitle">{t.chooseTreatmentText}</p><div className="selection-list">{treatments.map((treatment) => <button key={treatment.id} className={`selection-card ${draft.treatmentId === treatment.id ? 'selected' : ''}`} onClick={() => { update({ treatmentId: treatment.id }); onSelectTreatment(treatment.id); }}><span className={`selection-art ${treatment.tone}`}><img src={treatment.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} /><Leaf size={25} /></span><span><strong>{treatment.title[lang]}</strong><small>{treatment.duration} {lang === 'he' ? 'דקות' : 'min'} · {formatCurrency(treatment.price)}</small></span>{draft.treatmentId === treatment.id && <Check className="selected-check" size={19} />}</button>)}</div><NavButtons t={t} onBack={onBack} onNext={next} disabled={!canContinue} /></section>}
    {step === 2 && <section className="booking-panel"><h2>{t.chooseLocation}</h2><p className="panel-subtitle">{t.atClinicText} · {t.atHomeText}</p><div className="location-switch"><button className={draft.locationType === 'clinic' ? 'selected' : ''} onClick={() => update({ locationType: 'clinic' })}><MapPin size={19} /><strong>{t.atClinic}</strong><small>{t.atClinicText}</small></button><button className={draft.locationType === 'home' ? 'selected' : ''} onClick={() => update({ locationType: 'home' })}><Home size={19} /><strong>{t.atHome}</strong><small>{t.atHomeText}</small></button></div>{draft.locationType === 'home' && <div className="home-fields"><label>{t.address}<input value={draft.address} onChange={(event) => update({ address: event.target.value })} placeholder={t.addressPlaceholder} /></label><button className="location-button" onClick={shareLocation}><Navigation size={16} />{t.shareLocation}</button><div className="travel-calculator"><label><span>{t.distance}</span><input type="number" min="0" step="0.5" value={draft.distanceKm} onChange={(event) => update({ distanceKm: event.target.value })} /></label><div><span>{t.openingFee}</span><strong>{formatCurrency(openingFee)}</strong></div><div><span>{t.perKm}</span><strong>{formatCurrency(pricePerKm)}</strong></div><div className="calculator-total"><span>{t.travelFee}</span><strong>{formatCurrency(travelFee)}</strong></div></div></div>}<NavButtons t={t} onBack={() => setStep(1)} onNext={next} disabled={!canContinue} /></section>}
    {step === 3 && <section className="booking-panel"><h2>{t.addOns}</h2><p className="panel-subtitle">{t.iceBath}</p><button className={`ice-option ${draft.iceBath ? 'selected' : ''}`} onClick={() => update({ iceBath: !draft.iceBath })}><span className="ice-icon"><Snowflake size={22} /></span><span><strong>{t.iceBath}</strong><small>{t.iceBathPrice}</small></span><span className="checkbox">{draft.iceBath && <Check size={15} />}</span></button><div className="medical-notice"><HeartPulse size={19} /><p>{t.iceNotice}</p></div><PriceMini t={t} item={item} travelFee={travelFee} iceBath={draft.iceBath} total={total} /><NavButtons t={t} onBack={() => setStep(2)} onNext={next} disabled={!canContinue} /></section>}
    {step === 4 && <section className="booking-panel"><h2>{t.chooseDate}</h2><p className="panel-subtitle">{t.available}</p><div className="date-time-grid"><label>{t.date}<input type="date" min={new Date().toISOString().slice(0, 10)} value={draft.date} onChange={(event) => update({ date: event.target.value })} /></label><label>{t.time}<select value={draft.time} onChange={(event) => update({ time: event.target.value })}><option value="">{t.chooseTime}</option>{timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label></div><div className="time-pills"><span>{t.available}</span><div>{timeSlots.map((slot) => <button key={slot} className={draft.time === slot ? 'active' : ''} onClick={() => update({ time: slot })}>{slot}</button>)}</div></div><NavButtons t={t} onBack={() => setStep(3)} onNext={next} disabled={!canContinue} /></section>}
    {step === 5 && <section className="booking-panel summary-panel"><h2>{t.summary}</h2><p className="panel-subtitle">{t.bookingDetails}</p><div className="summary-top"><span className={`summary-icon ${item.tone}`}><Leaf size={25} /></span><div><span className="eyebrow">{item.eyebrow[lang]}</span><h3>{item.title[lang]}</h3><p>{item.duration} {lang === 'he' ? 'דקות' : 'min'} · {formatDate(draft.date, lang)} · {draft.time || '—'}</p></div></div><div className="summary-lines"><div><span>{t.location}</span><strong>{draft.locationType === 'clinic' ? t.locationClinic : t.locationHome}</strong></div>{draft.locationType === 'home' && <div><span>{t.savedAddress}</span><strong>{draft.address || '—'}</strong></div>}<div><span>{t.addOns}</span><strong>{draft.iceBath ? t.iceShort : t.none}</strong></div></div><PriceMini t={t} item={item} travelFee={travelFee} iceBath={draft.iceBath} total={total} /><button className="primary-button full" onClick={confirm}>{t.confirm}<Check size={18} /></button><button className="back-link centered" onClick={() => setStep(4)}>{t.back}</button></section>}
  </div>;
}

function NavButtons({ t, onBack, onNext, disabled }) { return <div className="nav-buttons"><button className="back-link" onClick={onBack}>{<ArrowRight size={16} />} {t.back}</button><button className="primary-button" onClick={onNext} disabled={disabled}>{t.continue}<ArrowLeft size={17} /></button></div>; }
function PriceMini({ t, item, travelFee, iceBath, total }) { return <div className="price-mini"><div><span>{t.treatment}</span><strong>{formatCurrency(item.price)}</strong></div>{travelFee > 0 && <div><span>{t.travelFee}</span><strong>{formatCurrency(travelFee)}</strong></div>}{iceBath && <div><span>{t.iceShort}</span><strong>{formatCurrency(25)}</strong></div>}<div className="total-line"><span>{t.total}</span><strong>{formatCurrency(total)}</strong></div></div>; }

function OrdersView({ t, lang, orders, onBook }) {
  return <div className="content-view"><PageIntro number="03" title={t.ordersTitle} text={t.ordersText} icon={<ShoppingBag size={22} />} />{orders.length === 0 ? <div className="empty-state"><div className="empty-icon"><PackageCheck size={33} /></div><h2>{t.noOrders}</h2><p>{t.noOrdersText}</p><button className="primary-button" onClick={onBook}>{t.firstBooking}<ArrowLeft size={17} /></button></div> : <div className="orders-stack"><div className="orders-heading"><span>{t.upcoming}</span><strong>{orders.length}</strong></div>{orders.map((order) => <article className="order-card" key={order.id}><div className="order-status"><span className="status-dot" />{t.pending}<small>{order.id}</small></div><div className="order-card-main"><span className="summary-icon sage"><Leaf size={22} /></span><div><h2>{order.title}</h2><p><CalendarDays size={14} />{formatDate(order.date, lang)} · <Clock3 size={14} />{order.time}</p><p><MapPin size={14} />{order.locationType === 'clinic' ? t.locationClinic : t.locationHome}</p></div><strong>{formatCurrency(order.total)}</strong></div></article>)}</div>}</div>;
}

function ProfileView({ t, lang, profile, onSave }) {
  const [form, setForm] = useState({ firstName: '', email: '', phone: '', gender: 'woman', avatar: '◒', profileImage: '', password: '', ...profile });
  const update = (changes) => setForm((current) => ({ ...current, ...changes }));
  const upload = (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update({ profileImage: reader.result }); reader.readAsDataURL(file); };
  const submit = (event) => { event.preventDefault(); onSave(form); };
  return <div className="content-view profile-view"><PageIntro number="04" title={t.profileTitle} text={t.profileText} icon={<CircleUserRound size={22} />} /><form className="profile-layout" onSubmit={submit}><section className="profile-card"><div className="profile-visual">{form.profileImage ? <img src={form.profileImage} alt="Profile" /> : <span>{form.avatar}</span>}<label className="image-upload" title={t.upload}><ImagePlus size={16} /><input type="file" accept="image/*" onChange={upload} /></label></div><div><span className="eyebrow">{t.signup}</span><h2>{t.signupHint}</h2></div><div className="avatar-picker"><span className="field-label">{t.avatar}</span><div>{avatars.map((avatar) => <button type="button" key={avatar} className={form.avatar === avatar ? 'selected' : ''} onClick={() => update({ avatar })}>{avatar}</button>)}</div></div></section><section className="profile-form-card"><div className="form-grid"><label>{t.firstName}<input required value={form.firstName} onChange={(event) => update({ firstName: event.target.value })} placeholder={lang === 'he' ? 'איך קוראים לך?' : 'Your first name'} /></label><label>{t.email}<input required type="email" value={form.email} onChange={(event) => update({ email: event.target.value })} placeholder="you@example.com" /></label><label>{t.phone}<input required type="tel" value={form.phone} onChange={(event) => update({ phone: event.target.value })} placeholder="050-0000000" /></label><label>{t.password}<input type="password" minLength="8" value={form.password} onChange={(event) => update({ password: event.target.value })} placeholder={t.passwordHint} /></label></div><div className="gender-field"><span className="field-label">{t.gender}</span><div className="gender-options"><button type="button" className={form.gender === 'woman' ? 'selected' : ''} onClick={() => update({ gender: 'woman' })}>{t.woman}</button><button type="button" className={form.gender === 'man' ? 'selected' : ''} onClick={() => update({ gender: 'man' })}>{t.man}</button></div></div><div className="security-row"><ShieldCheck size={18} /><span><strong>{t.secure}</strong><small>{t.secureText}</small></span></div><button className="primary-button full" type="submit">{t.saveProfile}<Check size={17} /></button></section></form></div>;
}

function Footer({ t }) { return <footer className="footer"><div className="footer-brand"><LogoMark /><div><strong>Itzik Touch</strong><span>{t.footer}</span></div></div><span>© {new Date().getFullYear()} Itzik Touch</span></footer>; }

createRoot(document.getElementById('root')).render(<App />);
