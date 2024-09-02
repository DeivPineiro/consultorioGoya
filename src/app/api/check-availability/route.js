import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { office, startTime, endTime, appointmentId } = await request.json();
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Verifica si las fechas son válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date or time value.');
    }

    // Si appointmentId no está definido, omite el filtro NOT
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        office: parseInt(office),
        startTime: {
          lt: end,
        },
        endTime: {
          gt: start,
        },
        // Si appointmentId está definido, exclúyelo de la consulta
        ...(appointmentId && {
          NOT: {
            id: parseInt(appointmentId),
          },
        }),
      },
    });

    const isAvailable = existingAppointments.length === 0;

    return new Response(
      JSON.stringify({ available: isAvailable }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking availability:', error);
    return new Response(
      JSON.stringify({ error: 'Error checking availability' }),
      { status: 500 }
    );
  }
}
