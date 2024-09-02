import '../styles/css.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Mi Aplicación',
  description: 'Descripción de mi aplicación',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
