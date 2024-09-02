import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Asegúrate de importar tu instancia de Prisma

export async function PUT(req, { params }) {
  const { id } = params; // Obtén el ID de la URL
  const { patientName, patientSurName, dni, email, phone, startTime, endTime, office } = await req.json();

 

  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        patientName,
        patientSurName,
        dni,
        email,
        phone,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        office: Number(office),
      },
    });

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ success: false, message: 'Error updating appointment' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params; // Obtén el ID de la URL

  try {
    const deletedAppointment = await prisma.appointment.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, appointment: deletedAppointment });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json({ success: false, message: 'Error deleting appointment' }, { status: 500 });
  }
}
