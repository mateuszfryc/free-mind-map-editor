import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyA0xg08cPmd5HoqFYiiIH_xBay3KH7rSrA',
  authDomain: 'idea-map-editor.firebaseapp.com',
  projectId: 'idea-map-editor',
  storageBucket: 'idea-map-editor.appspot.com',
  messagingSenderId: '817561740461',
  appId: '1:817561740461:web:b9ae59ea2f289da09e1224',
  measurementId: 'G-SJDJ67VZZ0',
};

// init firebase app
initializeApp(firebaseConfig);

// init services
const dataBaseRef = getFirestore();

// collection reference
const mindMapsCollectionReference = collection(dataBaseRef, 'mindmaps');

// get collection data
export async function getMindMaps() {
  try {
    const snapshot = await getDocs(mindMapsCollectionReference);
    const mindMaps: any[] = [];
    snapshot?.docs?.forEach((document) => {
      mindMaps.push({ ...document.data(), id: document.id });
    });
    // console.log('mindMaps ------------------------------', mindMaps);
  } catch (error) {
    console.log('error ------------------------------', error);
  }
}

export async function addMindMap() {
  await addDoc(mindMapsCollectionReference, {
    id: '091872305987235',
    name: 'why me',
    title: Date.now().toString(),
    createdAt: serverTimestamp(),
  });
}

export async function deleteMindMap() {
  const docRef = doc(dataBaseRef, 'mindmaps', '0G4Z7BzoCTcscpAnhWmY');
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.log('error ------------------------------', error);
  }
}

export function subscribeToCollection() {
  onSnapshot(mindMapsCollectionReference, (snapshot) => {
    const mindMaps: any[] = [];
    snapshot?.docs?.forEach((document) => {
      mindMaps.push({ ...document.data(), id: document.id });
    });
    console.log(mindMaps);
  });
}

const findByNameQuery = query(mindMapsCollectionReference, where('name', '==', 'why me'), orderBy('title'));

export function subscribeToCollectionQuery() {
  onSnapshot(findByNameQuery, (snapshot) => {
    const mindMaps: any[] = [];
    snapshot?.docs?.forEach((document) => {
      mindMaps.push({ ...document.data(), id: document.id });
    });
    // console.log('why me maps', mindMaps);
  });
}

const id = 'KJjT1dY1vlLAqpxYwTkY';
const docRef = doc(dataBaseRef, 'mindmaps', id);
export async function getSingleDocument() {
  const data = await getDoc(docRef);
  //   console.log('single doc', data.data(), data.id === id);
}

export function subscribeToSingleDocument() {
  const unsubscribeToDocument = onSnapshot(docRef, (data) => {
    // console.log('single doc update', data.data(), data.id === id);
  });

  // call unsubscribeToDocument to remove subscription
}

export async function updateSingleDocument() {
  const data = await getDoc(docRef);
  const { title } = data.data() as { title: string };
  await updateDoc(docRef, {
    title: `${title} + ${title}`,
  });
}

const auth = getAuth();

export async function createUser() {
  try {
    const credentialObject = await createUserWithEmailAndPassword(auth, 'mateuszfryc@gmail.com', '09asdfpojk2390');
    // console.log('new user ------------------------------', credentialObject, credentialObject.user);
  } catch (error) {
    console.log('new user error ------------------------------', error);
  }
}

export async function logUserOut() {
  try {
    await signOut(auth);
    // console.log('user logged out ------------------------------');
  } catch (error) {
    console.log('user logged error ------------------------------', error);
  }
}

export async function logUserIn() {
  try {
    const credentialObject = await signInWithEmailAndPassword(auth, 'mateuszfryc@gmail.com', '09asdfpojk2390');
    // console.log('user logged in ------------------------------', credentialObject, credentialObject.user);
  } catch (error) {
    console.log('user logged error ------------------------------', error);
  }
}

export function subscribeToAuthChange() {
  onAuthStateChanged(
    auth,
    (user) => {
      console.log('auth subscription ------------------------------', user);
    },
    (error) => {
      console.log('user error ------------------------------', error);
    },
  );
}
