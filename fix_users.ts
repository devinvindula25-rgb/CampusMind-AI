import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'mock-key',
  authDomain: 'campusmind-mock.firebaseapp.com',
  projectId: 'demo-campusmind',
  storageBucket: 'campusmind-mock.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:mock123'
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log('Fixing users...');
  const snap = await getDocs(collection(db, 'users'));
  const batch: Promise<void>[] = [];
  snap.forEach(d => {
    const data = d.data();
    if (data.isSeeded) return;
    
    // Clear the expertise so they get repatched
    if (data.expertise && data.expertise.length > 0) {
      batch.push(updateDoc(doc(db, 'users', d.id), { expertise: [] }));
    }
  });
  await Promise.all(batch);
  console.log('Fixed ' + batch.length + ' users');
  process.exit(0);
}
run().catch(console.error);
