import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDVS6R5Uprqq_rR9xPTG8Yeki9yJddBa1I",
  authDomain: "lakeland-fellowship.firebaseapp.com",
  projectId: "lakeland-fellowship",
  storageBucket: "lakeland-fellowship.firebasestorage.app",
  messagingSenderId: "235799556028",
  appId: "1:235799556028:web:c48b6c170914cd1e8e85b9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
