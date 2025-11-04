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
}

export interface ReservaEscenario {
    id: number;
    idEscenario: number;
    fechaInicio: string; 
    fechaFin: string;
    estado: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO';
}