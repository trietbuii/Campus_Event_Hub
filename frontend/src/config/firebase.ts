import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCO7Df6O8JXuNrzxYNi4yNTXYTJXGkeaoo",
  authDomain: "miniproject-5b8cf.firebaseapp.com",
  projectId: "miniproject-5b8cf",
  storageBucket: "miniproject-5b8cf.firebasestorage.app",
  messagingSenderId: "980828751150",
  appId: "1:980828751150:web:ad99b2ea48efba15ade6bf",
  measurementId: "G-RCW4X62DWV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
