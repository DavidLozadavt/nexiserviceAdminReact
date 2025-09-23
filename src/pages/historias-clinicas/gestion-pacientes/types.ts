export interface Paciente {
  id: string; 
  nombreCompleto: string;
  tipoIdentificacion: string;
  identificacion: string;
  fechaNacimiento: string;
  sexo: string;
  direccion: string;
  ciudad: string;
  pais: string;
  telefono: string;
  correo: string;
  acudiente?: string;
  eps?: string;
}
