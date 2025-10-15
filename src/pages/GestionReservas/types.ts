export interface ClienteNuevo {
  nombre1: string;
  apellido1: string;
  documento: string; 
  identificacion: string; 
  telefono: string; 
  email: string;
  direccion: string;
  telefonoFijo: string;
  celular: string;
  idTercero: number;
  password?: string; 
}

export interface TerceroApi {
    id: number;
    nombre: string;
    identificacion: string; // <-- AÑADIR/VERIFICAR
    email: string;          // <-- AÑADIR/VERIFICAR
    telefono?: string;      // <-- AÑADIR/VERIFICAR
    celular?: string;       // <-- AÑADIR/VERIFICAR
    // ... otros campos del tercero (nombre1, apellido1, etc.)
}

export interface Cliente{
    id: number;
    nombre?: string;         
    nombre1?: string;        
    apellido1?: string;      
    email?: string;             
    documento: string;       
    telefono: string;
    nombreCompleto: string;  
}
// Estructura de un Servicio
export type Servicio = {
id: number;
nombre: string;

};

export interface Persona {
    id: number;
    nombre1: string;
    apellido1: string;
    nombreCompleto: string; 
}

// Estructura del Prestador (ResponsableServicio)
export type Prestador = {
    id: number; 
    nombreCompleto: string; 
    
    persona: Persona; 
    
    servicios: Servicio[]; 
};

export type Reserva = {
fecha: string; 
hora: string;
cliente: string;
servicio: string;
prestador: string;
motivo: string;
// Campos adicionales que DEBEN venir del backend en la respuesta de la agenda
idCliente?: number; 
documentoCliente?: string; // <<-- Agrega esto
emailCliente?: string;     // <<-- Agrega esto
telefonoCliente?: string;  // <<-- Agrega esto
idAgenda?: number;         // <<-- Agrega esto si tu ID viene aplanado
};

// Props para el formulario de reserva
export type ReservaFormProps = {
    fechaSeleccionada: Date;
    prestadores: Prestador[]; 
    onGuardar: () => void; 
    onCancelar: () => void;
    currentCompanyId: number; 
    reservaAEditar: Reserva | null; 

};

// Props para el calendario de reservas
export type CalendarioReservasProps = {
reservas?: Reserva[];
idCompany: number; 
onCrearReserva?: (reserva: Reserva) => void;
};


export interface AgendaResponse {
    id: number;
    horaInicial: string | null;
    fechaInicial: string;
    nota: string | null;
    estado: string;
    tipo: string;
    asignaciones_responsables: {
        id: number;
        idCliente: number; // Agregando idCliente que viene en el JSON

        idAgenda: number;
        idResponsable: number;
        responsable: {
            id: number;
            nombre1: string;
            apellido1: string;
        };
        servicio: {
            id: number;
            nombre: string;
        };
                cliente: TerceroApi; 

    }[];
}

export interface ReservaGestorProps {
    reserva: Reserva;
    onModificar: (reserva: Reserva) => void; 
    onCancelar: (reserva: Reserva) => void;
}