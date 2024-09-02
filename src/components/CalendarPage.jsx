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
    1: '#ff9f00',
    2: '#007bff',
    3: '#28a745',
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

    // Verificar si el turno pertenece al usuario actual
    if (selectedSlot.extendedProps.userId !== session?.user?.id) {
      alert('No tienes permisos para eliminar este turno.');
      return;
    }

    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este turno?');
    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/appointments/${selectedSlot.id}`);

      if (response.data.success) {
        // Refetch appointments to reload the component
        fetchAppointments();
        handleCancel(); // Reiniciar formulario y cerrar modal
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
    // Verificar si el turno pertenece al usuario actual  
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

  const handleNewAppointment = () => {
    setFormData({
      patientName: '',
      patientSurName: '',
      dni: '',
      email: '',
      phone: '',
      startTime: '',
      endTime: '',
      office: '1',
    });
    setSelectedSlot(null);
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
        // Aquí realizas la verificación de disponibilidad excluyendo el turno que estás editando
        const availabilityResponse = await axios.post('/api/check-availability', {
          office: formData.office,
          startTime: formattedStartTime.toISOString(),
          endTime: formattedEndTime.toISOString(),
          appointmentId: selectedSlot.id, // Pasa el id del turno que estás editando
        });

        if (availabilityResponse.data.available) {
          // Si está disponible, actualiza el turno
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
        // Si es un turno nuevo, verifica la disponibilidad normalmente
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
    <div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={appointments.map(appointment => ({
          id: appointment.id,
          title: `${appointment.patientName} ${appointment.patientSurName} - Dr/a: ${appointment.user ? appointment.user.name : session.user.name} - Consultorio: ${appointment.office}`,
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

      {currentView === 'timeGridDay' && (
        <div className="flex mt-8">
          <button
            className='mx-2 p-2 border rounded-xl bg-neutral-900 text-gray-50'
            onClick={handleBackToMonthView}
          >
            Volver a vista mensual
          </button>
          <button
            className='mx-2 p-2 border rounded-xl bg-blue-500 text-white'
            onClick={handleNewAppointment}
          >
            Agendar
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg mx-4">
            <h2 className="text-lg font-bold mb-4">
              {selectedSlot?.id ? 'Editar Turno' : 'Agregar Turno'}
            </h2>
            {conflictError && (
              <div className="bg-red-500 text-white p-2 rounded mb-4">
                {conflictError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">Nombre:</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Apellido:</label>
                <input
                  type="text"
                  name="patientSurName"
                  value={formData.patientSurName}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">DNI:</label>
                <input
                  type="number"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Teléfono:</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Hora de Inicio:</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Hora de Fin:</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Consultorio:</label>
                <select
                  name="office"
                  value={formData.office}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                >
                  <option value="1">Consultorio 1</option>
                  <option value="2">Consultorio 2</option>
                  <option value="3">Consultorio 3</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                >
                  Guardar
                </button>
                {selectedSlot?.id && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Eliminar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>


              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
