import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Escenario, ReservaEscenario, Agenda } from './typesEscenario'; 

// Importaciones de Componentes Modulares
import ReservaEscenarioForm from "../ReservaEscenario/components/ReservaEscenarioForm"; 
import AgendaListaEscenario from "../ReservaEscenario/components/AgendaListaEscenario";
import SelectorEscenarios from "../ReservaEscenario/components/SelectorEscenario"; 
import CalendarioNav from "../ReservaEscenario/components/CalendarioNav"; 


interface CalendarioEscenariosProps {
    idCompany?: number;
}

// 🔹 ESTILOS AJUSTADOS PARA EL TEMA (MODO CLARO/OSCURO) 🔹
const calendarStyles = {
    container: 'p-6 bg-light rounded-xl shadow-card max-w-3xl mx-auto',
    header: 'mb-4',
    title: 'text-2xl font-bold text-gray-800',
    navButton: 'px-3 py-1 bg-secondary text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-300',
    newReservaButton: 'px-4 py-2 bg-primary text-primary-inverse rounded-lg hover:bg-primary-active transition-colors font-medium text-sm',
    monthContainer: 'flex justify-between items-center w-full mb-4 pb-2 border-b border-gray-200',
    weekdays: 'grid grid-cols-7 text-center text-sm font-semibold text-gray-600 mb-2',
    dayGrid: 'grid grid-cols-7 gap-1',
    dayCell: 'p-3 h-16 flex flex-col items-center justify-center text-center rounded-lg cursor-pointer transition-all border border-transparent hover:bg-gray-100',
    currentDay:
        'border-2 border-primary text-gray-900 font-semibold rounded-full',
    currentDayNumber:
        'flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-inverse font-bold',
    selectedDay: 'border-2 border-primary bg-primary-light text-gray-900',
    emptyCell: 'bg-gray-100'
};

// Se eliminan los WEEKDAYS de aquí ya que ahora están en CalendarioNav.tsx

export const CalendarioEscenarios: React.FC<CalendarioEscenariosProps> = ({ idCompany }) => {

    // --- 1. ESTADOS ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [escenarios, setEscenarios] = useState<Escenario[]>([]);
    const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<Escenario | null>(null);
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const currentCompanyId = idCompany ?? 1;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // --- 2. FUNCIONES DE DATOS ---
    const fetchAgendas = async () => {
        try {
            const response = await axios.get("/gestion_agendas_escenario");
            setAgendas(response.data);
        } catch (error) {
            console.error('Error al cargar agendas de escenarios:', error);
        }
    };
    
    useEffect(() => {
        const fetchEscenarios = async () => {
            try {
                const response = await axios.get("/escenarios");
                setEscenarios(response.data);
            } catch (error) {
                console.error('Error al cargar escenarios:', error);
            }
        };

        fetchEscenarios();
        fetchAgendas();

    }, [currentCompanyId]);

    // --- 3. FUNCIONES DE MANEJO DE ESTADO ---
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
        // Recargar las agendas al cerrar el formulario (si se guardó algo)
        fetchAgendas(); 
    };

    // --- 4. FUNCIONES DE CÁLCULO / LÓGICA DE CALENDARIO ---
    const getReservasForDay = (day: number): Agenda[] => {
        const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const reservas = agendas.filter(agenda => {
            return agenda.fechaInicial === dayString;
        });

        return reservas;
    }
    
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

            const reservasDelDia = getReservasForDay(day);
            const hasReservas = reservasDelDia.length > 0;
        
            let classes = calendarStyles.dayCell;

            if (isToday && isSelected) {
                classes += ` ${calendarStyles.selectedDay}`;
            } else if (isToday) {
                classes += ` ${calendarStyles.currentDay}`;
            } else if (isSelected) {
                classes += ` ${calendarStyles.selectedDay}`;
            }

            if (hasReservas && !isToday && !isSelected) {
                classes += ' border-2 border-primary-clarity bg-primary-light/50';
            }
            const dayNumberClasses = (isToday)
                ? calendarStyles.currentDayNumber
                : "text-xl";

            days.push(
                <div
                    key={day}
                    className={classes + ' relative'} 
                    onClick={() => handleDayClick(day)}
                >
                    <span className={dayNumberClasses}>{day}</span>
                    {hasReservas && (
                        <div
                            className={`absolute bottom-1 right-1 w-2 h-2 rounded-full 
                                ${reservasDelDia.some(r => r.estado === 'EN_PROGRESO') ? 'bg-warning-clarity' : 'bg-primary-clarity'}`}
                            title={`Reservas: ${reservasDelDia.length}`}
                        />
                    )}
                </div>
            );
        }
        return days;
    };

    const monthTitle = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const reservasDiaSeleccionado = getReservasForDay(selectedDate.getDate());


    // --- 5. RENDERIZADO DEL COMPONENTE PRINCIPAL ---
    return (
        <div className={calendarStyles.container}>

            {/* INTEGRACIÓN 1: Selector de Escenarios */}
            <SelectorEscenarios
                escenarios={escenarios}
                escenarioSeleccionado={escenarioSeleccionado}
                onSelectEscenario={setEscenarioSeleccionado}
            />

            {/* TÍTULO Y BOTÓN DE RESERVA (Depende del estado local) */}
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

            {/* INTEGRACIÓN 2: Navegación del Calendario */}
            <CalendarioNav
                monthTitle={monthTitle}
                goToPrevMonth={goToPrevMonth}
                goToNextMonth={goToNextMonth}
                calendarStyles={calendarStyles}
            />

            {/* Grid del Calendario (Aún incluye la lógica de renderDays) */}
            <div className={calendarStyles.dayGrid}>
                {renderDays()}
            </div>

            {/* MODAL DE RESERVA (Se mantiene para manejar el formulario) */}
            {mostrarFormulario && escenarioSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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

            {/* INTEGRACIÓN 3: Lista de Agendas */}
            <AgendaListaEscenario 
                selectedDate={selectedDate} 
                reservasDelDia={reservasDiaSeleccionado} 
            />
          
        </div>
    );
};

export default CalendarioEscenarios;