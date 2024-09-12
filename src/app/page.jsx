"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; 
    if (session) {      
      if (session.user.role === 'admin') {
        router.replace('/calendar'); 
      } else {
        router.replace('/home'); 
      }
    } else {
      router.replace('/home'); 
    }
  }, [session, status, router]);

  return null; 
};

export default RedirectPage;
