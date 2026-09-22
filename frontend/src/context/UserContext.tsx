import { createContext, useContext, useState } from 'react';

export interface UserData {
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

function buildDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 3) return parts.slice(-2).join(' ');
  if (parts.length === 2) return parts[1];
  return parts[0];
}

function buildInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

const DEFAULT_USER: UserData = {
  name: 'Cao Duy Anh',
  displayName: 'Duy Anh',
  initials: 'DA',
  avatar: null,
  studentId: '22521001',
  faculty: 'Công nghệ Thông tin',
  email: 'caoduyanh@uit.edu.vn',
  phone: '0901 234 567',
  role: 'Sinh viên',
};

interface UserContextType {
  user: UserData;
  updateUser: (patch: Partial<UserData>) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>(DEFAULT_USER);

  function updateUser(patch: Partial<UserData>) {
    setUser(prev => {
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

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
