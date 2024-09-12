"use client";

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import '../styles/css.css';

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirect: false }); 
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <nav className="border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="img/logo/logo_nav_2.png" className="h-6" alt="Flowbite Logo" />
            <span className="self-center text-l font-semibold whitespace-nowrap dark:text-white">Consultorio Goya</span>
          </a>          
          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center justify-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 lg:hidden"
            aria-controls="navbar-hamburger"
            aria-expanded={isMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>          
          <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full lg:hidden`} id="navbar-hamburger">
            <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <li><a href="/home" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Inicio</a></li>
              {session && session.user.role.trim() === 'admin' && (
                <li><a href="/calendar" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white">Calendario</a></li>
              )}
              <li><a href="/about" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Sobre nosotros</a></li>
              {session ? (
                <li className="block py-2 px-3 text-gray-900 rounded hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-red-700">
                  <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Cerrar sesión</button>
                </li>
              ) : (
                <li className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  <a href="/login">Ingresar</a>
                </li>
              )}
            </ul>
          </div>          
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <ul className="flex space-x-4">   
            <li><a href="/home" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Inicio</a></li>          
              {session && session.user.role.trim() === 'admin' && (
                <li><a href="/calendar" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white">Calendario</a></li>
              )}
              <li><a href="/about" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Sobre nosotros</a></li>
              {session ? (
                <li className="block py-2 px-3 text-gray-900 rounded hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-red-700">
                  <button onClick={handleSignOut} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Cerrar sesión</button>
                </li>
              ) : (
                <li className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  <a href="/login">Ingresar</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
