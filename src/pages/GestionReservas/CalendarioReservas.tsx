import React, { useState } from "react";
import { CalendarioReservasProps } from "./types"; 
import { useReservaData } from "./useReservaData";
import { useCalendarLogic } from "./useCalendarLogic";
import { CalendarioReservasUI } from "./CalendarioReservasUI";

export default function CalendarioReservas({ idCompany }: CalendarioReservasProps) {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    
    // 1. Hook de Datos (Carga reservas y prestadores)
    const { reservas, prestadores, cargandoPrestadores, loadReservas } = useReservaData(idCompany);

    // 2. Hook de Lógica de Calendario (Maneja la navegación y cálculos)
    const logic = useCalendarLogic(reservas);

    // --- Handlers de Formulario (Usan la lógica de ambos hooks) ---

    const manejarNuevaReserva = () => {
        if (logic.esDiaInactivo(logic.fechaSeleccionada)) {
            alert("No puedes crear una reserva en una fecha pasada o un domingo.");
            return;
        }
        if (cargandoPrestadores || prestadores.length === 0) {
            alert("Esperando datos de prestadores, por favor intenta de nuevo.");
            return;
        }
        setMostrarFormulario(true);
    };

    const manejarReservaGuardada = () => {
        setMostrarFormulario(false);
        loadReservas(); // Recarga los datos después de guardar
    };

    const manejarCancelar = () => setMostrarFormulario(false);
    
    
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
            
            // Estados UI
            mostrarFormulario={mostrarFormulario}
            setMostrarFormulario={setMostrarFormulario}
        />
    );
}