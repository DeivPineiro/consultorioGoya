import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; 
import moment from 'moment-timezone';


export async function POST(request) {
  try {
    const { patientName, patientSurName, dni, email, phone, startTime, endTime, office, userId, date } = await request.json();
        
    const parsedDni = parseInt(dni, 10);
    const parsedOffice = parseInt(office, 10);
    const parsedUserId = parseInt(userId, 10);       
    const selectedDate = date.split('T')[0]; 
    const startDateTime = moment.tz(`${selectedDate}T${startTime}:00`, 'America/Argentina/Buenos_Aires').toDate();
    const endDateTime = moment.tz(`${selectedDate}T${endTime}:00`, 'America/Argentina/Buenos_Aires').toDate();

    console.log(startTime + " " + endTime);
   console.log(startDateTime + "  " + endDateTime);

    const appointment = await prisma.appointment.create({
      data: {
        patientName,
        patientSurName,
        dni: parsedDni,
        email,
        phone,
        startTime: startDateTime.toISOString(), 
        endTime: endDateTime.toISOString(), 
        office: parsedOffice,
        userId: parsedUserId,
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Error saving appointment:', error);
    return NextResponse.json({ success: false, message: 'Failed to save appointment' });
  }
}

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: true, 
      },
    });
   
    const response = appointments.map(appointment => ({
      id: appointment.id,
      patientName: appointment.patientName,
      patientSurName: appointment.patientSurName,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      office: appointment.office,
      dni: appointment.dni,
      email: appointment.email,
      phone: appointment.phone,
      user: appointment.user ? {
        id: appointment.user.id,
        name: appointment.user.name, 
      } : null,
    }));

    return NextResponse.json({ appointments: response });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch appointments' });
  }
}

export async function PUT(request, { params }) {
  const { id } = params; 
  const data = await request.json();

  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id: parseInt(id, 10) }, 
      data: {
        patientName: data.patientName,
        patientSurName: data.patientSurName,
        dni: data.dni,
        email: data.email,
        phone: data.phone,
        startTime: data.startTime,
        endTime: data.endTime,
        office: data.office,
      },
    });
    
    return NextResponse.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.error('Error al actualizar el turno:', error);
    return NextResponse.json({ success: false, message: 'Error al actualizar el turno.' });
  }
}