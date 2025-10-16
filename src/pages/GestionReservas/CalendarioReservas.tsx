// CalendarioReservas.tsx
import React, { useState } from "react";
import { CalendarioReservasProps, Reserva } from "./types"; 
import { useReservaData } from "./hooks/useReservaData";
// 🔑 IMPORTAR FiltroEstado desde useCalendarLogic
import { useCalendarLogic, FiltroEstado } from "./hooks/useCalendarLogic"; 
import { CalendarioReservasUI } from "./components/CalendarioReservasUI";
import axios from 'axios'; 
import { useSnackbar } from 'notistack'; 

export default function CalendarioReservas({ idCompany }: CalendarioReservasProps) {
    const { enqueueSnackbar } = useSnackbar();
    
    // Estados de UI y Gestión
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [reservaParaModificar, setReservaParaModificar] = useState<Reserva | null>(null);
    
    // 🔑 1. ESTADO DEL FILTRO: Inicializar en 'ACTIVO'
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('ACTIVO');
    
    // 1. Hook de Datos (Carga reservas y prestadores)
    const { reservas, prestadores, cargandoPrestadores, loadReservas } = useReservaData(idCompany);

    // 2. Hook de Lógica de Calendario (Maneja la navegación, cálculos y 🔑 APLICA EL FILTRO)
    const logic = useCalendarLogic(reservas, filtroEstado); // 🔑 Pasar el filtroEstado al hook

    // --- Handlers de Formulario y Gestión ---

    const manejarNuevaReserva = () => {
        if (logic.esDiaInactivo(logic.fechaSeleccionada)) {
            enqueueSnackbar("No puedes crear una reserva en una fecha pasada o un día inactivo.", { variant: 'warning' });
            return;
        }
        if (cargandoPrestadores || prestadores.length === 0) {
            enqueueSnackbar("Esperando datos de prestadores, por favor intenta de nuevo.", { variant: 'info' });
            return;
        }
        setReservaParaModificar(null); 
        setMostrarFormulario(true);
    };

    const manejarModificacion = (reserva: Reserva) => {
        setReservaParaModificar(reserva); 
        setMostrarFormulario(true);      
    };

    // 🎯 AJUSTE DE CANCELACIÓN: Implementación real de la API
    const manejarCancelacion = async (reserva: Reserva) => {
        
        const idAgenda = (reserva as any).id || (reserva as any).idAgenda; 
        let apiUrl = `cancel_reserva_by_agenda_id/${idAgenda}`;

        if (!idAgenda) {
            enqueueSnackbar('❌ ID de la Agenda no encontrado. No se puede cancelar.', { variant: 'error' });
            return;
        }

        try {
            await axios.delete(apiUrl);
            
            enqueueSnackbar(`✅ Reserva ID ${idAgenda} cancelada con éxito.`, { variant: 'success' });
            loadReservas(); // Recarga los datos para actualizar la lista
            
        } catch (error: any) {
            console.error("Error al cancelar la reserva:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error desconocido al cancelar la reserva.";
            enqueueSnackbar(`❌ Error al cancelar la reserva: ${errorMessage}`, { variant: 'error' });
        }
    };
        
    const manejarReservaGuardada = () => {
        setMostrarFormulario(false);
        setReservaParaModificar(null); 
        loadReservas(); 
    };

    const manejarCancelar = () => {
        setMostrarFormulario(false);
        setReservaParaModificar(null);
    }
    
    
    // 3. Renderiza el componente de UI, pasando todas las props
    return (
        <CalendarioReservasUI
            idCompany={idCompany}
            
            // Datos
            prestadores={prestadores}
            cargandoPrestadores={cargandoPrestadores}
            
            // Lógica
            {...logic}
            
            // Handlers
            manejarNuevaReserva={manejarNuevaReserva}
            manejarReservaGuardada={manejarReservaGuardada}
            manejarCancelar={manejarCancelar}
            manejarModificacion={manejarModificacion} 
            manejarCancelacion={manejarCancelacion}
            
            // Estados UI
            mostrarFormulario={mostrarFormulario}
            setMostrarFormulario={setMostrarFormulario}
            reservaParaModificar={reservaParaModificar} 
            
            // 🔑 PROPIEDADES FALTANTES (Solución al error TS2739)
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
        />
    );
}