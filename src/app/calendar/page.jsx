"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CalendarPage from '@/components/CalendarPage.jsx';

export default function Calendar() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; 

    if (!session || session.user.role.trim() !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className='calendarPage'>
      <h1 className='invisible'>Página calendario</h1>
      < CalendarPage />
    </div>
  );
}
