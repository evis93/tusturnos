'use client';

import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { profile } = useAuth(); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!favicon) return;
    if (profile?.logoUrl) {
      favicon.href = profile.logoUrl;
    } else {
      favicon.href = '/icon.png';
    }
    return () => { favicon.href = '/icon.png'; };
  }, [profile?.logoUrl]);

  return (
    <div className="flex min-h-screen" style={{ background: colors.background }}>
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
