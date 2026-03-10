import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBlg_i4AY0xF0CT_JSY8vdo72aMBD_HpDPQ',
  authDomain: 'documind-ai-300cb.firebaseapp.com',
  projectId: 'documind-ai-300cb',
  storageBucket: 'documind-ai-300cb.firebasestorage.app',
  messagingSenderId: '160114800997',
  appId: '1:160114800997:web:a20395735a292bb3f1898c',
}

// Initialize Firebase app once for the frontend.
const app = initializeApp(firebaseConfig)

// Export Firestore so pages/components can read and write document data.
export const db = getFirestore(app)