
export type Reserva = {
  fecha: string; // formato ISO (YYYY-MM-DD)
  hora: string;
  cliente: string;
};

// Props para el formulario de reserva
export type ReservaFormProps = {
  fechaSeleccionada: Date;
  onGuardar: (hora: string, cliente: string) => void;
  onCancelar: () => void;
};

// Props para el calendario de reservas
export type CalendarioReservasProps = {
  reservas?: Reserva[];
  onCrearReserva?: (reserva: Reserva) => void;
};
