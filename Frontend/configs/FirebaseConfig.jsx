// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyD7aN5ISZIhlL6hgHIL0jW_RHEJ7O_09ss",
  authDomain: "face-detection-3c2bf.firebaseapp.com",
  projectId: "face-detection-3c2bf",
  storageBucket: "face-detection-3c2bf.firebasestorage.app",
  messagingSenderId: "348867929261",
  appId: "1:348867929261:web:e249bf8de385a5cbc21224"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);