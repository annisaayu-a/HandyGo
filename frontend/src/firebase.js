import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-Fk4OHbt5LJbtkgIr5IbyW8qfBIvOEiY",
  authDomain: "handygo-otp.firebaseapp.com",
  projectId: "handygo-otp",
  storageBucket: "handygo-otp.firebasestorage.app",
  messagingSenderId: "717294774204",
  appId: "1:717294774204:web:cb0ae7aa010fcb0f53adb9",
  measurementId: "G-GFV0JZFZQB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
