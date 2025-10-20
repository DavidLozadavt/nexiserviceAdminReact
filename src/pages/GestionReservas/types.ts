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
    identificacion: string; 
    email: string;          
    telefono?: string;      
    celular?: string;       
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
estado:string;
motivo: string;
idCliente?: number; 
documentoCliente?: string; 
emailCliente?: string;     
telefonoCliente?: string;  
idAgenda?: number;         
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
        idCliente: number; 

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