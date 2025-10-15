export interface Log {
  id: number;
  usuario: string;
  accion: 'Acceso' | 'Modificación' | 'Consulta' | 'Eliminación';
  detalle: string;
  fechaHora: string;
  tipo: 'info' | 'warning' | 'success' | 'danger';
}