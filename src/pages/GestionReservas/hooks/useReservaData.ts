// useReservaData.ts

import axios, { AxiosResponse } from 'axios';
import { useState, useCallback, useEffect } from "react";
import { Reserva, Prestador, AgendaResponse } from "../types"; 


const fetchReservas = async (idCompany: number): Promise<Reserva[]> => {
    try {
        const response: AxiosResponse<AgendaResponse[]> = await axios.get(
            `/agendas` 
        );
        
        const rawAgendas = response.data;
        
        const agendasConDatosValidos = rawAgendas
            .filter(agenda => 
                agenda.fechaInicial && 
                agenda.asignaciones_responsables && 
                agenda.asignaciones_responsables.length > 0
            );
        
        const reservasMapeadas: Reserva[] = agendasConDatosValidos
            .map(agenda => {
                
                const asignacion = agenda.asignaciones_responsables[0];
                const responsable = asignacion.responsable;
                const cliente = asignacion.cliente;
                const servicio = asignacion.servicio;
                
                if (!responsable || !cliente || !servicio) {
                    return null; 
                }

                const nombrePrestador = `${responsable.nombre1 || ''} ${responsable.apellido1 || ''}`.trim();
                const nombreCliente = cliente.nombre || `Cliente Desconocido`;
                
                // 🟢 CORRECCIÓN: Usar 'agenda' en lugar de 'r' para acceder a las propiedades
                return {
                    // ID de la Agenda
                    id: agenda.id, 
                    idAgenda: agenda.id, 
                    
                    // Datos de la Reserva
                    fecha: agenda.fechaInicial!, 
                    hora: agenda.horaInicial || '00:00:00', 
                    motivo: agenda.nota || 'Sin motivo',
                    cliente: nombreCliente,
                    servicio: servicio.nombre || `Servicio Desconocido`,
                    prestador: nombrePrestador,
                    
                    // Datos del Cliente APLANADOS
                    idCliente: cliente.id,
                    documentoCliente: cliente.identificacion || 'N/A', 
                    emailCliente: cliente.email || 'N/A',             
                    telefonoCliente: cliente.telefono || cliente.celular || 'N/A', 
                    
                    // 🔑 CAMBIO CRÍTICO: Usar 'agenda.estado' y proporcionar un valor por defecto.
                    estado: agenda.estado || 'ACTIVO', 
                } as Reserva;
            })
            .filter((reserva): reserva is Reserva => reserva !== null); 

        return reservasMapeadas;
        
    } catch (error) {
        console.error("❌ Error al cargar las reservas desde la API:", error);
        return []; 
    }
};


const fetchPrestadores = async (idCompany: number): Promise<Prestador[]> => {
    
    try {
        const response: AxiosResponse<Prestador[]> = await axios.get(
            `/get_prestadores_company/${idCompany}`
        );
        
        const rawPrestadores = response.data;

        const processedPrestadores: Prestador[] = rawPrestadores.map(prestador => {
            const persona = prestador.persona;
            
            const nombre1 = persona?.nombre1 || '';
            const apellido1 = persona?.apellido1 || '';
            const nombreCompletoGenerado = `${nombre1} ${apellido1}`.trim();
            
            const nombreFinal = nombreCompletoGenerado || `Prestador ID ${prestador.id}`;

            return {
                ...prestador,
                nombreCompleto: nombreFinal, 
                persona: {
                    ...persona, 
                    nombreCompleto: nombreFinal 
                }
            } as Prestador; 
        });

        return processedPrestadores;
        
    } catch (error) {
        console.error("❌ Error al cargar prestadores desde la API:", error);
        return []; 
    }
};

// --- Custom Hook para la Carga de Datos ---

export const useReservaData = (idCompany: number) => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [prestadores, setPrestadores] = useState<Prestador[]>([]);
    const [cargandoPrestadores, setCargandoPrestadores] = useState(true);

    const loadReservas = useCallback(async () => {
        if (!idCompany) return;
        try {
            const data = await fetchReservas(idCompany); 
            setReservas(data);
        } catch (error) {
            console.error("Error al cargar reservas:", error);
        }
    }, [idCompany]);

    // Carga de reservas
    useEffect(() => {
        loadReservas();
    }, [loadReservas]); 

    // Carga de prestadores
    useEffect(() => {
        if (!idCompany) { 
            setCargandoPrestadores(false);
            return;
        }
        
        setCargandoPrestadores(true); 
        const loadPrestadores = async () => {
            try {
                const data = await fetchPrestadores(idCompany); 
                setPrestadores(data);
            } catch (error) {
                console.error("Error al cargar prestadores:", error);
            } finally {
                setCargandoPrestadores(false);
            }
        };
        loadPrestadores();
    }, [idCompany]); 
    
    // Retornamos solo los datos y la función de recarga
    return {
        reservas,
        prestadores,
        cargandoPrestadores,
        loadReservas,
    };
};