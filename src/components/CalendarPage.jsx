import { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import axios from 'axios';

const CalendarPage = () => {
  const { data: session } = useSession();
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientSurName: '',
    dni: '',
    email: '',
    phone: '',
    startTime: '',
    endTime: '',
    office: '1',
  });
  const officeColors = {
    1: '#007bff',
    2: '#28a745',
    3: '#ff9f00',
  };
  const [appointments, setAppointments] = useState([]);
  const [conflictError, setConflictError] = useState('');

  // Fetch appointments and set state
  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []); // Initial load

  const handleDateClick = (arg) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView('timeGridDay', arg.dateStr);
    setCurrentView('timeGridDay');
  };

  const handleCancel = () => {
    setFormData({
      patientName: '',
      patientSurName: '',
      dni: '',
      email: '',
      phone: '',
      startTime: '',
      endTime: '',
      office: '1'
    });
    setSelectedSlot(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!selectedSlot?.id) return;

    if (selectedSlot.extendedProps.userId !== session?.user?.id) {
      alert('No tienes permisos para eliminar este turno.');
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este turno?');
    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/appointments/${selectedSlot.id}`);

      if (response.data.success) {
        fetchAppointments();
        handleCancel();
      } else {
        console.error('Error al eliminar el turno:', response.data.message);
      }
    } catch (error) {
      console.error('Error al eliminar el turno:', error);
    }
  };

  const handleBackToMonthView = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView('dayGridMonth');
    setCurrentView('dayGridMonth');
  };

  const handleDateSelect = (arg) => {
    if (currentView === 'timeGridDay') {
      setSelectedSlot(arg);
      setFormData({
        ...formData,
        startTime: arg.startStr.slice(11, 16),
        endTime: arg.endStr.slice(11, 16),
      });
      setShowModal(true);
    }
  };

  const handleEventClick = (clickInfo) => {
    if (clickInfo.event.extendedProps.userId !== session?.user?.id) {
      alert('No tienes permisos para editar este turno.');
      return;
    }

    setSelectedSlot(clickInfo.event);
    setFormData({
      patientName: clickInfo.event.extendedProps.patientName,
      patientSurName: clickInfo.event.extendedProps.patientSurName,
      dni: clickInfo.event.extendedProps.dni,
      email: clickInfo.event.extendedProps.email || '',
      phone: clickInfo.event.extendedProps.phone || '',
      startTime: clickInfo.event.startStr.slice(11, 16),
      endTime: clickInfo.event.endStr.slice(11, 16),
      office: clickInfo.event.extendedProps.office || '1',
    });
    setShowModal(true);
  };

  // const handleNewAppointment = () => {
  //   setFormData({
  //     patientName: '',
  //     patientSurName: '',
  //     dni: '',
  //     email: '',
  //     phone: '',
  //     startTime: '',
  //     endTime: '',
  //     office: '1',
  //   });
  //   setSelectedSlot(null);
  //   setShowModal(true);
  // };
  const handleNewAppointment = () => {
    // Obtener la fecha seleccionada en la vista mensual
    const selectedDate = calendarRef.current.getApi().getDate();
  
    // Establecer el estado de selectedSlot con la fecha seleccionada
    setSelectedSlot({
      startStr: selectedDate.toISOString(),
      endStr: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(), // Por defecto, establecer una hora de fin 1 hora después
    });
  
    // Limpiar el formulario y mostrar el modal
    setFormData({
      patientName: '',
      patientSurName: '',
      dni: '',
      email: '',
      phone: '',
      startTime: selectedDate.toISOString().slice(11, 16),
      endTime: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString().slice(11, 16), // Hora de fin 1 hora después
      office: '1',
    });
    setShowModal(true);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const checkAvailability = async () => {
    try {
      const response = await axios.post('/api/check-availability', {
        office: formData.office,
        startTime: formData.startTime,
        endTime: formData.endTime
      });
      return response.data.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = new Date(selectedSlot?.startStr.split('T')[0] || new Date());
    const formattedStartTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${formData.startTime}:00`);
    const formattedEndTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${formData.endTime}:00`);

    if (isNaN(formattedStartTime.getTime()) || isNaN(formattedEndTime.getTime())) {
      console.error('Invalid date or time value.');
      return;
    }

    try {
      let response;

      if (selectedSlot?.id) {
        const availabilityResponse = await axios.post('/api/check-availability', {
          office: formData.office,
          startTime: formattedStartTime.toISOString(),
          endTime: formattedEndTime.toISOString(),
          appointmentId: selectedSlot.id,
        });

        if (availabilityResponse.data.available) {
          response = await axios.put(`/api/appointments/${selectedSlot.id}`, {
            ...formData,
            startTime: formattedStartTime.toISOString(),
            endTime: formattedEndTime.toISOString(),
          });
        } else {
          setConflictError('Ese horario ya está ocupado. Por favor, elige otro.');
          setTimeout(() => {
            setConflictError('');
          }, 3000);
          return;
        }
      } else {
        const availabilityResponse = await axios.post('/api/check-availability', {
          office: formData.office,
          startTime: formattedStartTime.toISOString(),
          endTime: formattedEndTime.toISOString(),
        });

        if (availabilityResponse.data.available) {
          response = await axios.post('/api/appointments', {
            ...formData,
            date: selectedSlot?.startStr.split('T')[0] || new Date().toISOString().split('T')[0],
            userId: session?.user?.id
          });
        } else {
          setConflictError('Ese horario ya está ocupado. Por favor, elige otro.');
          setTimeout(() => {
            setConflictError('');
          }, 3000);
          return;
        }
      }

      if (response.data.success) {
        fetchAppointments();
        setFormData({
          patientName: '',
          patientSurName: '',
          dni: '',
          email: '',
          phone: '',
          startTime: '',
          endTime: '',
          office: '1'
        });
        setSelectedSlot(null);
        setShowModal(false);
      } else {
        console.error('Error al guardar el turno:', response.data.message);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  return (
    <div className='w-full h-full px-4 py-0'>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={appointments.map(appointment => ({
          id: appointment.id,
          title: `Dr/a: ${appointment.user ? appointment.user.name : session.user.name} - Sala: ${appointment.office}`,
          start: appointment.startTime,
          end: appointment.endTime,
          backgroundColor: officeColors[appointment.office] || '#ccc',
          extendedProps: {
            patientName: appointment.patientName,
            patientSurName: appointment.patientSurName,
            dni: appointment.dni,
            email: appointment.email,
            phone: appointment.phone,
            office: appointment.office,
            userId: appointment.user.id,
          }
        }))}
        dateClick={handleDateClick}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={(dateInfo) => setCurrentView(dateInfo.view.type)}
        locale={esLocale}
      />

      {showModal && currentView === 'timeGridDay' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-full max-w-md p-4 bg-white rounded-lg shadow-lg'>
            <form onSubmit={handleSubmit}>
              <h2 className='mb-4 text-xl font-semibold text-center'>{selectedSlot?.id ? 'Editar Turno' : 'Agregar Turno'}</h2>
              {conflictError && <div className='mb-2 text-sm text-red-600'>{conflictError}</div>}
              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='patientName'>Nombre del paciente:</label>
                <input
                  className='w-full px-3 py-2 border rounded'
                  type='text'
                  id='patientName'
                  name='patientName'
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='patientSurName'>Apellido del paciente:</label>
                <input
                  className='w-full px-3 py-2 border rounded'
                  type='text'
                  id='patientSurName'
                  name='patientSurName'
                  value={formData.patientSurName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='dni'>DNI:</label>
                <input
                  className='w-full px-3 py-2 border rounded'
                  type='text'
                  id='dni'
                  name='dni'
                  value={formData.dni}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='email'>Email:</label>
                <input
                  className='w-full px-3 py-2 border rounded'
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='phone'>Teléfono:</label>
                <input
                  className='w-full px-3 py-2 border rounded'
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className='flex justify-between mb-4'>
                <div className='w-full'>
                  <label className='block mb-1 text-sm font-medium' htmlFor='startTime'>Hora de inicio:</label>
                  <input
                    className='w-full px-3 py-2 border rounded'
                    type='time'
                    id='startTime'
                    name='startTime'
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className='w-full ml-4'>
                  <label className='block mb-1 text-sm font-medium' htmlFor='endTime'>Hora de fin:</label>
                  <input
                    className='w-full px-3 py-2 border rounded'
                    type='time'
                    id='endTime'
                    name='endTime'
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='office'>Consultorio:</label>
                <select
                  className='w-full px-3 py-2 border rounded'
                  id='office'
                  name='office'
                  value={formData.office}
                  onChange={handleChange}
                  required
                >
                  <option value='1'>Consultorio 1</option>
                  <option value='2'>Consultorio 2</option>
                  <option value='3'>Consultorio 3</option>
                </select>
              </div>
              <div className='flex justify-end space-x-2'>
                {selectedSlot?.id && (
                  <button
                    className='px-4 py-2 text-white bg-red-600 rounded'
                    type='button'
                    onClick={handleDelete}
                  >
                    Eliminar
                  </button>
                )}
                <button
                  className='px-4 py-2 text-gray-700 bg-gray-300 rounded'
                  type='button'
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  className='px-4 py-2 text-white bg-blue-600 rounded'
                  type='submit'
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {currentView === 'timeGridDay' && (
        <div className='mt-4 text-center'>
          <button
            className='px-4 py-2 text-white bg-slate-700 rounded'
            onClick={handleBackToMonthView}
          >
            Volver 
          </button>
          <button
            className='mx-2 p-2 rounded bg-blue-500 text-white'
            onClick={handleNewAppointment}
          >
            Nuevo turno
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
