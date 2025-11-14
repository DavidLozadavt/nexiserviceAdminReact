import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Escenario, EstadoFiltro, Agenda } from './typesEscenario';

// Importaciones de Componentes Modulares
import ReservaEscenarioForm from "../ReservaEscenario/components/ReservaEscenarioForm";
import AgendaListaEscenario from "../ReservaEscenario/components/AgendaListaEscenario";
import SelectorEscenarios from "../ReservaEscenario/components/SelectorEscenario";
import CalendarioNav from "../ReservaEscenario/components/CalendarioNav";

const estadosFiltro: { label: string, value: EstadoFiltro }[] = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Agendadas', value: 'AGENDADO' },
    { label: 'Finalizadas', value: 'COMPLETADO' },
    { label: 'Canceladas', value: 'CANCELADO' },
];

interface CalendarioEscenariosProps {
    idCompany?: number;
}

const calendarStyles = {
    container: 'p-6 bg-white dark:bg-coal-300 rounded-xl shadow-xl max-w-7xl mx-auto transition-colors',
    innerContainer: 'p-4 bg-white dark:bg-coal-600 rounded-xl shadow-lg',
    header: 'mb-4 flex justify-between items-center',
    title: 'text-2xl font-bold text-gray-800 dark:text-gray-800',
    navButton: 'px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 dark:bg-coal-500 dark:text-gray-100 dark:hover:bg-coal-400',
    newReservaButton: 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-sm disabled:opacity-50',
    monthContainer: 'flex justify-between items-center w-full mb-4 pb-2 border-b border-gray-200 dark:border-coal-400',
    weekdays: 'grid grid-cols-7 text-center text-sm font-semibold text-gray-600 dark:text-gray-800 mb-2',
    dayGrid: 'grid grid-cols-7 gap-1',
    dayCell: 'p-2 h-16 flex flex-col items-center justify-center text-center rounded-lg cursor-pointer transition-all border border-transparent dark:bg-coal-500 hover:bg-indigo-50 dark:hover:bg-coal-400',
    dayNumberBase: 'text-xl font-medium text-gray-900 dark:text-gray-800',
    currentDay:
        'border-2 border-blue-400 dark:border-blue-400 font-bold',
    currentDayNumber:
        'font-bold text-blue-300 dark:text-blue-400',
    selectedDay: 'bg-blue-400 dark:bg-blue-400 text-blue-800 dark:text-white border-blue-600 font-bold',
    hasReservas: 'bg-green-100 dark:bg-green-300/30 border-green-400',
    emptyCell: 'bg-gray-50 dark:bg-coal-600'
};

export const CalendarioEscenarios = ({ idCompany }: { idCompany?: number }) => {

    // --- 1. ESTADOS ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [agendaToEdit, setAgendaToEdit] = useState<Agenda | null>(null);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [escenarios, setEscenarios] = useState<Escenario[]>([]);
    const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<Escenario | null>(null);
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [cargandoAgendas, setCargandoAgendas] = useState(false); //carga para filtros
    const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('AGENDADO');
    const currentCompanyId = idCompany ?? 1;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // --- 2. FUNCIONES DE DATOS ---
    const fetchAgendas = useCallback(async (estado: EstadoFiltro) => {
        setCargandoAgendas(true); // Iniciar carga
        try {
            const estadoParam = estado === 'TODAS' ? '' : estado;

            const response = await axios.get(`/gestion_agendas_escenario`, {
                params: { estado: estadoParam } 
            });
            setAgendas(response.data);
        } catch (error) {
            console.error('Error al cargar agendas de escenarios:', error);
        } finally {
            setCargandoAgendas(false); 
        }
    }, []);

    useEffect(() => {
        const fetchEscenarios = async () => {
            try {
                const response = await axios.get(`/escenarios`);
                setEscenarios(response.data);
            } catch (error) {
                console.error('Error al cargar escenarios:', error);
            }
        };

        fetchEscenarios();
        fetchAgendas(filtroEstado);

    }, [currentCompanyId]);

    useEffect(() => {
        fetchAgendas(filtroEstado);

    }, [filtroEstado]);

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
        fetchAgendas(filtroEstado); 
    };

    const isSelectedDatePast = React.useMemo(() => {
        if (!selectedDate) return false;
        
        const selectedMidnight = new Date(selectedDate);
        selectedMidnight.setHours(23, 59, 59, 999); 

        const now = new Date();
        return selectedMidnight.getTime() < now.getTime();
        
    }, [selectedDate]);
    // --- 4. FUNCIONES DE CÁLCULO / LÓGICA DE CALENDARIO  ---
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
            
            const todayMidnight = new Date();
            todayMidnight.setHours(0, 0, 0, 0); 
            const isPast = dayDate.getTime() < todayMidnight.getTime();            
            const isSelected = dayDate.toDateString() === selectedDate.toDateString();

            const reservasDelDia = getReservasForDay(day);
            const hasReservas = reservasDelDia.length > 0;
            const hasPendingReservas = reservasDelDia.some(r => r.estado === 'EN_PROGRESO');
            let classes = calendarStyles.dayCell;
            let dayNumberClasses = calendarStyles.dayNumberBase;

           if (isPast) {
                classes += ' bg-gray-400 dark:bg-coal-700 text-gray-400 cursor-not-allowed'; 
            } else {
                classes += ' cursor-pointer'; 
            }
    
            if (isSelected) {
                classes += ` ${calendarStyles.selectedDay}`;
                dayNumberClasses = 'font-bold text-white';
            } else if (isToday) {
                classes += ` ${calendarStyles.currentDay}`;
                dayNumberClasses += ` ${calendarStyles.currentDayNumber}`;
            }

            if (hasReservas && !isSelected && !isToday) {
                classes += ` ${calendarStyles.hasReservas}`;
            }

            days.push(
                <div
                    key={day}
                    className={classes + ' relative group'} 
                    onClick={() => handleDayClick(day)}                
                >
                    <span className={dayNumberClasses}>{day}</span>
                    
                   
                    {hasReservas && (
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


    const handleEdit = (agenda: Agenda) => {
        setAgendaToEdit(agenda);
        setIsModalOpen(true);
    };

const handleCancel = async (agenda: Agenda): Promise<void> => {
        
        const isRecurring = agenda.idConfiguracionRepeat > 0;
        let endpoint = `/gestion_agendas_escenario/${agenda.id}`; // Default: eliminación individual
        let confirmMessage = "¿Está seguro que desea Eliminar esta reserva individual? Esta acción es irreversible.";
        let successMessage = "Reserva eliminada con éxito.";

        // Lógica de confirmación para series recurrentes
        if (isRecurring) {
            const confirmSerie = window.confirm(
                "Esta es una reserva recurrente (SERIE). ¿Desea eliminar SÓLO esta ocurrencia (Aceptar) o toda la SERIE (Cancelar)?"
            );

            if (!confirmSerie) {
                // El usuario eligió CANCELAR la eliminación individual, lo que significa que quiere borrar TODA la serie
                if (!window.confirm("CONFIRMAR: ¿Desea eliminar TODA la SERIE de reservas?")) {
                    return; // El usuario canceló la acción de eliminar serie
                }
                
                // NUEVA RUTA PARA ELIMINAR LA SERIE COMPLETA
                endpoint = `/agendas/serie/${agenda.idConfiguracionRepeat}`;
                confirmMessage = ""; // Ya confirmamos arriba
                successMessage = "¡Toda la serie de reservas recurrentes ha sido eliminada con éxito!";

            } else {
                // El usuario eligió ACEPTAR, lo que significa que solo quiere eliminar esta OCURRENCIA
                // Se mantiene el endpoint de eliminación individual, solo necesitamos la confirmación inicial.
                if (!window.confirm(confirmMessage)) return;
            }
        } else {
            // Reserva no recurrente: pedimos la confirmación inicial
            if (!window.confirm(confirmMessage)) return;
        }

        try {
            setCargandoAgendas(true);
            
            // Llama al endpoint determinado (individual o serie)
            await axios.delete(endpoint);

            fetchAgendas(filtroEstado);
            alert(successMessage);
        } catch (error) {
            console.error("Error al eliminar la reserva/serie:", error);
            alert(`Error al eliminar: ${(axios.isAxiosError(error) && error.response?.data?.message) || 'Error de red'}`);
        } finally {
            setCargandoAgendas(false);
        }
    };


    const handleFinalize = async (agendaId: number): Promise<void> => {
        if (!window.confirm("¿Confirma que el servicio ha sido FINALIZADO?")) {
            return;
        }
        try {
            // Usamos la ruta POST específica para terminar el servicio
            await axios.post(`/gestion_finalizar_escenario/${agendaId}`);

            fetchAgendas(filtroEstado);
            alert("Servicio finalizado con éxito.");
        } catch (error) {
            console.error("Error al finalizar el servicio:", error);
            alert(`Error al finalizar el servicio: ${(axios.isAxiosError(error) && error.response?.data?.message) || 'Error de red'}`);
        }
    };

    // --- AGREGADO PARA FINALIZAR SERIE ---
    const handleFinalizeSerie = async (idAgenda: number) => {
        if (!window.confirm("⚠️ ¿Está seguro de que desea finalizar TODA la serie de reservas recurrentes, incluyendo las futuras? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            setCargandoAgendas(true);
            // Llama a la ruta POST del backend para finalizar toda la serie
            const response = await axios.post(`/gestion_finalizar_serie_escenario/${idAgenda}`);

            console.log('Serie finalizada:', response.data.message);
            alert(`Éxito: ${response.data.message}`);

            // Refrescar la lista de agendas para ver los cambios
            fetchAgendas(filtroEstado); 

        } catch (error) {
            console.error('Error al finalizar la serie de reservas:', error);
            alert(`Error al finalizar la serie. Detalles: ${(axios.isAxiosError(error) && error.response?.data?.message) || 'Error de red'}`);
        } finally {
            setCargandoAgendas(false);
        }
    };
    // --- FIN AGREGADO PARA FINALIZAR SERIE ---


    // --- 6. RENDERIZADO DEL COMPONENTE PRINCIPAL ---
    return (
        <div className={calendarStyles.container}>

            <SelectorEscenarios
                escenarios={escenarios}
                escenarioSeleccionado={escenarioSeleccionado}
                onSelectEscenario={setEscenarioSeleccionado}
            />
            <div className={calendarStyles.innerContainer}>
                <div className={calendarStyles.header}>
                    <h2 className={calendarStyles.title}>Calendario de Escenarios</h2>
                    <button
                        onClick={manejarNuevaReserva}
                        className={calendarStyles.newReservaButton}
                       disabled={escenarios.length === 0 || isSelectedDatePast}                    >
                        Nueva Reserva
                    </button>
                </div>

                <CalendarioNav
                    monthTitle={monthTitle}
                    goToPrevMonth={goToPrevMonth}
                    goToNextMonth={goToNextMonth}
                    calendarStyles={calendarStyles}
                />
                <div className={calendarStyles.dayGrid}>
                    {renderDays()}
                </div>
                <AgendaListaEscenario
                    selectedDate={selectedDate}
                    reservasDelDia={reservasDiaSeleccionado}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onFinalize={handleFinalize}
                    onFinalizeSerie={handleFinalizeSerie} 
                    filtroEstado={filtroEstado}
                    setFiltroEstado={setFiltroEstado}
                    cargandoAgendas={cargandoAgendas}
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

            {/* MODAL DE RESERVA edición*/}
            {isModalOpen && agendaToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-lg p-0 mx-4 overflow-hidden bg-white border border-gray-200 shadow-2xl dark:bg-coal-500 dark:border-coal-400 rounded-xl">
                        <div className="p-6">
                            <h2 className="pb-3 mb-4 text-xl font-bold text-gray-800 border-b border-gray-200 dark:text-gray-100 dark:border-coal-400">
                                Editar Reserva
                            </h2>
                            <ReservaEscenarioForm
                                fechaSeleccionada={selectedDate}
                                escenarios={escenarios}
                                currentCompanyId={currentCompanyId}
                                reservaAEditar={agendaToEdit}
                                escenarioInicial={
                                    agendaToEdit?.asignaciones_responsables?.[0]?.escenario || escenarioSeleccionado || null}
                                onGuardar={() => { setIsModalOpen(false); setAgendaToEdit(null); fetchAgendas(filtroEstado); }}
                                onCancelar={() => { setIsModalOpen(false); setAgendaToEdit(null); }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarioEscenarios;