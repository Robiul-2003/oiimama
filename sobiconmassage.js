
import {
  initializeApp,
  getApp,
  getApps
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getMessaging,
  getToken,
  onMessage,
  isSupported
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";


const firebaseConfig = {
  apiKey: "AIzaSyB9Ed_6mJEZ_fhITCrf-d9P6KlgpQBLD14",
  authDomain: "robiul-84377.firebaseapp.com",
  projectId: "robiul-84377",
  storageBucket: "robiul-84377.firebasestorage.app",
  messagingSenderId: "476907665212",
  appId: "1:476907665212:web:b4dc619f0290a2241b1039"
};

const VAPID_KEY = "BGhwKO6KN6oSk7S8DqjF4xUzJudhektpCkqP8MlkpEP3WyyaXyZ5IAsVYR0wnhxaeD99E0A9bpxLN0gVjPHAE-I";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let messaging = null;
let unsubscribeChats = null;
let unsubscribeUnread = null;

function updateMsgBadge(count) {
  const badge = document.getElementById("msgBadge");
  if (!badge) return;

  const total = Math.max(0, Number(count) || 0);
  badge.textContent = total > 99 ? "99+" : String(total);
  badge.style.display = total > 0 ? "flex" : "none";
}

function listenUnreadCount(uid) {
  if (unsubscribeUnread) {
    unsubscribeUnread();
  }

  const chatsQuery = query(
    collection(db, "chats"),
    where("members", "array-contains", uid)
  );

  unsubscribeUnread = onSnapshot(
    chatsQuery,
    (snapshot) => {
      let total = 0;
      snapshot.forEach((chatDoc) => {
        const data = chatDoc.data();
        const unreadCount = data.unreadCount;
        if (unreadCount && typeof unreadCount[uid] === "number") {
          total += Math.max(0, unreadCount[uid]);
        }
      });
      updateMsgBadge(total);
    },
    (error) => {
      console.error("Unread count error:", error);
    }
  );
}

function loadChats(uid) {
  if (unsubscribeChats) {
    unsubscribeChats();
  }

  const chatsQuery = query(
    collection(db, "chats"),
    where("members", "array-contains", uid)
  );

  unsubscribeChats = onSnapshot(
    chatsQuery,
    (snapshot) => {
      const box = document.getElementById("chatList");
      if (!box) return;

      if (snapshot.empty) {
        box.innerHTML = `<p style="padding:20px;text-align:center;color:#888">No chats yet</p>`;
        return;
      }

      const chats = [];
      snapshot.forEach((chatDoc) => {
        chats.push({
          id: chatDoc.id,
          ...chatDoc.data()
        });
      });

      // ✅ বিয়োগফলের মাধ্যমে সঠিক সর্টিং
      chats.sort((a, b) => {
        const timeA = a.lastTime?.toMillis ? a.lastTime.toMillis() : 0;
        const timeB = b.lastTime?.toMillis ? b.lastTime.toMillis() : 0;
        return timeB - timeA;
      });

      box.replaceChildren();

      chats.forEach((chat) => {
        const otherUid = (chat.members || []).find(
          (memberUid) => memberUid !== uid
        );

        const other = chat.membersInfo?.[otherUid] || {};
        const unread = Number(chat.unreadCount?.[uid]) || 0;

        const item = document.createElement("div");
        item.className = "chat-item";

        const avatar = document.createElement("img");
        avatar.src = "user.png";
        avatar.alt = "User";

        const info = document.createElement("div");
        info.className = "info";

        const name = document.createElement("h4");
        name.textContent = other.name || "User";

        const preview = document.createElement("p");
        preview.textContent = chat.lastMessage || chat.productName || "";

        if (unread > 0) {
          name.style.fontWeight = "bold";
          preview.style.fontWeight = "bold";
        }

        info.append(name, preview);

        const right = document.createElement("div");
        right.style.textAlign = "right";
        right.style.display = "flex";
        right.style.flexDirection = "column";
        right.style.alignItems = "flex-end";

        const time = document.createElement("div");
        time.className = "time" + (unread > 0 ? " unread-time" : "");
        time.textContent = chat.lastTime?.toDate
          ? chat.lastTime.toDate().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })
          : "";

        right.appendChild(time);

        if (unread > 0) {
          const redDot = document.createElement("div");
          redDot.className = "red-dot";
          right.appendChild(redDot);
        }

        item.append(avatar, info, right);

        item.addEventListener("click", () => {
          location.href = "chat.html?chatId=" + encodeURIComponent(chat.id);
        });

        box.appendChild(item);
      });
    },
    (error) => {
      console.error("Chat list error:", error);
    }
  );
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  } catch (error) {
    console.error("Service worker error:", error);
    return null;
  }
}

async function setupNotifications(uid) {
  try {
    if (!("Notification" in window)) return;
    if (!("serviceWorker" in navigator)) return;
    if (Notification.permission === "denied") return;

    const supported = await isSupported();
    if (!supported) return;

    messaging = getMessaging(app);

    onMessage(messaging, (payload) => {
      console.log("Foreground message:", payload);
    });

    if (Notification.permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (token) {
      await setDoc(
        doc(db, "users", uid),
        { fcmToken: token },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Notification setup error:", error);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    updateMsgBadge(0);
    location.href = "login.html";
    return;
  }

  loadChats(user.uid);
  listenUnreadCount(user.uid);

  await registerServiceWorker();
  await setupNotifications(user.uid);
});