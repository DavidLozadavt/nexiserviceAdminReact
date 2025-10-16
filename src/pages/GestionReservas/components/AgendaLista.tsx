// AgendaLista.tsx
// este módulo se encarga de renderizar la lista de reservas para el dia seleccionado
import React from 'react';
import { Reserva } from '../types';
import { ReservaGestor } from './ReservaGestor'; 

interface AgendaListaProps {
    fechaSeleccionada: Date;
    reservasVisibles: Reserva[]; // Lista FILTRADA y LIMITADA (para renderizado)
    reservasDelDiaSeleccionado: Reserva[]; // Lista FILTRADA y COMPLETA (para cálculo de "Ver más")
    hayMasReservas: boolean;
    mostrarTodasLasReservas: boolean;
    toggleMostrarReservas: () => void;
    LIMITE_RESERVAS_VISIBLES: number;
    manejarModificacion: (reserva: Reserva) => void; 
    manejarCancelacion: (reserva: Reserva) => void; 
}

export const AgendaLista = ({
    fechaSeleccionada,
    reservasVisibles,
    reservasDelDiaSeleccionado,
    hayMasReservas,
    mostrarTodasLasReservas,
    toggleMostrarReservas,
    LIMITE_RESERVAS_VISIBLES,
    manejarModificacion,
    manejarCancelacion,
}: AgendaListaProps) => { 
    
    // 🔑 Usamos reservasDelDiaSeleccionado.length para el cálculo total de reservas filtradas del día.
    const totalReservasFiltradasDelDia = reservasDelDiaSeleccionado.length;
    
    // 🔑 El mensaje "No hay reservas" debe basarse en la lista filtrada completa.
    const noHayReservasVisibles = totalReservasFiltradasDelDia === 0;
    
    return (
        // 🔑 Eliminamos el mb-3 para evitar doble espaciado con el título del padre
        <div className="mb-8"> 
            {/* ❌ ELIMINADO: Se eliminó el <h3> con el título, ahora está en CalendarioReservasUI.tsx */}
            
            {noHayReservasVisibles ? (
                // 🔑 MENSAJE: Ahora el mensaje indica que no hay resultados con el filtro aplicado.
                <p className="p-3 text-gray-600 border border-yellow-200 rounded-lg bg-yellow-50">
                    No hay reservas para mostrar con el filtro y la fecha seleccionada.
                </p>
            ) : (
                <>
                    <ul className="space-y-2">
                        {/* Se usa SOLAMENTE ReservaGestor, ya que este incluye el <li> y el contenido */}
                        {reservasVisibles.map((r, i) => ( 
                            <ReservaGestor 
                                // 🔑 Uso el idAgenda o un índice temporal, asegurando una clave única
                                key={r.idAgenda ? r.idAgenda : `reserva-${i}`} 
                                reserva={r}
                                onModificar={manejarModificacion}
                                onCancelar={manejarCancelacion}
                                // NOTA: ReservaGestor debe manejar la visualización de "CANCELADA"
                            />
                        ))}
                    </ul>

                    {hayMasReservas && (
                        <button
                            onClick={toggleMostrarReservas}
                            className="w-full py-2 mt-3 text-sm font-medium text-blue-400 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                        >
                            {mostrarTodasLasReservas 
                                ? "Ver menos (Mostrar solo 3)" 
                                : `Ver más (${totalReservasFiltradasDelDia - LIMITE_RESERVAS_VISIBLES} adicionales)`
                            }
                        </button>
                    )}
                </>
            )}
        </div>
    );
};