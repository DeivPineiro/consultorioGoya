import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma.js'; // Verifica que esta ruta sea correcta
import bcrypt from 'bcryptjs';

// Configuración de NextAuth
const authOptions = {
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (user && bcrypt.compareSync(credentials.password, user.password)) {
                    return { id: user.id, email: user.email, role: user.role, name: user.name, surname: user.surname };
                }

                throw new Error('Invalid credentials');
            },
        }),
    ],
    pages: {
        signIn: '/login', // Redirige a la página de inicio de sesión personalizada
    },
    session: {
        strategy: 'jwt', // Usa JWT para las sesiones
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {
                console.log(session.user);
                session.user = {
                    id: token.id,
                    email: token.email,
                    role: token.role,
                    name: token.name,
                    surname: token.surname,
                };
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.name = user.name;
                token.surname = user.surname;
            }
            return token;
        },
    },
};

// Exporta las funciones GET y POST
export const GET = (req, res) => NextAuth(req, res, authOptions);
export const POST = (req, res) => NextAuth(req, res, authOptions);
