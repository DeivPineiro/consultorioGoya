"use client";
import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });  

    if (result.error) {
      setError(result.error);
    } else if (result.ok) {
      const session = await getSession();
      if (session.user.role === 'admin') {
        router.push('/calendar');
      } else {
        router.push('/');
      }
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Iniciar Sesión</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-md focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿No tienes una cuenta? <a href="/register" className="font-bold text-slate-600 hover:text-slate-700">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
