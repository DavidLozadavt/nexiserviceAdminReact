export interface ClienteEncontradoType {
    id: number;
    identificacion: string;
    nombre: string;
    email: string;
}

export type EscenarioFormType = Escenario | AgendaEscenario;

export interface ReservaEscenarioFormProps {
    fechaSeleccionada: Date;
    escenarios: Escenario[];
    currentCompanyId: number;
    reservaAEditar: Agenda | null;
    escenarioInicial: EscenarioFormType | null;
    onGuardar: () => void;
    onCancelar: () => void;
}
export interface ReservaFormData {
    idEscenario: number | null;
    fechaInicio: string;
    fechaFin: string;
    detalle: string;
    idCliente: string;
    idServicio: number | null;
    // CAMPOS DE RECURRENCIA 
    recurrenciaTipo: 'NO_REPETIR' | 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';
    fechaFinRepeticion: string;

}
export interface ConfiguracionRepeticion {
    id: number;
    tipo_recurrencia: 'DIARIO' | 'SEMANAL' | 'QUINCENAL' | 'MENSUAL';
    fecha_fin_repeticion: string; 
    id_agenda_maestra: number | null;
    idCompany: number;
    created_at: string;
    updated_at: string;
}
export interface AgendaCliente {
    id: number;
    nombre: string;
    identificacion: string;
    email: string;
    telefono: string;
}

export interface AgendaServicio {
    id: number;
    nombre: string;
    valor: string; 
}

export interface AgendaEscenario {
    id: number;
    nombre: string;
    numero: string;
    capacidad: string;
}

export interface AsignacionResponsable {
    id: number;
    idCliente: number;
    idServicio: number;
    idAgenda: number;
    idResponsable: number | null;
    idEscenario: number;
    escenario: AgendaEscenario;
    servicio: AgendaServicio;
    cliente: AgendaCliente;
    
}

export type EstadoAgenda = 'AGENDADO'  | 'COMPLETADO' | 'CANCELADO'| 'FINALIZADO';

export type EstadoFiltro = EstadoAgenda | 'TODAS';
export interface Agenda {
    id: number;
    horaInicial: string;         // Ej: "07:00:00"
    horaFinal: string | null;
    fechaInicial: string;        
    descripcion: string | null;
    nota: string | null;         
    completado: 0 | 1;
    estado: 'AGENDADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO'| 'FINALIZADO'; 
    tipo: 'ESCENARIO' | 'SERVICIO';
    
    idUser: string;
    idCompany: number;
    created_at: string;
    updated_at: string;
    idConfiguracionRepeat:number; 
    asignaciones_responsables: AsignacionResponsable[]; 
    configuracionRepeticion?: ConfiguracionRepeticion | null;
    fecha_fin_repeticion: string | null;
}
export interface Imagen {
    id: number;
    url: string;
}

export interface Video {
    id: number;
    url: string;
}
export interface ServicioAsociado {
    id: number;
    nombre: string;
   tiempoServicio?: number | null; // Usado para la duración (minutos)
    duracionMin?: number | null;    // Alternativa si el campo se llama diferente en la DB
    precio?: number | null;
}
export interface Escenario {
    id: number;
    numero: string;
    nombre: string;
    descripcion: string;
    tipo: string;
    imagenUrl: string | null; // Puede ser null si no hay imagen
    idCompany: number;
    
    capacidad: string; 
    
    created_at?: string; // ISO 8601 string (fecha y hora)
    updated_at?: string; // ISO 8601 string (fecha y hora)
    
    imagenes: Imagen[];
    videos: Video[];
    servicio_asignado?: ServicioAsociado; 
    detalle?: string; 

}

export interface ReservaEscenario {
    id: number;
    idEscenario: number;
    fechaInicio: string; 
    fechaFin: string;
    estado: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO';
    idServicio: number | null;
}

export interface TerceroApi {
    id: number;
    identificacion: string;
    nombre: string;
    telefono: string;
    email: string;
    nombre1: string;
    apellido1: string;
    idCompany: number;
    celular?: string;
    telefonoFijo?: string;
}