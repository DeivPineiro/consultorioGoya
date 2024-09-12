import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req, { params }) {
  const { id } = params;
  const { patientName, patientSurName, dni, email, phone, startTime, endTime, office, comment, cancelturn, withnotice, cancelcomment, medicId } = await req.json();



  try {
    
    const parsedUserId = parseInt(medicId, 10);
    const updatedAppointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        patientName,
        patientSurName,
        dni: Number(dni),
        email,
        phone,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        office: Number(office),
        comment,
        cancelturn,
        withnotice,
        cancelcomment,
        userId: parsedUserId
      },
    });

    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ success: false, message: 'Error updating appointment' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

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
