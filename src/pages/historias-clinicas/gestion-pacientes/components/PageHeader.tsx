import React from 'react';

export const PageHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <h1 className="text-2.5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Gestión de Pacientes
      </h1>
      <p className="text-md text-gray-600 dark:text-gray-700">
        Busca pacientes existentes o registra nuevos pacientes en el sistema
      </p>
    </div>
  );
};