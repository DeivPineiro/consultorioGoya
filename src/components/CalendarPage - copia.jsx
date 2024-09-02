import { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // Importa useSession de NextAuth.js
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es'; // Importar el locale español
import axios from 'axios'; // Importa axios para hacer solicitudes HTTP

const CalendarPage = () => {
  const { data: session } = useSession(); // Obtén la sesión actual
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
    1: '#ff9f00',  // Color para Consultorio 1
    2: '#007bff',  // Color para Consultorio 2
    3: '#28a745',  // Color para Consultorio 3
  };
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments');
      return response.data.appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      const fetchedAppointments = await fetchAppointments();    
      setAppointments(fetchedAppointments);
    };
    loadAppointments();
  }, []);

  const handleDateClick = (arg) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView('timeGridDay', arg.dateStr);
    setCurrentView('timeGridDay');
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
        endTime: arg.endStr.slice(11, 16)
      });
      setShowModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/appointments', {
        ...formData,
        date: selectedSlot.startStr,
        userId: session?.user?.id // Obtén el userId de la sesión actual
      });

      if (response.data.success) {
        console.log('Turno guardado con éxito:', response.data.appointment);
        // Actualiza el estado de turnos para reflejar el nuevo turno
        setAppointments([...appointments, response.data.appointment]);
      } else {
        console.error('Error al guardar el turno:', response.data.message);
      }

      setShowModal(false);
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
          title: `${appointment.patientName} ${appointment.patientSurName} - Dr/a: ${appointment.user ? appointment.user.name : session.user.name} - Consultorio: ${appointment.office}`,
          start: appointment.startTime,
          end: appointment.endTime,
          backgroundColor: officeColors[appointment.office] || '#ccc',
        }))}
        dateClick={handleDateClick}
        select={handleDateSelect}
        datesSet={(dateInfo) => setCurrentView(dateInfo.view.type)}
        locale={esLocale}
      />

      {currentView === 'timeGridDay' && (
        <button
          className='mx-2 mt-8 p-2 border rounded-xl bg-neutral-900 text-gray-50'
          onClick={handleBackToMonthView}
        >
          Volver a vista mensual
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Agendar Turno</h2>
            <form onSubmit={handleSubmit}>
              {/* Formulario */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Día
                  <input
                    type="text"
                    className="mt-1 block w-full p-2 border rounded"
                    value={selectedSlot.startStr.split('T')[0]}
                    readOnly
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del paciente
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Apellido del paciente
                  <input
                    type="text"
                    name="patientSurName"
                    value={formData.patientSurName}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  DNI
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico (opcional)
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono (opcional)
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Hora de inicio
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Hora de fin
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Consultorio
                  <select
                    name="office"
                    value={formData.office}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border rounded"
                    required
                  >
                    <option value="1">Consultorio 1</option>
                    <option value="2">Consultorio 2</option>
                    <option value="3">Consultorio 3</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Guardar Turno
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


// CALENDARPAGE ANTES DE REFRESCO DE EDICION


// import { useRef, useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react'; // Importa useSession de NextAuth.js
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import esLocale from '@fullcalendar/core/locales/es'; // Importar el locale español
// import axios from 'axios'; // Importa axios para hacer solicitudes HTTP

// const CalendarPage = () => {
//   const { data: session } = useSession(); // Obtén la sesión actual
//   const calendarRef = useRef(null);
//   const [currentView, setCurrentView] = useState('dayGridMonth');
//   const [showModal, setShowModal] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [formData, setFormData] = useState({
//     patientName: '',
//     patientSurName: '',
//     dni: '',
//     email: '',
//     phone: '',
//     startTime: '',
//     endTime: '',
//     office: '1',
//   });
//   const officeColors = {
//     1: '#ff9f00',  // Color para Consultorio 1
//     2: '#007bff',  // Color para Consultorio 2
//     3: '#28a745',  // Color para Consultorio 3
//   };
//   const [appointments, setAppointments] = useState([]);
//   const [conflictError, setConflictError] = useState('');

//   const fetchAppointments = async () => {
//     try {
//       const response = await axios.get('/api/appointments');
//       return response.data.appointments; // Asegúrate de que aquí se retorne el ID junto con otros datos
//     } catch (error) {
//       console.error('Error fetching appointments:', error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     const loadAppointments = async () => {
//       const fetchedAppointments = await fetchAppointments();
//       setAppointments(fetchedAppointments);
//     };
//     loadAppointments();
//   }, []);

 

//   const handleDateClick = (arg) => {
//     const calendarApi = calendarRef.current.getApi();
//     calendarApi.changeView('timeGridDay', arg.dateStr);
//     setCurrentView('timeGridDay');
//   };

//   const handleCancel = () => {
//     // Limpiar el estado del formulario
//     setFormData({
//       patientName: '',
//       patientSurName: '',
//       dni: '',
//       email: '',
//       phone: '',
//       startTime: '',
//       endTime: '',
//       office: '1'
//     });
//     setSelectedSlot(null);
//     setShowModal(false);
//   };

//   const handleBackToMonthView = () => {
//     const calendarApi = calendarRef.current.getApi();
//     calendarApi.changeView('dayGridMonth');
//     setCurrentView('dayGridMonth');
//   };

//   const handleDateSelect = (arg) => {
//     console.log('Fecha seleccionada:', arg);
//     if (currentView === 'timeGridDay') {
//       setSelectedSlot(arg);
//       setFormData({
//         ...formData,
//         startTime: arg.startStr.slice(11, 16),
//         endTime: arg.endStr.slice(11, 16),
//       });
//       setShowModal(true);
//     }
//   };

//   const handleEventClick = (clickInfo) => {
//     console.log('Evento clickeado:', clickInfo);
//     setSelectedSlot(clickInfo.event);
//     setFormData({
//       patientName: clickInfo.event.extendedProps.patientName,
//       patientSurName: clickInfo.event.extendedProps.patientSurName,
//       dni: clickInfo.event.extendedProps.dni,
//       email: clickInfo.event.extendedProps.email || '',
//       phone: clickInfo.event.extendedProps.phone || '',
//       startTime: clickInfo.event.startStr.slice(11, 16),
//       endTime: clickInfo.event.endStr.slice(11, 16),
//       office: clickInfo.event.extendedProps.office || '1',
//     });
//     setShowModal(true);
//   };

//   const handleNewAppointment = () => {
//     setFormData({
//       patientName: '',
//       patientSurName: '',
//       dni: '',
//       email: '',
//       phone: '',
//       startTime: '',
//       endTime: '',
//       office: '1',
//     });
//     setSelectedSlot(null);
//     setShowModal(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const checkAvailability = async () => {
//     try {
//       const response = await axios.post('/api/check-availability', {
//         office: formData.office,
//         startTime: formData.startTime,
//         endTime: formData.endTime
//       });
//       return response.data.available;
//     } catch (error) {
//       console.error('Error checking availability:', error);
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const selectedDate = new Date(selectedSlot?.startStr.split('T')[0] || new Date());
//     const formattedStartTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${formData.startTime}:00`);
//     const formattedEndTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${formData.endTime}:00`);

//     if (isNaN(formattedStartTime.getTime()) || isNaN(formattedEndTime.getTime())) {
//       console.error('Invalid date or time value.');
//       return;
//     }

//     try {
//       let response;

//       if (selectedSlot?.id) {
//         // Si hay un ID, actualiza el turno existente sin verificar disponibilidad
//         console.log("Office edit turno:" + formData.office);
//         response = await axios.put(`/api/appointments/${selectedSlot.id}`, {
//           ...formData,
//           startTime: formattedStartTime.toISOString(),
//           endTime: formattedEndTime.toISOString(),
//         });
//       } else {
//         // Verificar disponibilidad solo si es un nuevo turno
//         console.log("Office nuevo turno:" + formData.office);
//         const availabilityResponse = await axios.post('/api/check-availability', {
//           office: formData.office,
//           startTime: formattedStartTime.toISOString(),
//           endTime: formattedEndTime.toISOString(),
//         });

//         if (availabilityResponse.data.available) {
//           // Crear nuevo turno
//           response = await axios.post('/api/appointments', {
//             ...formData,
//             date: selectedSlot?.startStr.split('T')[0] || new Date().toISOString().split('T')[0],
//             userId: session?.user?.id
//           });
//         } else {
//           setConflictError('Ese horario ya está ocupado. Por favor, elige otro.');
//           setTimeout(() => {
//             setConflictError('');
//           }, 3000);
//           return; // Salir si el turno no está disponible
//         }
//       }
//       if (response.data.success) {
//         // Refetch appointments to reload the component
//         fetchAppointments();
//         setFormData({
//           patientName: '',
//           patientSurName: '',
//           dni: '',
//           email: '',
//           phone: '',
//           startTime: '',
//           endTime: '',
//           office: '1'
//         });
//         setSelectedSlot(null);
//         setShowModal(false);
//       } else {
//         console.error('Error al guardar el turno:', response.data.message);
//       }
//     } catch (error) {
//       console.error('Error al enviar los datos:', error);
//     }
//   };


//   return (
//     <div>
//       <FullCalendar
//         ref={calendarRef}
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         initialView="dayGridMonth"
//         editable={true}
//         selectable={true}
//         events={appointments.map(appointment => ({
//           id: appointment.id, // Incluye el ID aquí
//           title: `${appointment.patientName} ${appointment.patientSurName} - Dr/a: ${appointment.user ? appointment.user.name : session.user.name} - Consultorio: ${appointment.office}`,
//           start: appointment.startTime,
//           end: appointment.endTime,
//           backgroundColor: officeColors[appointment.office] || '#ccc',
//           extendedProps: {
//             patientName: appointment.patientName,
//             patientSurName: appointment.patientSurName,
//             dni: appointment.dni,
//             email: appointment.email,
//             phone: appointment.phone,
//             office: appointment.office,
//           }
//         }))}
//         dateClick={handleDateClick}
//         select={handleDateSelect}
//         eventClick={handleEventClick}  // Configura el evento eventClick
//         datesSet={(dateInfo) => setCurrentView(dateInfo.view.type)}
//         locale={esLocale}
//       />

//       {currentView === 'timeGridDay' && (
//         <div className="flex mt-8">
//           <button
//             className='mx-2 p-2 border rounded-xl bg-neutral-900 text-gray-50'
//             onClick={handleBackToMonthView}
//           >
//             Volver a vista mensual
//           </button>
//           <button
//             className='mx-2 p-2 border rounded-xl bg-blue-500 text-white'
//             onClick={handleNewAppointment}
//           >
//             Agendar
//           </button>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-4 rounded-lg w-full max-w-lg mx-4">
//             <h2 className="text-lg font-bold mb-4">
//               {selectedSlot?.id ? 'Editar Turno' : 'Agregar Turno'}
//             </h2>
//             {conflictError && (
//               <div className="bg-red-500 text-white p-2 rounded mb-4">
//                 {conflictError}
//               </div>
//             )}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="patientName">
//                   Nombre del Paciente
//                 </label>
//                 <input
//                   type="text"
//                   id="patientName"
//                   name="patientName"
//                   value={formData.patientName}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="patientSurName">
//                   Apellido del Paciente
//                 </label>
//                 <input
//                   type="text"
//                   id="patientSurName"
//                   name="patientSurName"
//                   value={formData.patientSurName}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="dni">
//                   DNI
//                 </label>
//                 <input
//                   type="text"
//                   id="dni"
//                   name="dni"
//                   value={formData.dni}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="email">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="phone">
//                   Teléfono
//                 </label>
//                 <input
//                   type="text"
//                   id="phone"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="startTime">
//                   Hora de Inicio
//                 </label>
//                 <input
//                   type="time"
//                   id="startTime"
//                   name="startTime"
//                   value={formData.startTime}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="endTime">
//                   Hora de Fin
//                 </label>
//                 <input
//                   type="time"
//                   id="endTime"
//                   name="endTime"
//                   value={formData.endTime}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium mb-1" htmlFor="office">
//                   Consultorio
//                 </label>
//                 <select
//                   id="office"
//                   name="office"
//                   value={formData.office}
//                   onChange={handleChange}
//                   className="border border-gray-300 p-2 rounded w-full"
//                 >
//                   <option value="1">Consultorio 1</option>
//                   <option value="2">Consultorio 2</option>
//                   <option value="3">Consultorio 3</option>
//                 </select>
//               </div>
//               <button
//                 type="submit"
//                 className="bg-blue-500 text-white p-2 rounded w-full"
//               >
//                 {selectedSlot?.id ? 'Actualizar Turno' : 'Agregar Turno'}
//               </button>
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="mt-2 bg-gray-500 text-white p-2 rounded w-full"
//               >
//                 Cancelar
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CalendarPage;
