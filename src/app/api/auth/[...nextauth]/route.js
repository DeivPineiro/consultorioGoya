import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma.js'; 
import bcrypt from 'bcryptjs';

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
        signIn: '/login', 
    },
    session: {
        strategy: 'jwt', 
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {                
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


export const GET = async (req, res) => {
    return await NextAuth(req, res, authOptions);
  };
  
  export const POST = async (req, res) => {
    return await NextAuth(req, res, authOptions);
  };
