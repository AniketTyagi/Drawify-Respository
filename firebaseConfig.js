// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFmSpjRO2HqWqG1VN10PC7DFyZptjsAiY",
  authDomain: "drawify-c2b73.firebaseapp.com",
  projectId: "drawify-c2b73",
  storageBucket: "drawify-c2b73.appspot.com",
  messagingSenderId: "901440284138",
  appId: "1:901440284138:web:58882aae7b6c2ac837fe93",
  measurementId: "G-5MR6X7Y47J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
// const analytics = getAnalytics(app);

