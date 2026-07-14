importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBIePrJ0_bVIUJ06_cfd-tHzBom29OpQSk",
  authDomain: "cvvault-project26.firebaseapp.com",
  projectId: "cvvault-project26",
  storageBucket: "cvvault-project26.firebasestorage.app",
  messagingSenderId: "666493076753",
  appId: "1:666493076753:web:859664a092f53f8a0bb8b0"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
