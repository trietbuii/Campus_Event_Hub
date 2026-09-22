import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@config/firebase';

export interface UserData {
  uid: string;
  name: string;
  displayName: string;
  initials: string;
  avatar: string | null;
  studentId: string;
  faculty: string;
  email: string;
  phone: string;
  role: string;
}

export function buildDisplayName(name: string): string {
  if (!name) return 'User';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 3) return parts.slice(-2).join(' ');
  if (parts.length === 2) return parts[1];
  return parts[0];
}

export function buildInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  updateUser: (patch: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user metadata from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const name = data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            setUser({
              uid: firebaseUser.uid,
              name: name,
              displayName: buildDisplayName(name),
              initials: buildInitials(name),
              avatar: data.avatar || null,
              studentId: data.studentId || '',
              faculty: data.faculty || '',
              email: firebaseUser.email || '',
              phone: data.phone || '',
              role: data.role || 'student',
            });
          } else {
            // Document doesn't exist, use basic info
            const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
            setUser({
              uid: firebaseUser.uid,
              name: name,
              displayName: buildDisplayName(name),
              initials: buildInitials(name),
              avatar: null,
              studentId: '',
              faculty: '',
              email: firebaseUser.email || '',
              phone: '',
              role: 'student',
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  function updateUser(patch: Partial<UserData>) {
    setUser(prev => {
      if (!prev) return null;
      const name = patch.name ?? prev.name;
      return {
        ...prev,
        ...patch,
        name,
        displayName: buildDisplayName(name),
        initials: buildInitials(name),
      };
    });
  }

  return <UserContext.Provider value={{ user, loading, updateUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
