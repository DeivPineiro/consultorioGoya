"use client";

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Mientras se carga la sesión, no hacemos nada

    if (!session) {
      // Redirige a /login si no está autenticado
      router.replace('/login');
    } else {
      // Redirige a /calendar si está autenticado
      router.replace('/calendar');
    }
  }, [session, status, router]);

  return null; // No renderizamos nada en esta página ya que solo redirigimos
};

export default HomePage;