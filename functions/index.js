const { setGlobalOptions } = require("firebase-functions");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({
  region: "asia-southeast1",
  maxInstances: 3
});

const BUNNY_LIBRARY_ID = defineSecret("BUNNY_LIBRARY_ID");
const BUNNY_CDN_HOSTNAME = defineSecret("BUNNY_CDN_HOSTNAME");
const BUNNY_API_KEY = defineSecret("BUNNY_API_KEY");

const db = admin.firestore();
const TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";

// ================= CHAT PUSH NOTIFICATION =================

exports.sendChatNotification = onDocumentCreated(
  "chats/{chatId}/messages/{messageId}",
  async (event) => {
    try {
      if (!event.data) return;

      const message = event.data.data();
      const chatId = event.params.chatId;
      const senderUid = message.sender;
      const messageText = String(message.text || "নতুন মেসেজ");

      if (!senderUid) return;

      const chatSnap = await db.collection("chats")
        .doc(chatId).get();

      if (!chatSnap.exists) return;

      const chatData = chatSnap.data();
      const receiverUid = (chatData.members || [])
        .find(uid => uid !== senderUid);

      if (!receiverUid) return;

      const userSnap = await db.collection("users")
        .doc(receiverUid).get();

      if (!userSnap.exists) return;

      const fcmToken = userSnap.data().fcmToken;
      if (!fcmToken) return;

      const senderName =
        chatData.membersInfo?.[senderUid]?.name || "ADARSHA BD";

      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: senderName,
          body: messageText.substring(0, 200)
        },
        data: {
          type: "chat",
          chatId: String(chatId),
          senderUid: String(senderUid)
        },
        android: { priority: "high" }
      });

      logger.info("Chat notification sent", { receiverUid });

    } catch (error) {
      logger.error("Chat notification failed", error);
    }
  }
);

// ================= CREATE BUNNY VIDEO =================

exports.createBunnyVideo = onCall(
  {
    secrets: [
      BUNNY_LIBRARY_ID,
      BUNNY_CDN_HOSTNAME,
      BUNNY_API_KEY
    ]
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const uid = request.auth.uid;
   const caption = String(request.data?.caption || "").trim();

if (caption.length > 2000) {
    throw new HttpsError(
        "invalid-argument",
        "Caption maximum 2000 characters."
    );
}

  

   const libraryId = BUNNY_LIBRARY_ID.value().trim();
   const apiKey = BUNNY_API_KEY.value().trim();
   const hostname = BUNNY_CDN_HOSTNAME.value().trim();

    let videoId = null;

    try {
      const userSnap = await db.collection("users").doc(uid).get();
      const userName = userSnap.exists
        ? userSnap.data().name || "ADARSHA BD"
        : "ADARSHA BD";

      // Create empty video in Bunny
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        {
          method: "POST",
          headers: {
            AccessKey: apiKey,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
    title: (caption || "ADARSHA BD Video").substring(0, 200)
})
        }
      );

     if (!response.ok) {
  const errorBody = await response.text();

  logger.error("Bunny create failed", {
    status: response.status,
    body: errorBody,
    libraryId
  });

  throw new HttpsError(
    "internal",
    `Bunny API error: ${response.status}`
  );
}

      const bunnyVideo = await response.json();
      videoId = bunnyVideo.guid;

      if (!videoId) {
        throw new HttpsError("internal", "Bunny video ID missing.");
      }

      // Generate TUS authorization
      const expirationTime = Math.floor(Date.now() / 1000) + 86400;

      const signature = crypto
        .createHash("sha256")
        .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
        .digest("hex");

      const videoUrl =
        `https://${hostname}/${videoId}/playlist.m3u8`;

      // Save metadata only. No video file goes to Firebase.
      await db.collection("videos").doc(videoId).set({
        videoId,
        videoUrl,
        embedUrl:
          `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`,
        caption,
        userId: uid,
        userName,
        provider: "bunny",
        uploadStatus: "uploading",
        bunnyStatus: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        likeCount: 0,
        viewCount: 0
      });

      return {
        videoId,
        libraryId,
        expirationTime,
        signature,
        tusEndpoint: TUS_ENDPOINT
      };

    } catch (error) {
      // If Firestore save failed, remove the empty Bunny video.
      if (videoId) {
        await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
          {
            method: "DELETE",
            headers: { AccessKey: apiKey }
          }
        ).catch(() => {});
      }

      logger.error("Create Bunny video error", error);

      if (error instanceof HttpsError) throw error;

      throw new HttpsError("internal", "Could not create video.");
    }
  }
);

// ================= COMPLETE BUNNY UPLOAD =================

exports.completeBunnyVideo = onCall(
  {
    secrets: [BUNNY_LIBRARY_ID, BUNNY_API_KEY]
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const uid = request.auth.uid;
    const videoId = String(request.data?.videoId || "");

    if (!/^[a-f0-9-]{20,50}$/i.test(videoId)) {
      throw new HttpsError("invalid-argument", "Invalid video ID.");
    }

    const videoRef = db.collection("videos").doc(videoId);
    const videoSnap = await videoRef.get();

    if (!videoSnap.exists || videoSnap.data().userId !== uid) {
      throw new HttpsError("permission-denied", "Video not owned by you.");
    }

   const libraryId = BUNNY_LIBRARY_ID.value().trim();
   const apiKey = BUNNY_API_KEY.value().trim();

    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        {
          headers: {
            AccessKey: apiKey,
            Accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new HttpsError(
          "unavailable",
          "Could not check Bunny upload."
        );
      }

      const bunnyVideo = await response.json();
      const status = Number(bunnyVideo.status);

      // 7 = TUS upload finished.
      // 1-4 = Uploaded / processing / encoding / playable.
      if (![1, 2, 3, 4, 7, 9, 10].includes(status)) {
        throw new HttpsError(
          "failed-precondition",
          "Bunny upload is not confirmed complete yet."
        );
      }

      await videoRef.update({
        uploadStatus: "uploaded",
        bunnyStatus: status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, bunnyStatus: status };

    } catch (error) {
      logger.error("Complete Bunny upload error", error);

      if (error instanceof HttpsError) throw error;

      throw new HttpsError("internal", "Could not complete upload.");
    }
  }
);

// ================= DELETE BUNNY VIDEO =================

exports.deleteBunnyVideo = onCall(
  {
    secrets: [BUNNY_LIBRARY_ID, BUNNY_API_KEY]
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Login required.");
    }

    const uid = request.auth.uid;
    const videoId = String(request.data?.videoId || "");

    if (!/^[a-f0-9-]{20,50}$/i.test(videoId)) {
      throw new HttpsError("invalid-argument", "Invalid video ID.");
    }

    const videoRef = db.collection("videos").doc(videoId);
    const videoSnap = await videoRef.get();

    if (!videoSnap.exists || videoSnap.data().userId !== uid) {
      throw new HttpsError(
        "permission-denied",
        "You cannot delete another user's video."
      );
    }

   const libraryId = BUNNY_LIBRARY_ID.value().trim();
   const apiKey = BUNNY_API_KEY.value().trim();

    try {
      // Delete the actual video from Bunny first.
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        {
          method: "DELETE",
          headers: { AccessKey: apiKey }
        }
      );

      if (!response.ok && response.status !== 404) {
        logger.error("Bunny delete failed", await response.text());
        throw new HttpsError(
          "internal",
          "Could not delete video from Bunny."
        );
      }

      // Then delete its Firebase metadata.
     // Delete top-level likes and views
await deleteVideoRelatedDocs("videoLikes", videoId);
await deleteVideoRelatedDocs("videoViews", videoId);

// Delete video document and nested comments
await db.recursiveDelete(videoRef);

      return { success: true };

    } catch (error) {
      logger.error("Delete Bunny video error", error);

      if (error instanceof HttpsError) throw error;

      throw new HttpsError("internal", "Could not delete video.");
    }
  }
);
// Delete all matching documents in a top-level collection
async function deleteVideoRelatedDocs(collectionName, videoId) {
  const ref = db.collection(collectionName);

  while (true) {
    const snapshot = await ref
      .where("videoId", "==", videoId)
      .limit(400)
      .get();

    if (snapshot.empty) break;

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}