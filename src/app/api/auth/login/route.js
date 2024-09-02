import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signToken } from '../../../../lib/jwt.js';

const prisma = new PrismaClient();

export async function POST(req, res) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: 'Usuario no encontrado' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }
 
  const token = signToken({ id: user.id, email: user.email });

  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=3600;`
  );

  return res.status(200).json({ message: 'Inicio de sesión exitoso' });
}
