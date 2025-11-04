// src/pages/ReservaEscenario/typesEscenario.ts

export interface Imagen {
    // Define los campos de la imagen si los tiene
    id: number;
    url: string;
    // ... otros campos
}

export interface Video {
    // Define los campos del video si los tiene
    id: number;
    url: string;
    // ... otros campos
}
export interface ServicioAsociado {
    id: number;
    nombre: string;
    value: string; // O number, si es un campo numérico
    // ... otros campos del servicio que necesites, como 'duracion' o 'tiempo'
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
    
    created_at: string; // ISO 8601 string (fecha y hora)
    updated_at: string; // ISO 8601 string (fecha y hora)
    
    imagenes: Imagen[];
    videos: Video[];
    servicio_asignado?: ServicioAsociado; // O el nombre real de tu campo si es diferente
}

export interface ReservaEscenario {
    id: number;
    idEscenario: number;
    fechaInicio: string; 
    fechaFin: string;
    estado: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO';
}