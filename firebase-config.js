// firebase-config.js
// This file contains Firebase configuration


const firebaseConfig = {
    apiKey: "AIzaSyDH1sF1FEasvvisSp-B8m2ETk2N5L4rZq8",
    authDomain: "business-pro-d657d.firebaseapp.com",
    projectId: "business-pro-d657d",
    storageBucket: "business-pro-d657d.firebasestorage.app",
    messagingSenderId: "200900065407",
    appId: "1:200900065407:web:1f476c5ecab0fe59b6a74a",
    measurementId: "G-ZM7PHG8FRM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Enable offline persistence (call ONCE only)
db.enablePersistence({ synchronizeTabs: true })
    .then(() => console.log("✅ Persistence enabled"))
    .catch(err => console.log("Persistence note:", err.code));


/
