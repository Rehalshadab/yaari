"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { listenToUser, setUserOnline } from "@/lib/firestore";

interface UserData {
  uid: string; displayName: string; email: string; phone: string;
  gender: "male" | "female"; photoURL: string; bio: string;
  coins: number; earnings: number; totalEarned: number;
  totalMinutes: number; callCount: number; isActive: boolean;
  activeModes: { audio: boolean; video: boolean };
  upiId?: string; totalWithdrawn?: number; totalSpent?: number;
  createdAt: number;
}

interface AuthContextType {
  user: User | null; userData: UserData | null; loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, userData: null, loading: true, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
      if (!fbUser) { setUserData(null); setLoading(false); }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToUser(user.uid, (data) => {
      setUserData(data as UserData);
      setLoading(false);
    });
    setUserOnline(user.uid, true);
    const handleBefore = () => setUserOnline(user.uid, false);
    window.addEventListener("beforeunload", handleBefore);
    return () => { unsub(); setUserOnline(user.uid, false); window.removeEventListener("beforeunload", handleBefore); };
  }, [user]);

  const signOut = async () => {
    if (user) await setUserOnline(user.uid, false);
    await firebaseSignOut(auth);
    setUser(null); setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
