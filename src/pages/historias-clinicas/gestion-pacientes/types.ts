export interface Paciente {
  id: string; 
  identificacion: string;
  nombre1: string;
  apellido1: string;
  nombre?: string;  
  direccion: string;
  email: string;
  telefono: string;
  tipoIdentificacion: string;
  idCiudad: string;
  sexo: string;
  fechaNac: string;
  eps?: string;
}

export interface Departamento {
  id: number;
  codigo: string;
  descripcion: string;
}

export interface Ciudad {
  id: number;
  codigo: string;
  descripcion: string;
  iddepartamento: number;
  created_at?: string;
  updated_at?: string;
}
