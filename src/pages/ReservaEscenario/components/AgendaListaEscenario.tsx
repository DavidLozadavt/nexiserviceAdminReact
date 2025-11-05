import React from 'react';
import { Agenda } from '../typesEscenario'; 

interface AgendaListaEscenarioProps {
    selectedDate: Date;
    reservasDelDia: Agenda[];
    
}

export const AgendaListaEscenario: React.FC<AgendaListaEscenarioProps> = ({ selectedDate, reservasDelDia }) => {
    
    return (
        <div className="pt-4 mt-8 border-t border-gray-200">
            <h3 className="mb-3 text-xl font-semibold">
                Reservas para: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-3">
                {reservasDelDia.length > 0 ? (
                    reservasDelDia.map(agenda => (
                        <div key={agenda.id} className="p-3 border rounded-lg shadow-sm bg-gray-50">
                            <p className="font-semibold text-gray-800">
                                {/* Se accede a las relaciones cargadas */}
                                {agenda.asignaciones_responsables[0]?.escenario?.nombre || 'Escenario N/A'}
                                <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full 
                                    ${agenda.estado === 'AGENDADO' ? 'bg-primary-light text-primary-clarity' :
                                        agenda.estado === 'EN_PROGRESO' ? 'bg-warning-light text-warning-clarity' :
                                            'bg-gray-200 text-gray-600'}`
                                }>
                                    {agenda.estado}
                                </span>
                            </p>
                            <p className="text-sm text-gray-600">Hora: {agenda.horaInicial.substring(0, 5)}</p>
                            <p className="text-sm text-gray-500">
                                Cliente: {agenda.asignaciones_responsables[0]?.cliente?.nombre || 'Anónimo'}
                            </p>
                            {/* Puedes añadir botones de acción aquí */}
                            {/* <div className="mt-2 text-right">
                                <button className="text-sm font-medium text-primary hover:text-primary-active">Editar</button>
                            </div> */}
                        </div>
                    ))
                ) : (
                    <p className="p-3 text-gray-600 border rounded-lg border-info-clarity bg-info-light">
                        No hay reservas para la fecha seleccionada.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AgendaListaEscenario;