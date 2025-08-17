// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjWY5VZjJiO2CCYhQmF9Dg4K96oh9o45E",
  authDomain: "mengxi-he-5032-a3.firebaseapp.com",
  projectId: "mengxi-he-5032-a3",
  storageBucket: "mengxi-he-5032-a3.firebasestorage.app",
  messagingSenderId: "429108840885",
  appId: "1:429108840885:web:5d89823ef38b6a310731fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export them for use in other files
export { auth, db };