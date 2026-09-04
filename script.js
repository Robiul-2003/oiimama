 // আপনার অন্যান্য import গুলোর সাথে এটি যোগ করুন
import { App } from '@capacitor/app';
 
 window.vedio = function () {
    document.getElementById("vediocloseo").style.display = "block";
}

window.veclose = function () {
    document.getElementById("vediocloseo").style.display = "none";
}
  window.jobs = function(){
    document.getElementById("job").style.display = "block";
}

  window.jobspost = function (){
    document.getElementById("job").style.display = "none";
}
 const ads = [
  {
    image: "https://scontent-ccu2-1.xx.fbcdn.net/v/t39.30808-6/728449634_122110100901338126_7148938372660986417_n.jpg?stp=dst-jpg_tt6&cstp=mx1340x1785&ctp=s590x590&_nc_cat=109&ccb=1-7&_nc_sid=127cfc&_nc_ohc=WodgzF3GGjYQ7kNvwHCDAei&_nc_oc=AdqCq4slNxGlUg3IABUrYxOTd4pLyxgt1BZd-0N_T_MMXDEY8WWGFCUzjr5PLcv_B-s&_nc_zt=23&_nc_ht=scontent-ccu2-1.xx&_nc_gid=xifN03ZH664BinHOxyiATQ&_nc_ss=7b2a8&oh=00_AQC9q3Dpt2-hdF6q1vNJ9TZ9uDKYzc2y5iA5gVtg1ztmyg&oe=6A5EE6F7",
    link: "https://adarshabd.com/"
  },
  {
    image: "https://scontent.fdac39-1.fna.fbcdn.net/v/t39.30808-6/741236125_122112684753338126_6525279100581457990_n.jpg?stp=dst-jpg_tt6&cstp=mx480x480&ctp=s480x480&_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=ZN2_NOKyHWkQ7kNvwGW4IzO&_nc_oc=AdpQqBLkguXRqS7Hi9ZmBbhXXI0_6bVnjJOUbXAk9BXn3ATz_tYxR_hpeZi9HXRjtkM&_nc_zt=23&_nc_ht=scontent.fdac39-1.fna&_nc_gid=Gdf61c8teh2fT0_5ea_TCA&_nc_ss=7b2a8&oh=00_AQCFp0fl00r6r1RnTVTzMofez-pZ3UtirFKjGzGf_8qs_Q&oe=6A5E7F18",
    link:"https://adarshabd.com/"
  },
  {
    image: "https://www.mobiledokan.co/wp-content/uploads/2023/12/Xiaomi-Redmi-13C-5G-Startrail-Green.webp",
    link: "https://adarshabd.com/"
  }
];

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import {  getFirestore, collection,  addDoc, onSnapshot,  query, orderBy, startAt, endAt,  doc, updateDoc, increment, arrayUnion,  getDoc,  getDocs,  where,  limit, startAfter, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
  import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB9Ed_6mJEZ_fhITCrf-d9P6KlgpQBLD14",
    authDomain: "robiul-84377.firebaseapp.com",
    projectId: "robiul-84377",
    storageBucket: "robiul-84377.firebasestorage.app",
    messagingSenderId: "476907665212",
    appId: "1:476907665212:web:b4dc619f0290a2241b1039"
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app); 
 window.savepost = async function () {

    const post = document.getElementById("post").value.trim();

    if (post === "") {
        alert("Job Post লিখুন");
        return;
    }

    if (!auth.currentUser) {
        alert("আগে Login করুন");
        console.log("Current User:", auth.currentUser);
        return;
    }

    try {

        console.log("Current User:", auth.currentUser);

        let userName = "User";

        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            userName = userSnap.data().name || "User";
        }

        console.log("User Name:", userName);

        const docRef = await addDoc(collection(db, "jobs"), {
            post: post,
            userId: auth.currentUser.uid,
            userName: userName,
            createdAt: new Date()
        });

        console.log("Document ID:", docRef.id);

        alert("Job Post সফলভাবে Save হয়েছে");

        document.getElementById("post").value = "";
        jobspost();

    } catch (error) {

        console.error("Save Error:", error);

        alert(
            "Code: " + error.code +
            "\nMessage: " + error.message
        );

    }

}
  window.checkLogin = async function() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
      alert("দয়া করে ইমেইল এবং পাসওয়ার্ড দুটিই লিখুন!");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert("লগইন সফল হয়েছে! স্বাগতম " + userCredential.user.email);
      proclose(); 
    } catch (error) {
      console.error("Login Error:", error.message);
      alert("ভুল ইমেইল বা পাসওয়ার্ড! আবার চেষ্টা করুন।");
    }
  }

  window.shareVideo = async function() {
    if (!auth.currentUser) {
      alert("ভিডিও শেয়ার করার জন্য আপনাকে প্রথমে লগইন করতে হবে!");
      document.getElementById("productcloseo").style.display = "block"; 
      return;
    }

    let videoLink = document.getElementById("vedioline").value.trim();
    const videoCaption = document.getElementById("caption").value;

    if (videoLink === "") {
      alert("দয়া করে একটি ভিডিও লিংক দিন!");
      return;
    }

    if(videoLink.includes("m.facebook.com")) {
      videoLink = videoLink.replace("m.facebook.com", "www.facebook.com");
    }

    let platform = "other";
    let isValid = false;

    if (videoLink.includes("youtube.com") || videoLink.includes("youtu.be")) {
      platform = "youtube";
      const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoLink.match(ytRegex);
      if (match && match[2].length === 11) isValid = true;
    } 
    else if (videoLink.includes("facebook.com") || videoLink.includes("fb.watch")) {
      platform = "facebook";
      if (videoLink.includes("/videos/") || videoLink.includes("/watch") || videoLink.includes("fb.watch") || videoLink.includes("/posts/")) {
        isValid = true;
      }
    } 
    else if (videoLink.includes("tiktok.com") || videoLink.includes("vm.tiktok.com")) {
      platform = "tiktok";
      if (videoLink.includes("/video/") || videoLink.includes("vm.tiktok.com")) {
        isValid = true;
      }
    } 
    else if (videoLink.includes("instagram.com")) {
      platform = "instagram";
      if (videoLink.includes("/p/") || videoLink.includes("/reel/") || videoLink.includes("/tv/")) {
        isValid = true;
      }
    }

    if (!isValid || platform === "other") {
      alert("Your video link has a problem! দয়া করে একটি সঠিক ও সচল ভিডিও লিংক দিন।");
      return;
    }

    if (platform === "youtube") {
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoLink)}&format=json`);
        if (!response.ok) {
          alert("Your video link has a problem! এই ইউটিউব ভিডিওটি হয়তো ডিলিট বা প্রাইভেট করা।");
          return;
        }
      } catch (err) {
        console.log("CORS/Network restriction, proceeding with caution.");
      }
    }

    try {
      let userName = "User";
      const userRef = doc(db,"users",auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if(userSnap.exists()){
          userName = userSnap.data().name;
      }

      await addDoc(collection(db,"videos"),{
          link: videoLink,
          platform: platform,
          caption: videoCaption,
          userId: auth.currentUser.uid,
          userName: userName,
          createdAt: new Date(),
          likes:0,
          views:0,
          comments:[]
      });

      document.getElementById("vedioline").value = "";
      document.getElementById("caption").value = "";
      veclose(); 
      alert("ভিডিও সফলভাবে পাবলিক করা হয়েছে!");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    }
  }

  window.likeVideo = async function(videoId){
    const user = auth.currentUser;
    if(!user){
     alert("আগে Login করুন");
     return;
    }

    const videoRef = doc(db,"videos",videoId);
    const snap = await getDoc(videoRef);
    let likedUsers = snap.data().likedUsers || {};

    if(likedUsers[user.uid]){
     alert("আপনি আগেই Like করেছেন");
     return;
    }

    likedUsers[user.uid]={
     name:user.displayName || "User",
     email:user.email
    };

    await updateDoc(videoRef,{
     likes:increment(1),
     likedUsers:likedUsers
    });
  }

  window.countView = async function(videoId){
    if(!videoId) return;
    const videoRef = doc(db, "videos", videoId);
    try {
      await updateDoc(videoRef, {
        views: increment(1)
      });
      console.log("View counted for:", videoId);
    } catch(error) {
      console.log("View error:", error);
    }
  }

  window.isAdminMode = false; 

  window.checkAdminPin = function(videoId) {
    if(window.isAdminMode) return;

    const adminPin = "2026"; 
    const userPin = prompt("অ্যাডমিন পিন কোডটি লিখুন:");
    
    if (userPin === adminPin) {
      window.isAdminMode = true; 
      
      const allDeleteButtons = document.querySelectorAll(".admin-delete-btn");
      allDeleteButtons.forEach(btn => {
        btn.style.setProperty("display", "block", "important");
      });
      
      alert("অ্যাডমিন মোড অন হয়েছে! পেজের সব ভিডিওর ডিলিট বাটন চালু হয়েছে।");
    } else if (userPin !== null) {
      alert("ভুল পিন কোড! আবার চেষ্টা করুন।");
    }
  }

  window.deleteVideo = async function(videoId) {
    if (confirm("আপনি কি নিশ্চিত যে এই ভিডিওটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "videos", videoId));
        alert("ভিডিওটি সফলভাবে ডিলিট করা হয়েছে।");
        const card = document.getElementById(`card-${videoId}`);
        if (card) card.remove(); 
      } catch (error) {
        console.error("Error deleting video: ", error);
        alert("ডিলিট করতে সমস্যা হয়েছে! আবার চেষ্টা করুন।");
      }
    }
  }

  window.addComment = async function(videoId) {
    const commentInput = document.getElementById(`commentInput-${videoId}`);
    const commentText = commentInput.value.trim();
    if(commentText === "") return;

    const videoRef = doc(db, "videos", videoId);
    await updateDoc(videoRef, {
      comments: arrayUnion({
        text: commentText,
        time: new Date().toLocaleString()
      })
    });
    commentInput.value = ""; 
  }

  window.shareVideoLink = function(videoId) {
    let videoPage = "https://adarshabd.com/vedio.html?id=" + videoId;
    let websiteLink = "https://adarshabd.com/";

    let shareText =
    "Adarsha BD তে এই ভিডিওটি দেখুন 👇\n\n" +
    videoPage +
    "\n\nআরও ভিডিও দেখতে ভিজিট করুন:\n" +
    websiteLink;

    if(navigator.share){
      navigator.share({
        title:"Adarsha BD Video",
        text:shareText
      })
      .then(()=>{
        console.log("Shared");
      })
      .catch((error)=>{
        console.log(error);
      });
    }else{
      navigator.clipboard.writeText(shareText);
      alert("Video link copy হয়েছে");
    }
  }
  
  // --- INSTANT & INFINITE SCROLL LOADING SYSTEM ---
  const videoFeed = document.getElementById("videoFeed");
  let lastVisibleDoc = null; 
  let isLoading = false; 
  let isNoMoreVideos = false; 
  
  // ভিডিও কাউন্ট ট্র্যাক করার জন্য গ্লোবাল ভেরিয়েবল
  let videoCount = 0; 

  // প্রথম ১০টি ভিডিও ইনস্ট্যান্টলি লোড করার জন্য রিয়েল-টাইম স্ন্যাপশট
  const initialVideosQuery = query(
    collection(db, "videos"), 
    orderBy("createdAt", "desc"), 
    limit(10)
  );

  // পেজ ওপেন হওয়া মাত্রই ক্যাশ অথবা লাইভ থেকে সবচেয়ে দ্রুত ১০টি ভিডিও রেন্ডার হবে
  onSnapshot(initialVideosQuery, (snapshot) => {
    if (!snapshot.empty && !lastVisibleDoc) {
      lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    }

    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();
      const videoId = change.doc.id;

      if (change.type === "added") {
        if (!document.getElementById(`card-${videoId}`)) {
          createVideoCard(videoId, data);
        }
      }
      
      if (change.type === "modified") {
        updateCardUI(videoId, data);
      }

      if (change.type === "removed") {
        const card = document.getElementById(`card-${videoId}`);
        if (card) card.remove();
      }
    });
  });

  // অতিরিক্ত ভিডিওর জন্য ইনফিনিট স্ক্রল লোডার (পরবর্তী ১০টি করে)
  async function loadMoreVideos() {
    if (isLoading || isNoMoreVideos || !lastVisibleDoc) return;
    isLoading = true;

    try {
      const nextQuery = query(
        collection(db, "videos"), 
        orderBy("createdAt", "desc"), 
        startAfter(lastVisibleDoc), 
        limit(10)
      );

      const documentSnapshots = await getDocs(nextQuery);
      
      if (documentSnapshots.empty) {
        isNoMoreVideos = true;
        return;
      }

      lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

      documentSnapshots.forEach((docSnap) => {
        const data = docSnap.data();
        const videoId = docSnap.id;
        if (!document.getElementById(`card-${videoId}`)) {
          createVideoCard(videoId, data);
        }
      });

    } catch (error) {
      console.error("Error loading extra videos: ", error);
    } finally {
      isLoading = false;
    }
  }

  function updateCardUI(videoId, data) {
    const likeSpan = document.getElementById(`likes-${videoId}`);
    const viewSpan = document.getElementById(`views-${videoId}`);
    const commentListDiv = document.getElementById(`commentList-${videoId}`);

    if(likeSpan) likeSpan.innerText = `${data.likes || 0} likes`;
    if(viewSpan) viewSpan.innerHTML = `<i class="fa-solid fa-eye"></i> ${data.views || 0} views`;
    
    if(commentListDiv && data.comments) {
      let updatedCommentsHTML = "";
      data.comments.forEach(c => {
        updatedCommentsHTML += `<p style="margin:4px 0; background:#f1f1f1; padding:6px; border-radius:4px; font-size:13px; color:#555;">${c.text}</p>`;
      });
      commentListDiv.innerHTML = updatedCommentsHTML;
    }
  }

  function createVideoCard(videoId, data) {
    const videoCard = document.createElement("div");
    videoCard.id = `card-${videoId}`;
    videoCard.style.border = "1px solid #ddd";
    videoCard.style.margin = "15px auto";
    videoCard.style.padding = "15px";
    videoCard.style.background = "#fff";
    videoCard.style.borderRadius = "8px";
    videoCard.style.maxWidth = "500px";
    videoCard.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    videoCard.style.position = "relative";

    let videoElement = "";
    
    if (data.link.includes("youtube.com") || data.link.includes("youtu.be")) {
      let embedLink = data.link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
      if(embedLink.includes("shorts/")) embedLink = embedLink.replace("shorts/", "embed/");
      videoElement = `<iframe width="100%" height="300" src="${embedLink}" frameborder="0" allowfullscreen style="border-radius:4px;" loading="lazy"></iframe>`;
    } 
    else if (data.link.includes("facebook.com") || data.link.includes("fb.watch")) {
      let fbEmbedLink = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(data.link)}&show_text=false&width=500`;
      videoElement = `<iframe src="${fbEmbedLink}" width="100%" height="500" style="border:none;overflow:hidden;border-radius:4px;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe>`;
    }
    else if (data.link.includes("instagram.com")) {
      let instaLink = data.link.split('?')[0]; 
      if (!instaLink.endsWith('/')) instaLink += '/';
      videoElement = `<iframe src="${instaLink}embed/" width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true" style="border-radius:4px;" loading="lazy"></iframe>`;
    } 
    else if (data.link.includes("tiktok.com")) {
      let tiktokEmbedLink = `https://www.tiktok.com/embed/v2/${data.link.split('/video/')[1]?.split('?')[0]}`;
      if (!tiktokEmbedLink.includes("undefined")) {
        videoElement = `<iframe src="${tiktokEmbedLink}" width="100%" height="720" frameborder="0" allowfullscreen style="border-radius:4px;" loading="lazy"></iframe>`;
      } else {
        videoElement = `<div style="padding:20px; background:#eee; text-align:center; border-radius:4px;"><p><a href="${data.link}" target="_blank" style="color:#000; font-weight:bold;">Watch TikTok Video</a></p></div>`;
      }
    } 
    else {
      videoElement = `<video id="video-${videoId}" width="100%" height="auto" controls muted loop playsinline style="border-radius:4px;" loading="lazy"><source src="${data.link}" type="video/mp4"></video>`;
    }

    let commentListHTML = "";
    if (data.comments && data.comments.length > 0) {
      data.comments.forEach(c => {
        commentListHTML += `<p style="margin:4px 0; background:#f1f1f1; padding:6px; border-radius:4px; font-size:13px; color:#555;">${c.text}</p>`;
      });
    }

    let currentDisplayState = window.isAdminMode ? "block" : "none";

    videoCard.innerHTML = `
      <span id="deleteBtn-${videoId}" class="admin-delete-btn" onclick="window.deleteVideo('${videoId}')" style="display:${currentDisplayState}; position:absolute; top:10px; right:15px; color:#ff0000; font-size:26px; font-weight:bold; cursor:pointer; z-index:999; background:rgba(255,255,255,0.9); padding:0px 8px; border-radius:50%; box-shadow:0 2px 5px rgba(0,0,0,0.2);">×</span>
      
      <h3 style="margin:5px;">${data.userName || "User"}</h3>
      ${videoElement}
      <p style="padding: 8px 5px; margin:0; font-weight: bold; color:#333;">${data.caption}</p>
      <div style="display:flex; justify-content:space-between; font-size:12px; color:#777; padding:0 5px 8px; border-bottom:1px solid #eee;">
        <span id="likes-${videoId}">${data.likes || 0} likes</span>
        <span id="views-${videoId}" onclick="window.checkAdminPin('${videoId}')" style="cursor:pointer; padding:5px;"><i class="fa-solid fa-eye"></i> ${data.views || 0} views</span>
      </div>
      <div class="count" style="display:flex; justify-content:space-between; padding: 10px 0 5px;">
        <button onclick="likeVideo('${videoId}')" style="flex:1; background:none; border:none; cursor:pointer; color:#007bff; font-weight:bold;"><i class="fa-solid fa-thumbs-up"></i> Like</button>
        <button onclick="document.getElementById('commentBox-${videoId}').style.display='block'" style="flex:1; background:none; border:none; cursor:pointer; color:#555; font-weight:bold;"><i class="fa-solid fa-comment"></i> Comment</button>
        <button onclick="shareVideoLink('${videoId}')" style="flex:1; background:none; border:none; cursor:pointer; color:#28a745; font-weight:bold;">
          <i class="fa-solid fa-share"></i> Share
        </button>
      </div>
      <div id="commentBox-${videoId}" style="display:none; margin-top:10px; border-top:1px solid #f9f9f9; padding-top:10px;">
        <div style="display:flex; gap:5px; margin-bottom:8px;">
          <input type="text" id="commentInput-${videoId}" placeholder="একটি কমেন্ট লিখুন..." style="flex:1; padding:6px; border:1px solid #ccc; border-radius:4px; font-size:13px;">
          <button onclick="addComment('${videoId}')" style="padding:6px 12px; background:#007bff; color:#fff; border:none; border-radius:4px; cursor:pointer; font-size:13px;">Post</button>
        </div>
        <div id="commentList-${videoId}" style="max-height:120px; overflow-y:auto;">
          ${commentListHTML}
        </div>
      </div>
    `;

    videoFeed.appendChild(videoCard);
    
    // ভিডিও সফলভাবে অ্যাড হওয়ার পর কাউন্টার ১ বাড়াবো
    videoCount++;

    // প্রতি ৩টি ভিডিও পর ১টি অ্যাড যোগ করার লজিক
    if (videoCount % 3 === 0) {
      // ads অ্যারে থেকে সিরিয়াল অনুযায়ী অ্যাড সিলেক্ট করা হচ্ছে
      const adIndex = (videoCount / 3 - 1) % ads.length;
      const currentAd = ads[adIndex];
      
      // অ্যাড কার্ড তৈরি
      const adCard = document.createElement("div");
      adCard.className = "clickads";
      adCard.style.margin = "20px auto";
      adCard.style.display = "flex";
      adCard.style.flexDirection = "column";
      adCard.style.alignItems = "center";
      
      adCard.innerHTML = `
        <div style="position:relative; width:100%; max-width:500px; background:#fff; border:1px solid #ddd; border-radius:8px; padding:10px; box-sizing:border-box; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
          <span style="position:absolute; top:5px; right:10px; color:red; font-size:20px; font-weight:bold; cursor:pointer; z-index:10;" onclick="this.parentElement.parentElement.remove()">X</span>
          <span style="background:#ffc107; color:#000; padding:2px 6px; font-size:11px; font-weight:bold; border-radius:3px; position:absolute; top:5px; left:10px;">Sponsored</span>
          <a href="${currentAd.link}" target="_blank" style="text-decoration:none; color:inherit; display:block; margin-top:20px;">
            <img src="${currentAd.image}" style="width:100%; border-radius:6px; display:block;" alt="Advertisement">
            <p style="margin:10px 0 0; font-size:14px; text-align:center; font-weight:bold; color:#333;">Adarsha BD তে 50% আকর্ষণীয় অফার দেখতে ক্লিক করুন!</p>
          </a>
        </div>
      `;
      videoFeed.appendChild(adCard);
    }

    let viewed = false;
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !viewed) {
          window.countView(videoId); 
          viewed = true;
          viewObserver.unobserve(videoCard);
        }
      });
    }, { threshold: 0.15 });

    setTimeout(() => {
      viewObserver.observe(videoCard);
    }, 100);
  }

  window.addEventListener("scroll", () => {
    if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 500) {
      loadMoreVideos();
    }
  });

  
 // মোবাইল সার্চ ইনপুট হ্যান্ডলার
window.searchUserMobile = function () {
  const mobileInput = document.getElementById("ONEsearch").value;
  document.getElementById("search").value = mobileInput;
  window.searchUser();
}

let timer;
window.searchUser = function(){
  clearTimeout(timer);
  timer = setTimeout(async()=>{
    const inputVal = document.getElementById("search").value.trim();
    
    // ভিডিও ফিড যেখানে দেখায়, সেই মেইন কন্টেইনার
    const videoFeed = document.getElementById("videoFeed"); 
    // যদি আপনার সার্চ রেজাল্ট দেখানোর আলাদা কোনো ডিভ থাকে, তবে সেটা এখানে ব্যবহার করতে পারেন
    const result = document.getElementById("userResult"); 

    if(inputVal == ""){
      if(result) result.innerHTML = "";
      // সার্চ খালি করলে পেজ রিফ্রেশ বা নরমাল ফিড লোড করার লজিক রাখতে পারেন
      return;
    }

    // প্রথম অক্ষর বড় হাতের করা (যেমন: robiul -> Robiul), কারণ userName সাধারণত বড় হাতের অক্ষর দিয়ে শুরু হয়
    const text = inputVal.charAt(0).toUpperCase() + inputVal.slice(1);

    try {
      // 'videos' কালেকশন থেকে নির্দিষ্ট userName এর ভিডিও খোঁজা হচ্ছে
     const q = query(
  collection(db, "videos"),
  orderBy("userName"),
  startAt(text),
  endAt(text + "\uf8ff"),
  limit(10)
);
     
      const snap = await getDocs(q);
      
      // পুরাতন ভিডিওগুলো স্ক্রিন থেকে মুছে সার্চ করা ভিডিওগুলো দেখানোর জন্য কন্টেইনার খালি করা
      videoFeed.innerHTML = ""; 
      if(result) result.innerHTML = ""; // ইউজার লিস্টের রেজাল্ট বক্স খালি করা

      if(snap.empty){
        videoFeed.innerHTML = "<div style='padding:20px; text-align:center; color:#555; font-weight:bold;'>এই ইউজারের কোনো ভিডিও পাওয়া যায়নি!</div>";
        return;
      }

      // কাউন্টার রিসেট করা যাতে অ্যাড আবার ৩ নম্বর থেকে শুরু হয়
      videoCount = 0; 

      // ম্যাচ হওয়া প্রতিটা ভিডিওর কার্ড তৈরি করা
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const videoId = docSnap.id;
        
        // আপনার কোডে আগে থেকে থাকা createVideoCard ফাংশনটি কল করা হচ্ছে
        createVideoCard(videoId, data);
      });

    } catch (error) {
      console.error("Search Video Error: ", error);
      alert("সার্চ করার সময় কিছু একটা সমস্যা হয়েছে!");
    }
  }, 300);
}

// Android App/Share Intent থেকে শেয়ার করা লিংক ক্যাচ করা
App.addListener('appUrlOpen', (data) => {
    if (data && data.url) {
        handleIncomingSharedData(data.url);
    }
});

function handleIncomingSharedData(rawText) {
    if (!rawText) return;

    // শেয়ার করা ডাটা থেকে HTTP/HTTPS ভিডিও URL বের করা
    const urlMatches = rawText.match(/(https?:\/\/[^\s]+)/g);

    if (urlMatches && urlMatches.length > 0) {
        const extractedLink = urlMatches[0];

        // ১. ভিডিও শেয়ার করার ডায়ালগ/পপআপ ওপেন হবে
        if (typeof window.vedio === "function") {
            window.vedio();
        }

        // ২. vedioline ইনপুট বক্সে লিংক অটোমেটিক বসে যাবে
        const videoInput = document.getElementById("vedioline");
        if (videoInput) {
            videoInput.value = extractedLink;
        }
    }
}