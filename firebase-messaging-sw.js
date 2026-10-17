importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB9Ed_6mJEZ_fhITCrf-d9P6KlgpQBLD14",
  projectId: "robiul-84377",
  messagingSenderId: "476907665212",
  appId: "1:476907665212:web:b4dc619f0290a2241b1039"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'user.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});