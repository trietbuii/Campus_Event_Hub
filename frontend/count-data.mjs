import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCO7Df6O8JXuNrzxYNi4yNTXYTJXGkeaoo",
  authDomain: "miniproject-5b8cf.firebaseapp.com",
  projectId: "miniproject-5b8cf",
  storageBucket: "miniproject-5b8cf.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function count() {
  for (const col of ['events', 'tickets', 'users', 'permissions', 'notifications']) {
    try {
      const snap = await getDocs(collection(db, col));
      console.log(`${col}: ${snap.size}`);
    } catch(e) {
      console.log(`${col}: error ${e.message}`);
    }
  }
  process.exit(0);
}
count();
