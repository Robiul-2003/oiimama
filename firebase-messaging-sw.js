// এই ফাইলটি ওয়েবসাইটের রুট ডিরেক্টরিতে রাখতে হবে
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB9Ed_6mJEZ_fhITCrf-d9P6KlgpQBLD14",
  authDomain: "robiul-84377.firebaseapp.com",
  projectId: "robiul-84377",
  storageBucket: "robiul-84377.firebasestorage.app",
  messagingSenderId: "476907665212",
  appId: "1:476907665212:web:b4dc619f0290a2241b1039"
});

const messaging = firebase.messaging();

// ব্যাকগ্রাউন্ড বার্তা গ্রহণ (পেজ দৃশ্যমান না থাকা অবস্থায়)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] ব্যাকগ্রাউন্ড বার্তা পাওয়া গেছে: ', payload);

  const notificationTitle = payload.notification?.title || "নতুন বার্তা";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || payload.notification?.image || 'user.png',
    badge: 'user.png',
    data: { url: payload.notification?.click_action || payload.fcmOptions?.link || 'message.html' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// নোটিফিকেশনে ক্লিক করলে পেজ খোলা বা ফোকাস করা
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});