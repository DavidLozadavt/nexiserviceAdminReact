// CalendarioReservas.tsx
import React, { useState } from "react";
// 1. Importar el tipo Reserva
import { CalendarioReservasProps, Reserva } from "./types"; 
import { useReservaData } from "./hooks/useReservaData";
import { useCalendarLogic } from "./hooks/useCalendarLogic";
import { CalendarioReservasUI } from "./components/CalendarioReservasUI";
import axios from 'axios'; 
import { useSnackbar } from 'notistack'; 

export default function CalendarioReservas({ idCompany }: CalendarioReservasProps) {
    const { enqueueSnackbar } = useSnackbar();
    
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    // 2. NUEVO ESTADO: Guarda la reserva si se está editando
    const [reservaParaModificar, setReservaParaModificar] = useState<Reserva | null>(null);
    
    // 1. Hook de Datos (Carga reservas y prestadores)
    const { reservas, prestadores, cargandoPrestadores, loadReservas } = useReservaData(idCompany);

    // 2. Hook de Lógica de Calendario (Maneja la navegación y cálculos)
    const logic = useCalendarLogic(reservas);

    // --- Handlers de Formulario y Gestión ---

    const manejarNuevaReserva = () => {
        if (logic.esDiaInactivo(logic.fechaSeleccionada)) {
            alert("No puedes crear una reserva en una fecha pasada o un domingo.");
            return;
        }
        if (cargandoPrestadores || prestadores.length === 0) {
            alert("Esperando datos de prestadores, por favor intenta de nuevo.");
            return;
        }
        setReservaParaModificar(null); // Asegura que el formulario esté en modo creación
        setMostrarFormulario(true);
    };

    const manejarModificacion = (reserva: Reserva) => {
        setReservaParaModificar(reserva); // Carga la reserva para edición
        setMostrarFormulario(true);       // Abre el formulario
    };

    // 🎯 AJUSTE DE CANCELACIÓN: Implementación real de la API
 // CalendarioReservas.tsx (AJUSTE)
const manejarCancelacion = async (reserva: Reserva) => {
    
    // 1. Obtener el ID de la Agenda/Reserva (ID INTERNO)
    const idAgenda = (reserva as any).id || (reserva as any).idAgenda; 
    
    // El método HTTP y la ruta ahora son fijos y conocidos.
    let apiUrl = `cancel_reserva_by_agenda_id/${idAgenda}`;

    if (!idAgenda) {
        enqueueSnackbar('❌ ID de la Agenda no encontrado. No se puede cancelar.', { variant: 'error' });
        return;
    }

    try {
        // 2. Usar axios.delete para coincidir con la ruta de Laravel
        await axios.delete(apiUrl);
        
        enqueueSnackbar(`✅ Reserva ID ${idAgenda} cancelada con éxito.`, { variant: 'success' });
        loadReservas(); // Recarga los datos para actualizar la lista
        
    } catch (error: any) {
        console.error("Error al cancelar la reserva:", error);
        // Capturar mensajes específicos del backend (por si falla la cancelación interna)
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error desconocido al cancelar la reserva.";
        enqueueSnackbar(`❌ Error al cancelar la reserva: ${errorMessage}`, { variant: 'error' });
    }
};
    
    const manejarReservaGuardada = () => {
        setMostrarFormulario(false);
        setReservaParaModificar(null); // Limpia el estado de edición
        loadReservas(); // Recarga los datos después de guardar/modificar
    };

    const manejarCancelar = () => {
        setMostrarFormulario(false);
        setReservaParaModificar(null); // Limpia el estado de edición al cerrar
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
            // NUEVOS HANDLERS
            manejarModificacion={manejarModificacion} 
            manejarCancelacion={manejarCancelacion}
            
            // Estados UI
            mostrarFormulario={mostrarFormulario}
            setMostrarFormulario={setMostrarFormulario}
            // NUEVO ESTADO DE EDICIÓN
            reservaParaModificar={reservaParaModificar} 
        />
    );
}