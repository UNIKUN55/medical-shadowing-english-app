import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJgRawkbyKD1OaHPEa819DQ7oI1rsjo2c",
  authDomain: "medical-english-shadowing-app.firebaseapp.com",
  projectId: "medical-english-shadowing-app",
  storageBucket: "medical-english-shadowing-app.firebasestorage.app",
  messagingSenderId: "909768823641",
  appId: "1:909768823641:web:22a34a0353899122d3f248"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);