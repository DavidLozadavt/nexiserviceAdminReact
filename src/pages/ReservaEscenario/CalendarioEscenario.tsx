import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Escenario, ReservaEscenario } from './typesEscenario'; 
import ReservaEscenarioForm from "../ReservaEscenario/components/ReservaEscenarioForm";interface CalendarioEscenariosProps {
    idCompany?: number; 
}

// 🔹 ESTILOS AJUSTADOS PARA EL TEMA (MODO CLARO/OSCURO) 🔹
// Se reemplazaron las clases genéricas de Tailwind (ej. bg-white, bg-blue-500)
// por las clases semánticas definidas en tu tailwind.config.js (ej. bg-light, bg-primary).
const calendarStyles = {
    // Contenedor principal usa 'bg-light' (blanco en claro, oscuro en dark)
    // y 'shadow-card' de tu tema.
    container: 'p-6 bg-light rounded-xl shadow-card max-w-3xl mx-auto', 
    header: 'mb-4',
    // Los colores de texto como text-gray-800 ya son variables en tu tema, no necesitan cambio.
    title: 'text-2xl font-bold text-gray-800',
    // bg-secondary y text-gray-800 ya son variables.
    navButton: 'px-3 py-1 bg-secondary text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-300',
    // 'bg-primary' y 'text-primary-inverse' (en lugar de text-white)
    newReservaButton: 'px-4 py-2 bg-primary text-primary-inverse rounded-lg hover:bg-primary-active transition-colors font-medium text-sm', 
    monthContainer: 'flex justify-between items-center w-full mb-4 pb-2 border-b border-gray-200', 
    weekdays: 'grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2',
    dayGrid: 'grid grid-cols-7 gap-1',
    dayCell: 'p-3 h-16 flex flex-col items-center justify-center text-center rounded-lg cursor-pointer transition-all border border-transparent hover:bg-gray-100',
    
    // 'border-primary' (en lugar de border-blue-300) y 'text-gray-900' (en lugar de text-black)
    currentDay:
        'border-2 border-primary text-gray-900 font-semibold rounded-full',
    // 'bg-primary' y 'text-primary-inverse'
    currentDayNumber:
        'flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-inverse font-bold',
    
    // 'border-primary' y 'bg-primary-light' (en lugar de border-blue-300 y bg-blue-100)
    selectedDay: 'border-2 border-primary bg-primary-light text-gray-900',
    // 'bg-gray-100' (en lugar de bg-gray-50, que no estaba definido)
    emptyCell: 'bg-gray-100'
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const CalendarioEscenarios: React.FC<CalendarioEscenariosProps> = ({ idCompany }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [escenarios, setEscenarios] = useState<Escenario[]>([]);
const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<Escenario | null>(null);    
    const currentCompanyId = idCompany ?? 1;

    // 🔹 Cargar escenarios desde API
    useEffect(() => {
        const fetchEscenarios = async () => {
            try {
                const response = await axios.get("/escenarios"); // ✅ esta es tu ruta Laravel
                setEscenarios(response.data);
            } catch (error) {
                console.error('Error al cargar escenarios:', error);
            }
        };
        fetchEscenarios();
    }, [currentCompanyId]);

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
            
            // ❗ Lógica de estilo actualizada
            if (isToday && isSelected) {
                // Si es hoy Y está seleccionado, priorizar 'selectedDay'
                classes += ` ${calendarStyles.selectedDay}`;
            } else if (isToday) {
                // Si es solo hoy
                classes += ` ${calendarStyles.currentDay}`;
            } else if (isSelected) {
                // Si es solo seleccionado
                classes += ` ${calendarStyles.selectedDay}`;
            }

            // Lógica para el número del día (círculo azul para "hoy")
            const dayNumberClasses = (isToday) 
                ? calendarStyles.currentDayNumber 
                : "text-xl";

            days.push(
                <div 
                    key={day} 
                    className={classes} 
                    onClick={() => handleDayClick(day)}
                >
                    <span className={dayNumberClasses}>{day}</span>
                </div>
            );
        }
        return days;
    };

    const monthTitle = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    return (
        // El contenedor principal ya usa 'bg-light' de 'calendarStyles'
        <div className={calendarStyles.container}>
            
            {/* 🔷 Escenarios disponibles */}
            <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-700">
                    Escenarios disponibles
                </h2>

                {escenarios.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay escenarios disponibles.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {escenarios.map((escenario) => (
                            <div
                                key={escenario.id}
                                onClick={() => setEscenarioSeleccionado(escenario)}
                                // 🔹 Clases de selección AHORA USAN el tema 🔹
                                className={`cursor-pointer border rounded-xl p-3 text-center shadow-sm hover:shadow-md transition
                                    ${escenarioSeleccionado === escenario 
                                        ? 'border-primary bg-primary-light' // Antes: border-blue-500 bg-blue-50
                                        : 'border-gray-200'
                                    }
                                `}
                            >
                                {escenario.imagenUrl ? (
                                    <img
                                        src={escenario.imagenUrl}
                                        alt={escenario.nombre}
                                        className="object-cover w-full h-24 mb-2 rounded-lg"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-24 text-sm text-gray-400 bg-gray-100 rounded-lg">
                                        Sin imagen
                                    </div>
                                )}
                                <p className="font-semibold text-gray-800">{escenario.nombre}</p>
                                <p className="text-sm text-gray-500">Capacidad: {escenario.capacidad}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TÍTULO Y BOTÓN */}
            <div className={calendarStyles.header}>
                <h2 className={calendarStyles.title}>Calendario de Escenarios</h2>
                <button
                    onClick={manejarNuevaReserva} 
                    className={calendarStyles.newReservaButton + ' mt-3'} 
                    disabled={!escenarioSeleccionado}
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
            
            {/* MODAL DE RESERVA */}
            {mostrarFormulario && escenarioSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    {/* 🔹 Contenido del modal AHORA USA 'bg-light' 🔹 */}
                    <div className="w-full max-w-lg p-0 mx-4 overflow-hidden border border-gray-200 shadow-2xl bg-light rounded-xl">
                        <div className="p-6">
                            <h2 className="pb-3 mb-4 text-xl font-bold text-gray-800 border-b border-gray-200">
                                Formulario de Nueva Reserva
                            </h2>
                            <ReservaEscenarioForm
                                fechaSeleccionada={selectedDate}
                                escenarios={escenarios} 
                                currentCompanyId={currentCompanyId}
                                reservaAEditar={null} 
                                escenarioInicial={escenarioSeleccionado}
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
                {/* Esta sección ya estaba usando colores semánticos (info-clarity, info-light), ¡perfecto! */}
                <p className="p-3 text-gray-600 border rounded-lg border-info-clarity bg-info-light">
                    Aquí se mostraría la lista de reservas para la fecha seleccionada.
                </p>
            </div>
        </div>
    );
};

export default CalendarioEscenarios;