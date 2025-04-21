
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

type SellerProfile = {
  storeName: string;
  location: string;
  phone: string;
  email: string;
  photoURL?: string;
}

type AuthContextType = {
  currentUser: User | null;
  userProfile: SellerProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: SellerProfile) => Promise<void>;
  isProfileComplete: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<SellerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const profileRef = doc(db, "sellers", user.uid, "profile", "info");
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data() as SellerProfile);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check if user profile is complete
  const isProfileComplete = !!userProfile && !!userProfile.storeName && !!userProfile.location && !!userProfile.phone;

  // Login with email and password
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Register with email and password
  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  // Login with Google
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Update user profile
  const updateUserProfile = async (profile: SellerProfile) => {
    if (!currentUser) throw new Error("No user logged in");
    
    const profileRef = doc(db, "sellers", currentUser.uid, "profile", "info");
    await setDoc(profileRef, profile);
    setUserProfile(profile);
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
    isProfileComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
