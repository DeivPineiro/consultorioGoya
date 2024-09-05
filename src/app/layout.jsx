import '../styles/css.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Consultorio Goya',
  description: 'Manejo de agenda del consultorio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="img/favicon.ico" /> 
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
