import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { name, email, password, dni, surname } = await req.json();

  if (!name || !email || !password || !dni || !surname) {
    return new Response(
      JSON.stringify({ message: 'Faltan datos requeridos' }),
      { status: 400 }
    );
  }

  try {
    // Verificar si el correo electrónico o el DNI ya está registrado
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { dni }
        ]
      }
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'El correo electrónico o el DNI ya están registrados' }),
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        dni,
        surname,
        role: 'user',
      },
    });

    return new Response(JSON.stringify({ message: 'Usuario creado exitosamente' }), { status: 201 });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    return new Response(
      JSON.stringify({ message: 'Error al crear el usuario' }),
      { status: 500 }
    );
  }
}
