import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBMjKssyRSZJ16EhSdVOFd2XjIkj8_BT-E",
    authDomain: "twitterclone-47ebf.firebaseapp.com",
    databaseURL: "https://twitterclone-47ebf-default-rtdb.firebaseio.com",
    projectId: "twitterclone-47ebf",
    storageBucket: "twitterclone-47ebf.appspot.com",
    messagingSenderId: "700556014223",
    appId: "1:700556014223:web:a0646158ade0b1e55ab6fa",
    measurementId: "G-0WGJF9H0EL"
};

// Initialize Firebase only if it hasn't been initialized already
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();