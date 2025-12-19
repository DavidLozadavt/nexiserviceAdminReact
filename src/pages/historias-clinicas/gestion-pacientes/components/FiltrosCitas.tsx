import React from 'react';

interface FiltrosCitasProps {
  filtroActual: string;
  onFiltroChange: (filtro: 'todas' | 'pendiente' | 'en_curso' | 'completada') => void;
}

export const FiltrosCitas: React.FC<FiltrosCitasProps> = ({
  filtroActual,
  onFiltroChange
}) => {
  const filtros = [
    { value: 'todas', label: 'Todas', color: 'gray', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { value: 'pendiente', label: 'Pendientes', color: 'warning', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'en_curso', label: 'En Curso', color: 'info', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { value: 'completada', label: 'Completadas', color: 'success', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {filtros.map((filtro) => (
        <button
          key={filtro.value}
          onClick={() => onFiltroChange(filtro.value as any)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-2sm font-semibold transition-all duration-200 ${
            filtroActual === filtro.value
              ? filtro.color === 'gray'
                ? 'bg-gray-700 dark:bg-gray-500 text-white shadow-default dark:shadow-none'
                : `bg-${filtro.color} text-white shadow-${filtro.color} dark:shadow-none`
              : filtro.color === 'gray'
                ? 'bg-gray-100 dark:bg-coal-200 text-gray-700 dark:text-gray-100 border-2 border-gray-200 dark:border-coal-100 hover:bg-gray-200 dark:hover:bg-coal-400'
                : `bg-${filtro.color}-light text-${filtro.color} border-2 border-${filtro.color}-clarity hover:border-${filtro.color}`
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={filtro.icon} />
          </svg>
          {filtro.label}
        </button>
      ))}
    </div>
  );
};