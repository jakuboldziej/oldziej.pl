import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsOszsVqRDH6bc5scKr3B2d_DfJI_wM1E",
  authDomain: "homeserver-ef816.firebaseapp.com",
  projectId: "homeserver-ef816",
  storageBucket: "homeserver-ef816.appspot.com",
  messagingSenderId: "670759426663",
  appId: "1:670759426663:web:a87cbfe3e186ea9c90d2c2",
  measurementId: "G-MBLF9SX6XN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.log(err)
})