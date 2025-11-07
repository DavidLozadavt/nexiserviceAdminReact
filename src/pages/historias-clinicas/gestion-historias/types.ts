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
  tiene: boolean;
  descripcion?: string;
}

export interface Antecedentes {
  patologicos: {
    enfermedadesPrevias?: AntecedenteItem;
    hospitalizaciones?: AntecedenteItem;
    cirugias?: AntecedenteItem;
  };
  familiares: {
    enfermedadesHereditarias?: AntecedenteItem;
  };
  alergias: {
    medicamentos?: AntecedenteItem;
    alimentos?: AntecedenteItem;
    sustancias?: AntecedenteItem;
  };
  toxicosFarmacologicos: {
    consumoTabaco?: AntecedenteItem;
    consumoAlcohol?: AntecedenteItem;
    consumoDrogas?: AntecedenteItem;
    medicamentosHabituales?: AntecedenteItem;
  };
  vacunacion?: AntecedenteItem;
}
export interface ExamenFisico {
  peso: string;
  altura: string;
  presionArterial: string;
  frecuenciaCardiaca: string;
}

export interface HistoriaClinica {
  id: string;
  pacienteId: string;
  tipo: TipoHistoria;
  fechaCreacion: string;
  motivoConsulta: string;
  diagnostico: string[];
  tratamiento: string[];
  observaciones?: string;
  antecedentes: Antecedentes;
  enfermedadActual?: string;
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