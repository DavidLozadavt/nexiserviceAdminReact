import React from 'react';
import { Agenda, EstadoFiltro, ConfiguracionRepeticion } from '../typesEscenario'; 

const estadosFiltro: { label: string, value: EstadoFiltro }[] = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'Agendadas', value: 'AGENDADO' },
    { label: 'Finalizadas', value: 'COMPLETADO' }, 
];

// Función de utilidad para formatear la hora a 12h
const formatTime = (dateString: string): string => {
    if (!dateString) return '??:??';
    
    const date = new Date(dateString);
    
    // Opciones para el formato de 12 horas con minutos
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    };
    
    return date.toLocaleTimeString('es-ES', timeOptions);
};


export const AgendaListaEscenario = ({
  selectedDate,
  reservasDelDia,
  onEdit,
  onCancel,
  onFinalize,
  onFinalizeSerie,
  filtroEstado,
  setFiltroEstado,
  cargandoAgendas,
}: {
  selectedDate: Date;
  reservasDelDia: any[];
  onEdit: (reserva: any) => void;
  onCancel: (reserva: any) => void;
  onFinalize: (reserva: any) => void;
  onFinalizeSerie: (idAgenda: number) => void;
  filtroEstado: string;
  setFiltroEstado: (estado: EstadoFiltro) => void;
  cargandoAgendas: boolean;
}) => {
    
    const formattedDate = selectedDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const isActionDisabled = (agenda: Agenda) => {
        return agenda.estado === 'COMPLETADO' || agenda.estado === 'CANCELADO';
    };
    
    const canFinalize = (agenda: Agenda) => {
        return agenda.estado === 'AGENDADO' || agenda.estado === 'EN_PROGRESO';
    };
    
    const canCancel = (agenda: Agenda) => {
        return agenda.estado !== 'CANCELADO' && agenda.estado !== 'COMPLETADO';
    };
    
    const canFinalizeSerie = (agenda: Agenda) => {
        return agenda.idConfiguracionRepeat > 0 && canFinalize(agenda);
    };

    return (
        <div className="pt-4 mt-8 border-t border-gray-200 dark:border-coal-400">

            {/* ... (Filtros y Título) ... */}
            <div className="flex items-center p-3 mb-4 space-x-3 bg-gray-100 border border-gray-200 rounded-lg dark:bg-coal-500 dark:border-coal-400">
                <span className="font-semibold text-gray-700 dark:text-gray-200">Filtrar por Estado:</span>
                
                <div className="flex space-x-2 overflow-x-auto">
                    {estadosFiltro.map((filtro) => (
                        <button
                            key={filtro.value}
                            onClick={() => setFiltroEstado(filtro.value)}
                            disabled={cargandoAgendas} 
                            className={`
                                px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 
                                ${filtroEstado === filtro.value
                                    ? 'bg-blue-400 text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 dark:bg-coal-600 dark:text-gray-300 dark:border-coal-400'
                                }
                            `}
                        >
                            {filtro.label}
                        </button>
                    ))}
                </div>
                {cargandoAgendas && <span className="text-sm text-blue-400 dark:text-blue-400">Cargando...</span>}
            </div>
            
            <h3 className="mb-3 text-xl font-semibold dark:text-gray-800">
                Reservas para: {formattedDate}
            </h3>
            
            <div className="space-y-3">
                {reservasDelDia.length > 0 ? (
                    reservasDelDia.map(agenda => {
                        
                        const asignacion = agenda.asignaciones_responsables?.[0]; 
                        
                        const isRecurring = agenda.idConfiguracionRepeat > 0;
                        
                        const fechaFinRepeticionISO = (agenda as any).fecha_fin_repeticion; 
                        let fechaFinRepeticionFormateada = '';
                        
                        if (fechaFinRepeticionISO) {
                            try {
                                const fechaLocalString = `${fechaFinRepeticionISO}T00:00:00`; 
                                fechaFinRepeticionFormateada = new Date(fechaLocalString).toLocaleDateString('es-ES', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                });
                                
                            } catch (e) {
                                fechaFinRepeticionFormateada = fechaFinRepeticionISO;  
                            }
                        }
                        
                        const escenarioNombre = asignacion?.escenario?.nombre || 'Escenario Desconocido';
                        const clienteNombre = asignacion?.cliente?.nombre || 'Cliente Anónimo';
                        const servicioNombre = asignacion?.servicio?.nombre || 'Servicio N/A';
                        
                        const idReserva = agenda.id;
                        const isDisabled = isActionDisabled(agenda);
                        
                       
                        const idServicio = asignacion?.idServicio || 'N/A'; 
const nota = agenda.nota || 'Sin notas';
                        // AJUSTE PARA FECHA/HORA
                        const startDateTimeLocal = `${agenda.fechaInicial}T${agenda.horaInicial}`;
                        const endDateTimeLocal = agenda.horaFinal 
                            ? `${agenda.fechaFinal || agenda.fechaInicial}T${agenda.horaFinal}`
                            : startDateTimeLocal; 

                        const formattedHoraInicio = formatTime(startDateTimeLocal);
                        const formattedHoraFin = formatTime(endDateTimeLocal);

                        const startDateOnly = agenda.fechaInicial;
                        const endDateOnly = agenda.fechaFinal || agenda.fechaInicial;
                        const isMultiDay = startDateOnly !== endDateOnly;

                        let endDayDisplay = '';
                        if (isMultiDay) {
                            const endDayOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
                            endDayDisplay = new Date(endDateTimeLocal).toLocaleDateString('es-ES', endDayOptions);
                            endDayDisplay = ` (${endDayDisplay})`;
                        }
                        const formattedTimeRange = `${formattedHoraInicio} - ${formattedHoraFin}${endDayDisplay}`;
                        

                        return (
                            <div key={agenda.id} className="p-4 bg-white border shadow-md rounded-xl dark:bg-coal-500 dark:border-coal-400">
                                
                                {/* ... (Encabezado y Estado) ... */}
                                <div className="flex items-center justify-between">
                                    {/* HORA Y ESCENARIO */}
                                    <div className='flex items-center gap-3'>
                                        <p className="text-xl font-extrabold text-blue-600 dark:blue-indigo-400">
                                            {formattedTimeRange}
                                        </p>
                                        <p className="font-semibold text-gray-800 text-md dark:text-gray-800">
                                            🏟️ {escenarioNombre}
                                        </p>
                                    </div>
                                    
                                    {/* Estado de la reserva */}
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
                                        ${agenda.estado === 'AGENDADO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                        agenda.estado === 'EN_PROGRESO' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                        agenda.estado === 'COMPLETADO' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                                        agenda.estado === 'CANCELADO' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                            'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`
                                    }>
                                        {agenda.estado}
                                    </span>
                                </div>
                                
                                {/* INDICADOR DE RECURRENCIA CON FECHA DE FIN */}
                                {isRecurring && (
                                    <div className="flex items-center gap-2 p-1 mt-2 text-sm font-medium bg-gray-300 rounded-lg text-gray-750 dark:bg-gray-300 dark:text-gray-800">
                                        <span>🔁Reserva Recurrente  </span>
                                        {/* Muestra la fecha de fin de la repetición */}
                                        {fechaFinRepeticionFormateada && (
                                            <span className="ml-auto text-xs font-normal whitespace-nowrap">
                                                Finaliza: **{fechaFinRepeticionFormateada}**
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                <hr className="my-2 border-gray-100 dark:border-coal-600" />

                                {/* ... (Detalles Ampliados) ... */}
                                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <p>
                                        <span className="font-bold text-gray-700 dark:text-gray-800">Cliente:</span> {clienteNombre}
                                    </p>
                                    <p>
                                        <span className="font-bold text-gray-700 dark:text-gray-800"> Servicio:</span> {servicioNombre}
                                        <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">(ID S: {idServicio})</span>
                                    </p>
                                    <p>
                                        <span className="font-bold text-gray-700 dark:text-gray-800">Nota:</span> {nota}📝 
                                    </p>
                                    <p className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                                        ID Reserva: {idReserva}
                                        {isRecurring && ` | Configuración ID: ${agenda.idConfiguracionRepeat}`} 
                                    </p>
                                </div>
                                
                                {/* 4. BOTONES DE ACCIÓN */}
                                <div className="flex justify-end mt-4 space-x-2">
                                    
                                    {/* 1. Botón FINALIZAR (Solo esta ocurrencia) */}
                                    {canFinalize(agenda) && (
                                        <button 
                                            onClick={() => onFinalize(agenda.id)}
                                            className="px-3 py-1 text-xs font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500"
                                            disabled={isDisabled}
                                        >
                                            Finalizar
                                        </button>
                                    )}
                                    
                                    {/* AGREGADO PARA FINALIZAR SERIE: Botón FINALIZAR SERIE */}
                                    {canFinalizeSerie(agenda) && (
                                        <button 
                                            onClick={() => onFinalizeSerie(agenda.id)}
                                            className="px-3 py-1 text-xs font-medium text-white transition-colors bg-blue-400 rounded-lg hover:bg-blue-800 disabled:bg-gray-700 disabled:text-gray-500"
                                            
                                            disabled={isDisabled} 
                                        >
                                            Finalizar Serie
                                        </button>
                                    )}
                                    
                                    {/* 2. Botón MODIFICAR (Solo si puede editar) */}
                                    {!isDisabled && (
                                        <button 
                                            onClick={() => onEdit(agenda)}
                                            className="px-3 py-1 text-xs font-medium text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500"
                                            disabled={isDisabled}
                                        >
                                            Modificar
                                        </button>
                                    )}
                                    
                                    {/* 3. Botón ELIMINAR (Solo si puede cancelar) */}
                                    {canCancel(agenda) && (
                                        <button 
                                            onClick={() => onCancel(agenda)}
                                            className="px-3 py-1 text-xs font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500"
                                            disabled={isDisabled}
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="p-3 text-gray-600 border border-blue-400 rounded-lg dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30">
                        No hay reservas para la fecha seleccionada.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AgendaListaEscenario;