import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const medics = await prisma.user.findMany({
      where: {
        role: 'admin', // Filtramos por rol de "admin"
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ medics });
  } catch (error) {
    console.error('Error fetching medics:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch medics' });
  }
}
