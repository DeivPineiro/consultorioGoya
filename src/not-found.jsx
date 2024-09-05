import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div>
      <h1>404</h1>
      <p>Página no encontrada</p>
      <p>La página que estás buscando no existe.</p>
      <Link href="/home">Volver al Inicio</Link>
    </div>
  );
}
