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

// 🔹 ESTILOS AJUSTADOS PARA COINCIDIR CON LA IMAGEN DE MODO OSCURO 🔹
const calendarStyles = {
    // 1. AJUSTE PRINCIPAL: Fondo negro total. Usamos coal-300 de tu config para la tarjeta.
    container: 'p-6 bg-white dark:bg-coal-300 rounded-xl shadow-xl max-w-7xl mx-auto transition-colors',
    
    // 2. AJUSTE PRINCIPAL: El calendario interno será un gris más oscuro aún. Usamos coal-600 para el fondo de las celdas.
    innerContainer: 'p-4 bg-white dark:bg-coal-600 rounded-xl shadow-lg',

    header: 'mb-4 flex justify-between items-center',
    // 3. AJUSTE: Título blanco en modo oscuro.
    title: 'text-2xl font-bold text-gray-800 dark:text-gray-100',
    
    // 4. AJUSTE: Botones de navegación. Fondo negro de tu paleta.
    navButton: 'px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 dark:bg-coal-500 dark:text-gray-100 dark:hover:bg-coal-400',
    
    // 5. AJUSTE: Botón de Nueva Reserva. Mantenemos el contraste de color.
    newReservaButton: 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50',
    
    // 6. AJUSTE: Separador muy sutil en modo oscuro.
    monthContainer: 'flex justify-between items-center w-full mb-4 pb-2 border-b border-gray-200 dark:border-coal-400',
    // 7. AJUSTE: Días de la semana con texto gris claro.
    weekdays: 'grid grid-cols-7 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2',
    
    dayGrid: 'grid grid-cols-7 gap-1',
    // 8. AJUSTE CLAVE: La celda base debe tener el fondo oscuro de la imagen.
    dayCell: 'p-2 h-16 flex flex-col items-center justify-center text-center rounded-lg cursor-pointer transition-all border border-transparent dark:bg-coal-500 hover:bg-indigo-50 dark:hover:bg-coal-400',
    
    // 9. AJUSTE: Día del mes con texto blanco en modo oscuro.
    dayNumberBase: 'text-xl font-medium text-gray-900 dark:text-gray-100',

    // 10. AJUSTE: Día actual con borde morado/azul de la imagen.
    currentDay:
        'border-2 border-indigo-600 dark:border-indigo-400 font-bold',
    
    // 11. AJUSTE: Número de día actual.
    currentDayNumber:
        'font-bold text-indigo-600 dark:text-indigo-400', 
    
    // 12. AJUSTE CLAVE: Día seleccionado con fondo morado/azul oscuro para coincidir con el '6' de la imagen.
    selectedDay: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-white border-indigo-600 font-bold',
    
    // 13. AJUSTE CLAVE: Días con reservas. Fondo verde claro en dark mode para coincidir con '10, 18, 25' de la imagen.
    hasReservas: 'bg-green-100 dark:bg-green-300/30 border-green-400',
    
    // 14. AJUSTE: Celdas vacías (las que no son días del mes) en negro.
    emptyCell: 'bg-gray-50 dark:bg-coal-600'
};

// ... (El resto de la lógica del componente se mantiene igual)

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
        setSelectedDate(prev => new Date(year, month - 1, prev.getDate()));
    };

    const goToNextMonth = () => {
        setMostrarFormulario(false);
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(prev => new Date(year, month + 1, prev.getDate()));
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
            const hasPendingReservas = reservasDelDia.some(r => r.estado === 'EN_PROGRESO'); 
        
            let classes = calendarStyles.dayCell;
            let dayNumberClasses = calendarStyles.dayNumberBase; 
            
            // Lógica de clases: priorizamos seleccionado
            if (isSelected) {
                classes += ` ${calendarStyles.selectedDay}`;
                // Texto blanco cuando está seleccionado (fondo oscuro)
                dayNumberClasses = 'font-bold text-white'; 
            } else if (isToday) {
                // Si es hoy
                classes += ` ${calendarStyles.currentDay}`; 
                dayNumberClasses += ` ${calendarStyles.currentDayNumber}`;
            }

            // Si tiene reservas, agregamos el fondo verde claro/borde 
            if (hasReservas && !isSelected && !isToday) {
                classes += ` ${calendarStyles.hasReservas}`;
            }

            days.push(
                <div
                    key={day}
                    className={classes + ' relative'} 
                    onClick={() => handleDayClick(day)}
                >
                    <span className={dayNumberClasses}>{day}</span>
                    {hasReservas && (
                         // Se mantiene el indicador, pero se ajusta el color del punto
                        <div
                            className={`absolute bottom-1 right-1 w-2 h-2 rounded-full 
                                ${hasPendingReservas ? 'bg-yellow-500' : 'bg-green-600'}`}
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
            
            {/* 🚨 Contenedor interno para el calendario (Estilo de tarjeta de la agenda) */}
            <div className={calendarStyles.innerContainer}>
                
                {/* TÍTULO Y BOTÓN DE RESERVA (Depende del estado local) */}
                <div className={calendarStyles.header}>
                    <h2 className={calendarStyles.title}>Calendario de Escenarios</h2>
                    <button
                        onClick={manejarNuevaReserva}
                        className={calendarStyles.newReservaButton}
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
                
              
                {/* INTEGRACIÓN 3: Lista de Agendas */}
                {/* NOTA: Debes asegurar que AgendaListaEscenario internamente use fondos oscuros (ej: dark:bg-coal-500) */}
                <AgendaListaEscenario 
                    selectedDate={selectedDate} 
                    reservasDelDia={reservasDiaSeleccionado} 
                />
            </div>

            {/* MODAL DE RESERVA */}
            {mostrarFormulario && escenarioSeleccionado && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg p-0 mx-4 overflow-hidden bg-white border border-gray-200 shadow-2xl dark:bg-coal-500 dark:border-coal-400 rounded-xl"> 
                        <div className="p-6">
                            <h2 className="pb-3 mb-4 text-xl font-bold text-gray-800 border-b border-gray-200 dark:text-gray-100 dark:border-coal-400">
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
          
        </div>
    );
};

export default CalendarioEscenarios;