// src/pages/ReservaEscenario/components/CalendarioNav.tsx
import React from 'react';

interface CalendarioNavProps {
    monthTitle: string;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    calendarStyles: any; // Se pasa el objeto de estilos
}

export const CalendarioNav: React.FC<CalendarioNavProps> = ({ 
    monthTitle, 
    goToPrevMonth, 
    goToNextMonth, 
    calendarStyles 
}) => {
    return (
        <>
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
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <span key={day}>{day}</span>
                ))}
            </div>
        </>
    );
};

export default CalendarioNav;