import React from 'react';

interface BotonFlotanteProps {
  onClick: () => void;
}

export const BotonFlotante: React.FC<BotonFlotanteProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-8 right-8 z-50 bg-primary text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:bg-primary-dark transition-colors"
    title="Crear nueva historia clínica"
    aria-label="Crear nueva historia clínica"
  >
    +
  </button>
);
