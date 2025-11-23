import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { SignoVital, EstadisticaSignoVital } from '../types';

interface SignoVitalCardProps {
  titulo: string;
  icono: React.ReactNode;
  datos: SignoVital[];
  estadisticas: EstadisticaSignoVital | null;
  color?: string;
  unidad: string;
}

export const SignoVitalCard: React.FC<SignoVitalCardProps> = ({
  titulo,
  icono,
  datos,
  estadisticas,
  color = 'primary',
  unidad
}) => {
  
  if (!estadisticas || datos.length === 0) {
    return (
      <div className="card bg-white shadow-card rounded-xl overflow-hidden">
        <div className="h-24 -mx-2 flex items-center justify-center">
          <span className="text-gray-400">Sin datos registrados</span>
        </div>
      </div>
    );
  }
};