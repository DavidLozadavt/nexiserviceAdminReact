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
    const manejarCancelacion = async (reserva: Reserva) => {
        // ⚠️ CRÍTICO: Asumimos que el objeto Reserva tiene el 'idShoppingCart'
        const idShoppingCart = (reserva as any).idShoppingCart; 

        try {
            if (!idShoppingCart) {
                enqueueSnackbar('❌ ID del carrito de compras no encontrado. Verifique la API de reservas.', { variant: 'error' });
                return;
            }
            
            // LLAMADA A LA API REAL USANDO EL ENDPOINT Y PAYLOAD CORRECTOS
            await axios.post('/cancelReservaNexiService', { 
                idShoppingCart: idShoppingCart 
            });
            
            enqueueSnackbar(`✅ Reserva de ${reserva.cliente} cancelada con éxito.`, { variant: 'success' });
            loadReservas(); // Recarga los datos
            
        } catch (error: any) {
            console.error("Error al cancelar la reserva:", error);
            const errorMessage = error.response?.data?.message || "Error desconocido al cancelar la reserva.";
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