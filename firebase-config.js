// firebase-config.js
// This file contains Firebase configuration

const firebaseConfig = {
    apiKey: document.documentElement.getAttribute('data-firebase-api-key'),
    authDomain: document.documentElement.getAttribute('data-firebase-auth-domain'),
    projectId: document.documentElement.getAttribute('data-firebase-project-id'),
    storageBucket: document.documentElement.getAttribute('data-firebase-storage-bucket'),
    messagingSenderId: document.documentElement.getAttribute('data-firebase-messaging-sender-id'),
    appId: document.documentElement.getAttribute('data-firebase-app-id')
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
