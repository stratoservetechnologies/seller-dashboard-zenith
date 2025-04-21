import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

export interface SellerProfile {
  storeName: string;
  storeLocation: string;
  phoneNumber: string;
  email: string;
  uid: string;
}

// Create a new seller profile in Firestore
const createSellerProfile = async (uid: string, profile: Omit<SellerProfile, 'uid'>) => {
  await setDoc(doc(db, 'sellers', uid), {
    ...profile,
    uid,
    createdAt: new Date().toISOString()
  });
};

// Get seller profile from Firestore
export const getSellerProfile = async (uid: string): Promise<SellerProfile | null> => {
  const docRef = doc(db, 'sellers', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as SellerProfile : null;
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  profile: Omit<SellerProfile, 'uid' | 'email'>
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await createSellerProfile(userCredential.user.uid, {
    ...profile,
    email
  });
  return userCredential.user;
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{
  user: User;
  isNewUser: boolean;
}> => {
  const result = await signInWithPopup(auth, googleProvider);
  const profile = await getSellerProfile(result.user.uid);
  
  return {
    user: result.user,
    isNewUser: !profile
  };
};

// Complete Google sign-in profile
export const completeGoogleSignInProfile = async (
  uid: string,
  profile: Omit<SellerProfile, 'uid' | 'email'>
) => {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) throw new Error('Unauthorized');
  
  await createSellerProfile(uid, {
    ...profile,
    email: user.email!
  });
};

// Sign out
export const signOutUser = () => signOut(auth); 