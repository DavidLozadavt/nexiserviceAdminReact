// src/components/CalendarioEscenarios.tsx

import React, { useState } from 'react';

// Estilos mínimos en línea para la estructura básica (deberías usar CSS/Tailwind)
const calendarStyles = {
    container: 'p-6 bg-white rounded-xl shadow-2xl max-w-4xl mx-auto',
    header: 'flex justify-between items-center mb-4 pb-2 border-b border-gray-200',
    title: 'text-2xl font-bold text-gray-800',
    navButton: 'px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300',
    weekdays: 'grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2',
    dayGrid: 'grid grid-cols-7 gap-1',
    dayCell: 'p-3 h-16 flex flex-col items-center justify-center text-center rounded-lg cursor-pointer transition-all border border-transparent hover:bg-gray-100',
    currentDay: 'bg-blue-500 text-white font-bold',
    selectedDay: 'border-2 border-blue-500 bg-blue-50 text-gray-900',
    emptyCell: 'bg-gray-50'
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface CalendarioEscenariosProps {
    // Si se pasa el id de la compañía, se usa, pero no es crucial para el renderizado básico.
    idCompany?: number; 
}

export const CalendarioEscenarios: React.FC<CalendarioEscenariosProps> = ({ idCompany }) => {
    
    // Estado para controlar el mes que se está visualizando
    const [currentDate, setCurrentDate] = useState(new Date());
    // Estado para marcar el día seleccionado por el usuario
    const [selectedDate, setSelectedDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 1. Lógica de Navegación
    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(year, month, day));
        // Aquí es donde en el futuro, podrías llamar a una función para cargar la lista de reservas
        console.log(`Día seleccionado: ${new Date(year, month, day).toLocaleDateString()}`);
    };

    // 2. Lógica para Generar los Días del Mes
    const renderDays = () => {
        const days = [];
        const date = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Determinar el día de la semana (0=Dom, 6=Sáb) del primer día del mes
        // Esto genera las celdas vacías al inicio del calendario.
        const firstDayIndex = date.getDay(); 

        // Rellenar con celdas vacías del mes anterior
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(<div key={`empty-${i}`} className={calendarStyles.dayCell + ' ' + calendarStyles.emptyCell}></div>);
        }

        // Rellenar con los días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const isToday = dayDate.toDateString() === new Date().toDateString();
            const isSelected = dayDate.toDateString() === selectedDate.toDateString();
            
            let classes = calendarStyles.dayCell;
            if (isToday) {
                classes += ` ${calendarStyles.currentDay}`;
            }
            if (isSelected && !isToday) {
                classes += ` ${calendarStyles.selectedDay}`;
            }

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

        // Devolver el grid completo
        return days;
    };

    // Formato de título
    const monthTitle = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className={calendarStyles.container}>
            {/* Encabezado y Navegación */}
            <div className={calendarStyles.header}>
                <button onClick={goToPrevMonth} className={calendarStyles.navButton}>
                    &lt; Mes Anterior
                </button>
                <h1 className={calendarStyles.title}>{monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)}</h1>
                <button onClick={goToNextMonth} className={calendarStyles.navButton}>
                    Mes Siguiente &gt;
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
            
            {/* Espacio para la lista de reservas (donde iría AgendaLista) */}
            <div className="pt-4 mt-8 border-t border-gray-200">
                <h3 className="mb-3 text-xl font-semibold">Reservas para {selectedDate.toLocaleDateString()}</h3>
                <p className="p-3 text-gray-600 border border-yellow-200 rounded-lg bg-yellow-50">
                    Aquí se renderizaría la lista de reservas del día seleccionado.
                </p>
                {/* En el futuro, aquí se llamaría a <AgendaEscenarioLista /> */}
            </div>
        </div>
    );
};

export default CalendarioEscenarios;