import React from 'react';
import { Agenda } from '../typesEscenario'; 

// 1. INTERFAZ ACTUALIZADA: Incluye las funciones de gestión de reservas
interface AgendaListaEscenarioProps {
    selectedDate: Date;
    reservasDelDia: Agenda[];
    // Funciones de manejo de acciones (pasadas desde CalendarioEscenarios)
    onEdit: (agenda: Agenda) => void;
    onCancel: (agendaId: number) => Promise<void>;
    onFinalize: (agendaId: number) => Promise<void>;
}

export const AgendaListaEscenario: React.FC<AgendaListaEscenarioProps> = ({ 
    selectedDate, 
    reservasDelDia,
    onEdit, 
    onCancel, 
    onFinalize 
}) => {
    
    // Función para determinar si los botones de acción deben estar deshabilitados
    const isActionDisabled = (agenda: Agenda) => {
        // Deshabilitar si el estado ya está gestionado/cerrado
        return agenda.estado === 'FINALIZADO' || agenda.estado === 'CANCELADO';
    };

    return (
        // ✅ DARK MODE: Borde divisor sutil
        <div className="pt-4 mt-8 border-t border-gray-200 dark:border-coal-400">
            {/* ✅ DARK MODE: Título blanco */}
            <h3 className="mb-3 text-xl font-semibold dark:text-gray-100">
                Reservas para: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-3">
                {reservasDelDia.length > 0 ? (
                    reservasDelDia.map(agenda => {
                        const isDisabled = isActionDisabled(agenda);
                        
                        return (
                            // ✅ DARK MODE: Fondo de tarjeta de reserva oscuro (coal-500)
                            <div key={agenda.id} className="p-3 bg-white border rounded-lg shadow-sm dark:bg-coal-500 dark:border-coal-400">
                                
                                <div className="flex items-start justify-between">
                                    {/* ✅ DARK MODE: Texto del escenario en blanco */}
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                                        {/* Acceso seguro a las relaciones */}
                                        {agenda.asignaciones_responsables[0]?.escenario?.nombre || 'Escenario N/A'}
                                        
                                        {/* Estado de la reserva */}
                                        <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full 
                                            ${agenda.estado === 'AGENDADO' ? 'bg-indigo-600 text-white dark:bg-indigo-700 dark:text-gray-100' :
                                            agenda.estado === 'EN_PROGRESO' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                            agenda.estado === 'FINALIZADO' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                            agenda.estado === 'CANCELADO' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                                'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`
                                        }>
                                            {agenda.estado}
                                        </span>
                                    </p>
                                </div>

                                {/* Detalles de la Reserva */}
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Hora: {agenda.horaInicial.substring(0, 5)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Cliente: {agenda.asignaciones_responsables[0]?.cliente?.nombre || 'Anónimo'}
                                </p>
                                
                                {/* 3. BOTONES DE ACCIÓN */}
                                <div className="flex justify-end mt-3 space-x-2">
                                    
                                    {/* 1. Botón FINALIZAR (Verde) */}
                                    <button 
                                        onClick={() => onFinalize(agenda.id)}
                                        disabled={isDisabled}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors 
                                            ${isDisabled 
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                                : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        Finalizar
                                    </button>
                                    
                                    {/* 2. Botón MODIFICAR (Índigo/Morado, para abrir el modal) */}
                                    <button 
                                        onClick={() => onEdit(agenda)}
                                        disabled={isDisabled}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors 
                                            ${isDisabled 
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                    >
                                        Modificar
                                    </button>
                                    
                                    {/* 3. Botón CANCELAR (Rojo) */}
                                    <button 
                                        onClick={() => onCancel(agenda.id)}
                                        disabled={isDisabled}
                                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors 
                                            ${isDisabled 
                                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                                : 'bg-red-600 text-white hover:bg-red-700'}`}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    // ✅ DARK MODE: Mensaje de no reservas con estilos de información
                    <p className="p-3 text-gray-600 border border-blue-400 rounded-lg dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30">
                        No hay reservas para la fecha seleccionada.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AgendaListaEscenario;