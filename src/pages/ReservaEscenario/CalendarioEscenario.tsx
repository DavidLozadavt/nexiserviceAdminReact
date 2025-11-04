import React, { useState } from 'react';
// Asegúrate de que esta ruta sea correcta para tus tipos
import { Escenario, ReservaEscenario } from './typesEscenario'; 
// Asegúrate de que esta ruta sea correcta para tu formulario
import { ReservaEscenarioForm } from '../ReservaEscenario/components/ReservaEscenarioForm'; 


// --- TIPOS Y CONSTANTES ---

interface CalendarioEscenariosProps {
    idCompany?: number; 
}

// Estilos temáticos ajustados
const calendarStyles = {
    container: 'p-6 bg-white rounded-xl shadow-2xl max-w-3xl mx-auto',
    header: 'mb-4',
    title: 'text-2xl font-bold text-gray-800',
    navButton: 'px-3 py-1 bg-secondary text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-300',
    newReservaButton: 'px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-active transition-colors font-medium text-sm', 
    monthContainer: 'flex justify-between items-center w-full mb-4 pb-2 border-b border-gray-200', 
    weekdays: 'grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2',
    dayGrid: 'grid grid-cols-7 gap-1',
    dayCell: 'p-3 h-16 flex flex-col items-center justify-center text-center rounded-lg cursor-pointer transition-all border border-transparent hover:bg-gray-100',
    
 currentDay:
    'border-2 border-blue-300  text-black font-semibold rounded-full  ',
  currentDayNumber:
    'flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold',
    
    // El selectedDay solo usa el color claro, para diferenciar
  selectedDay: 'border-2 border-blue-300 bg-blue-100 text-gray-900',
    emptyCell: 'bg-gray-50'
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];


// --- COMPONENTE PRINCIPAL ---

export const CalendarioEscenarios: React.FC<CalendarioEscenariosProps> = ({ idCompany }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    
    const currentCompanyId = idCompany ?? 1;
    const [escenarios] = useState<Escenario[]>([{ 
        id: 1, nombre: 'Cancha 1', descripcion: 'Cancha de fútbol 5', tipo: 'cancha', 
        capacidad: '10', imagenUrl: '', idCompany: currentCompanyId, numero: '1', 
        created_at: '', updated_at: '', imagenes: [], videos: [] 
    }]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const goToPrevMonth = () => {
        setMostrarFormulario(false);
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setMostrarFormulario(false);
        setCurrentDate(new Date(year, month + 1, 1));
    };
    
    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(year, month, day));
        setMostrarFormulario(false);
    };

    const manejarNuevaReserva = () => {
        if (escenarios.length === 0) return;
        setMostrarFormulario(true);
    };

    const manejarCerrarFormulario = () => {
        setMostrarFormulario(false);
    };

    const renderDays = () => {
        const days = [];
        const date = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = date.getDay(); 

        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className={calendarStyles.dayCell + ' ' + calendarStyles.emptyCell}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const isToday = dayDate.toDateString() === new Date().toDateString(); 
            const isSelected = dayDate.toDateString() === selectedDate.toDateString();
            
            let classes = calendarStyles.dayCell;
            
            // 1. DÍA PRESENTE (Prioridad más alta)
            if (isToday) {
                // Aplica el estilo fuerte (bg-indigo-600)
                classes += ` ${calendarStyles.currentDay}`;
            } 
            
            // 2. DÍA SELECCIONADO (Si no es el día presente)
            else if (isSelected) {
                // Aplica el estilo de selección (bg-primary-light)
                classes += ` ${calendarStyles.selectedDay}`;
            }
            // 3. Otros días (manejo de reservas) irían aquí con otros colores.


            days.push(
                <div 
                    key={day} 
                    className={classes} 
                    onClick={() => handleDayClick(day)}
                >
                    <span className="text-xl">{day}</span>
                </div>
            );
        }
        return days;
    };

    const monthTitle = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className={calendarStyles.container}>
            
            {/* TÍTULO Y BOTÓN APILADOS */}
            <div className={calendarStyles.header}>
                <h2 className={calendarStyles.title}>
                    Calendario de Escenarios
                </h2>
                <button
                    onClick={manejarNuevaReserva} 
                    className={calendarStyles.newReservaButton + ' mt-3'} 
                    disabled={escenarios.length === 0}
                >
                    Nueva Reserva
                </button>
            </div>
            
            {/* NAVEGACIÓN DEL CALENDARIO */}
            <div className={calendarStyles.monthContainer}>
                <button onClick={goToPrevMonth} className={calendarStyles.navButton}>
                    &lt; 
                </button>
                <h1 className={calendarStyles.title}>
                    {monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)}
                </h1>
                <button onClick={goToNextMonth} className={calendarStyles.navButton}>
                     &gt;
                </button>
            </div>

            {/* Días de la Semana */}
            <div className={calendarStyles.weekdays}>
                {WEEKDAYS.map(day => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            {/* Grid del Calendario */}
            <div className={calendarStyles.dayGrid}>
                {renderDays()}
            </div>
            
            {/* RENDERIZADO CONDICIONAL DEL MODAL */}
            {mostrarFormulario && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg p-0 mx-4 overflow-hidden transition-all transform scale-100 bg-white border shadow-2xl rounded-xl">
                        <div className="p-6">
                            <h2 className="pb-3 mb-4 text-xl font-bold text-gray-800 border-b">
                                Formulario de Nueva Reserva
                            </h2>
                            <ReservaEscenarioForm
                                fechaSeleccionada={selectedDate}
                                escenarios={escenarios} 
                                currentCompanyId={currentCompanyId}
                                reservaAEditar={null} 
                                onGuardar={manejarCerrarFormulario} 
                                onCancelar={manejarCerrarFormulario}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* SECCIÓN DE AGENDA */}
            <div className="pt-4 mt-8 border-t border-gray-200">
                <h3 className="mb-3 text-xl font-semibold">
                    Agenda: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <p className="p-3 text-gray-600 border rounded-lg border-info-clarity bg-info-light">
                    Aquí se mostraría la lista de reservas para la fecha seleccionada.
                </p>
            </div>
        </div>
    );
};

export default CalendarioEscenarios;