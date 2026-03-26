import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  updatePassword,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface CustomChallenge {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface AuthContextType {
  user: User | null;
  userData: any;
  loading: boolean;
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateChallenges: (challenges: string[]) => Promise<void>;
  addCustomChallenge: (challenge: CustomChallenge) => Promise<void>;
  changeUsername: (newUsername: string) => Promise<void>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setUserData(snap.data());
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async (username: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: username });
    await setDoc(doc(db, 'users', cred.user.uid), {
      username,
      email,
      challenges: [],
      customChallenges: [],
      createdAt: new Date().toISOString(),
      startDate: null,
    });
    setUserData({ username, email, challenges: [], customChallenges: [], startDate: null });
  };

  const login = async (emailOrUsername: string, password: string) => {
    await signInWithEmailAndPassword(auth, emailOrUsername, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateChallenges = async (challenges: string[]) => {
    if (!user) return;
    const startDate = userData?.startDate || new Date().toISOString();
    await setDoc(doc(db, 'users', user.uid), { challenges, startDate }, { merge: true });
    setUserData((prev: any) => ({ ...prev, challenges, startDate }));
  };

  const addCustomChallenge = async (challenge: CustomChallenge) => {
    if (!user) return;
    const existing: CustomChallenge[] = userData?.customChallenges || [];
    const newCustom = [...existing, challenge];
    const newChallenges = [...(userData?.challenges || []), challenge.id];
    await setDoc(doc(db, 'users', user.uid), {
      customChallenges: newCustom,
      challenges: newChallenges,
    }, { merge: true });
    setUserData((prev: any) => ({
      ...prev,
      customChallenges: newCustom,
      challenges: newChallenges,
    }));
  };

  const changeUsername = async (newUsername: string) => {
    if (!user) return;
    // Check uniqueness
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', newUsername));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error('USERNAME_TAKEN');
    await updateProfile(user, { displayName: newUsername });
    await setDoc(doc(db, 'users', user.uid), { username: newUsername }, { merge: true });
    setUserData((prev: any) => ({ ...prev, username: newUsername }));
    setUser({ ...user, displayName: newUsername } as User);
  };

  const changeEmail = async (newEmail: string, currentPassword: string) => {
    if (!user || !user.email) return;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updateEmail(user, newEmail);
    await setDoc(doc(db, 'users', user.uid), { email: newEmail }, { merge: true });
    setUserData((prev: any) => ({ ...prev, email: newEmail }));
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) return;
    // Validate
    if (newPassword.length < 8) throw new Error('PASSWORD_TOO_SHORT');
    if (!/[A-Z]/.test(newPassword)) throw new Error('PASSWORD_NO_UPPERCASE');
    if (!/[a-z]/.test(newPassword)) throw new Error('PASSWORD_NO_LOWERCASE');
    if (!/[0-9]/.test(newPassword)) throw new Error('PASSWORD_NO_NUMBER');
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    // Send verification email as notification
    await sendEmailVerification(user);
  };

  return (
    <AuthContext.Provider value={{
      user, userData, loading,
      register, login, logout, updateChallenges, addCustomChallenge,
      changeUsername, changeEmail, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
