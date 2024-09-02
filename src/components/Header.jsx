"use client";

import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();
  

  const handleSignOut = async () => {
    await signOut({ redirect: false }); // Cierra sesión sin redireccionar automáticamente
  };
  return (
    <header style={{ padding: '1rem', backgroundColor: '#f8f9fa' }}>
      <h1>Consultorio Goya</h1>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '10px' }}>
        <li><a href="/">Inicio</a></li>     
          {session && session.user.role.trim() === 'admin' && (
            <li><a href="/calendar">Calendario</a></li>
          )}
          <li><a href="/about">Sobre nosotros</a></li>          
          {session ? (           <>

            <li>Hola, {session.user.name} {session.user.surname}</li>
              <li><button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Cerrar sesión</button></li>
            </>
          ) : (
            <li><a href="/login">Ingresar</a></li>
          )}

        </ul>
      </nav>
    </header>
  );
}

export default Header;
