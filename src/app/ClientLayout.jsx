"use client";

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/css.css';
import { SessionProvider } from 'next-auth/react';
import ClientWrapper from './ClientWrapper';

export default function ClientLayout({ children }) {
  return (
    <ClientWrapper>
      <SessionProvider>
        <div className='min-h-screen flex flex-col'>
          <Header />
          <main className='flex-grow'>{children}</main>     
          <Footer/>    
        </div>
      </SessionProvider>
    </ClientWrapper>
  );
}
