// types/index.ts

export interface SignoVital {
  fecha: string;
  valor: number;
  unidad: string;
}

export interface SignosVitalesData {
  peso: SignoVital[];
  altura: SignoVital[];
  presionArterial: SignoVital[];
  frecuenciaCardiaca: SignoVital[];
}

export interface DatoSignoVital {
  peso?: string;
  altura?: string;
  presionArterial?: string;
  frecuenciaCardiaca?: string;
}

export interface HistoriaClinicaSignos {
  id: string;
  fechaCreacion: string;
  datosFisicos?: DatoSignoVital;
}

export interface EstadisticaSignoVital {
  actual: number;
  anterior: number;
  cambio: number;
  porcentajeCambio: number;
  tendencia: 'subiendo' | 'bajando' | 'estable';
  alerta: boolean;
  mensaje?: string;
}

export interface RangoNormal {
  min: number;
  max: number;
  categoria: string;
}

export interface IMCData {
  valor: number;
  categoria: 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad' | 'Obesidad mórbida';
  color: string;
  alerta: boolean;
}

export type TipoSignoVital = 'peso' | 'altura' | 'presionArterial' | 'frecuenciaCardiaca' | 'imc';

export interface ConfiguracionSignoVital {
  tipo: TipoSignoVital;
  nombre: string;
  unidad: string;
  icono: React.ReactNode;
  color: string;
  rangoNormal?: RangoNormal;
  formatoValor?: (valor: number) => string;
}