import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFCIKSTX_pS_dXUSWCKt9Cl6M3F1p8BHI",
  authDomain: "seventy-five-44c36.firebaseapp.com",
  projectId: "seventy-five-44c36",
  storageBucket: "seventy-five-44c36.firebasestorage.app",
  messagingSenderId: "1021018345299",
  appId: "1:1021018345299:web:18773a598242ad06ba9ba6",
  measurementId: "G-9EEJH8471G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;