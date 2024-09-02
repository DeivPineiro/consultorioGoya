"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CalendarPage from '@/components/CalendarPage.jsx';

export default function Calendar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Esperar a que se cargue la sesión

    if (!session || session.user.role.trim() !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Calendar Page</h1>
      <CalendarPage />
    </div>
  );
}
