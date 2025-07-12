import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDuRMi3ApwuSg7SkxHPKFrHXozuZvOVN1E",
    authDomain: "wallefy-cc58b.firebaseapp.com",
    databaseURL: "https://wallefy-cc58b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "wallefy-cc58b",
    storageBucket: "wallefy-cc58b.appspot.com",
    messagingSenderId: "103793020236",
    appId: "1:103793020236:web:7d02b9ee651b662e1e93e9"
};

const app = initializeApp(firebaseConfig);

export const getFirebaseDatabase = () => {
    return getDatabase(app)
}

export const getFirebaseAuth = () => {
    return getAuth(app)
}