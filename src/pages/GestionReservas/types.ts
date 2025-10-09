







// Estructura de un Servicio
export type Servicio = {
id: number;
nombre: string;
// Otros campos que vengan de la tabla 'servicios' (ej: duracion)
// También se cargan los campos de la tabla pivote, aunque no los usemos directamente aquí.
};

export interface Persona {
    id: number;
    nombre1: string;
    apellido1: string;
    // Agregamos nombreCompleto DENTRO de persona si se usa así en la Línea 70
    nombreCompleto: string; 
}

// Estructura del Prestador (ResponsableServicio)
export type Prestador = {
    id: number; // id del ResponsableServicio
    // 🛑 Aquí debes poner nombreCompleto en la RAÍZ (para el selector)
    nombreCompleto: string; 
    
    // Y también en la propiedad persona (para la Línea 70)
    persona: Persona; // Usamos el tipo Persona que ya contiene nombreCompleto
    
    // La relación cargada desde el backend
    servicios: Servicio[]; 
};

export type Reserva = {
fecha: string; // formato ISO (YYYY-MM-DD)
hora: string;
cliente: string;
servicio: string;
prestador: string;
motivo: string;
};

// Props para el formulario de reserva
export type ReservaFormProps = {
fechaSeleccionada: Date;
// 🛑 Se pasa la lista de prestadores del componente padre
prestadores: Prestador[]; 
onGuardar: (data: {
hora: string;
cliente: string;
servicio: string;
prestador: string;
motivo: string;
}) => void;
onCancelar: () => void;
};

// Props para el calendario de reservas
export type CalendarioReservasProps = {
reservas?: Reserva[];
idCompany: number; 
onCrearReserva?: (reserva: Reserva) => void;
};
