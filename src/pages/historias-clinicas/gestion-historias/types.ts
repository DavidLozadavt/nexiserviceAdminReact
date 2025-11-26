export type TipoHistoria = 'medica' | 'fisioterapia' | 'odontologica';

export interface HistorialCambio {
  fecha: string;          
  usuario: string;         
  motivo: string;          
}

export interface AdjuntoHistoria {
  id: string;
  nombre: string;
  url: string;
  tipo: string;            
}

export interface AntecedenteItem {
  subcategoria: string;
  tiene: boolean;
  descripcion?: string;
}

export type Antecedentes = AntecedenteItem[];
export interface ExamenFisico {
  peso: string;
  altura: string;
  presionArterial: string;
  frecuenciaCardiaca: string;
}

export interface HistoriaClinica {
  id: string;
  persona_id: string;
  tipo: TipoHistoria;
  fechaCreacion: string;
  motivoConsulta: string;
  diagnostico: string[];
  tratamiento: string[];
  observaciones?: string;
  antecedentes: Antecedentes; // Ahora es un array de objetos
  enfermedad_actual?: string; // snake_case para compatibilidad con backend
  examenFisico: ExamenFisico;
  historialCambios: HistorialCambio[];
  adjuntos: AdjuntoHistoria[];
  evoluciones?: EvolucionClinica[];
}
export interface EvolucionClinica{
  id: string;
  fecha: string;
  descripcion: string;
  firmaDigital?: string;
  responsable: string;
  proximaCita?: string
}