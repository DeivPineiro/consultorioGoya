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
  const [cancelturn, setCancelTurn] = useState(false);
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
    comment: '',
    cancelturn: false,
    withnotice: false,
    cancelcomment: '',
    medicId: session?.user?.id,
  });  
  const officeColors = {
    1: '#007bff',
    2: '#28a745',
    3: '#ff9f00',
  };
  const [appointments, setAppointments] = useState([]);
  const [conflictError, setConflictError] = useState('');
  const [medics, setMedics] = useState([]);
  
  const fetchMedics = async () => {
    try {
      const response = await axios.get('api/medics');
      setMedics(response.data.medics);
    } catch (error) {
      console.error('Error fetching medics:', error);
    }
  }

  

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchMedics();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, []);

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
      office: '1',
      comment: '',
      cancelturn: false,
      withnotice: false,
      cancelcomment: ' ',
      medicId: session?.user?.id,
    });
    setCancelTurn(false);
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
      // alert('No tienes permisos para editar este turno.');
      // return;
      setCancelTurn(true);


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
      comment: clickInfo.event.extendedProps.comment || '',
      cancelturn: clickInfo.event.extendedProps.cancelturn || false,
      withnotice: clickInfo.event.extendedProps.withnotice || false,
      cancelcomment: clickInfo.event.extendedProps.cancelcomment || '',
      medicId: clickInfo.event.extendedProps.medicId || session?.user?.id,
    });
    setShowModal(true);
  };

  const handleNewAppointment = () => {
    const selectedDate = calendarRef.current.getApi().getDate();

    setSelectedSlot({
      startStr: selectedDate.toISOString(),
      endStr: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(),
    });

    setFormData({
      patientName: '',
      patientSurName: '',
      dni: '',
      email: '',
      phone: '',
      startTime: selectedDate.toISOString().slice(11, 16),
      endTime: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString().slice(11, 16),
      office: '1',
      comment: '',
      cancelturn: false,
      withnotice: false,
      cancelcomment: '',
      medicId: session?.user?.id,
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
          let turnoAjeno;
          if (medicId !== session.user.id){

            turnoAjeno = true;

          }
          response = await axios.put(`/api/appointments/${selectedSlot.id}`, {
            ...formData,
            userId: formData.medicId,
            cancelcomment: `${(formData.cancelcomment || formData.cancelturn) ? formData.cancelcomment + " // Cancelado por : " + session.user.name + " " + session.user.surname : formData.cancelcomment}`,
            comment: `${(turnoAjeno) ? formData.comment + " // Agendado por : " + session.user.name + " " + session.user.surname : formData.comment}`,
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
          let turnoAjeno;
          if (medicId !== session.user.id){

            turnoAjeno = true;

          }
          response = await axios.post('/api/appointments', {
            ...formData,
            userId: formData.medicId,
            comment: `${(turnoAjeno) ? formData.comment + " // Agendado por : " + session.user.name + " " + session.user.surname : formData.comment}`,
            date: selectedSlot?.startStr.split('T')[0] || new Date().toISOString().split('T')[0],            
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
          office: '1',
          comment: '',
          cancelturn: false,
          withnotice: false,
          cancelcomment: '',
          medicId: session?.user?.id,
        });
        setCancelTurn(false);
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
          backgroundColor: `${!appointment.cancelturn ? officeColors[appointment.office] : '#cc0000'}`,
          extendedProps: {
            patientName: appointment.patientName,
            patientSurName: appointment.patientSurName,
            dni: appointment.dni,
            email: appointment.email,
            phone: appointment.phone,
            office: appointment.office,
            userId: appointment.user.id,
            comment: appointment.comment || '',
            cancelturn: appointment.cancelturn || false,
            withnotice: appointment.withnotice || false,
            cancelcomment: appointment.cancelcomment || '',
            medicId: appointment.user.id
          }
        }))}
        dateClick={handleDateClick}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={(dateInfo) => setCurrentView(dateInfo.view.type)}
        locale={esLocale}
      />

      {showModal && currentView === 'timeGridDay' && (
        <div className='modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='w-full max-w-md p-4 bg-white rounded-lg shadow-lg'>
            <form onSubmit={handleSubmit}>
              <h2 className='mb-4 text-xl font-semibold text-center'>{selectedSlot?.id ? 'Editar Turno' : 'Agregar Turno'}</h2>
              {conflictError && <div className='mb-2 text-sm text-red-600'>{conflictError}</div>}

              <div className='mb-4'>
                <label className='block mb-1 text-sm font-medium' htmlFor='medic'>Médico:</label>
                <select
                  className='w-full px-3 py-2 border rounded'
                  id='medicId'
                  name='medicId'                  
                  value={formData.medicId}
                  onChange={handleChange}
                  required
                >
                  {medics.map((medic) => (
                    <option key={medic.id} value={medic.id}>
                      Dr/a: {medic.name} {medic.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div className='justify-between flex mb-4'>
                <div className='w-full mr-2'>
                  <label className='block mb-1 text-sm font-medium' htmlFor='patientName'>Nombre del paciente:</label>
                  <input
                    className='w-full px-3 py-2 border rounded'
                    type='text'
                    id='patientName'
                    name='patientName'
                    value={formData.patientName}
                    onChange={handleChange}
                    readOnly={cancelturn}
                    required
                  />
                </div>
                <div className='w-full ml-2'>
                  <label className='block mb-1 text-sm font-medium' htmlFor='patientSurName'>Apellido del paciente:</label>
                  <input
                    className='w-full px-3 py-2 border rounded'
                    type='text'
                    id='patientSurName'
                    name='patientSurName'
                    value={formData.patientSurName}
                    onChange={handleChange}
                    readOnly={cancelturn}
                    required
                  />
                </div>
              </div>
              {!cancelturn && (<div>
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
                <div className='mb-4'>
                  <label className='block mb-1 text-sm font-medium' htmlFor='comment'>Notas:</label>
                  <textarea
                    className='border w-full'
                    name="comment"
                    id="comment"
                    value={formData.comment}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>)}
              {(cancelturn || formData.cancelturn) && (<div className="form-group">
                <label className="block font-medium text-gray-700">Cancelación</label>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="cancelturn"
                    name="cancelturn"
                    className="mr-2"
                    checked={formData.cancelturn}
                    onChange={(e) => setFormData({ ...formData, cancelturn: e.target.checked })}
                  />
                  <label htmlFor="cancelTurn">Cancelar Turno</label>
                </div>

                {formData.cancelturn && (
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="withnotice"
                      name="withnotice"
                      className="mr-2"
                      checked={formData.withnotice}
                      onChange={(e) => setFormData({ ...formData, withnotice: e.target.checked })}
                    />
                    <label htmlFor="withnotice">Con Aviso</label>
                  </div>
                )}
                {formData.cancelturn && (
                  <div className="mb-4">
                    <label htmlFor="cancelcomment" className="block text-sm font-medium text-gray-700">
                      Comentario de Cancelación
                    </label>
                    <textarea
                      id="cancelcomment"
                      name="cancelcomment"
                      rows="3"
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.cancelcomment}
                      onChange={(e) => setFormData({ ...formData, cancelcomment: e.target.value })}
                    ></textarea>
                  </div>
                )}
              </div>)}

              <div className='flex justify-end space-x-2'>
                {selectedSlot?.id && !cancelturn && (
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

// todo AGREGAR NOTAS AL // Dejar aviso de cancelacion de turno a otro medico // Agendar turno para otro medico