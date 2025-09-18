import React, { useState } from 'react';

const menuOptions = [
  { key: 'pacientes', label: 'Gestión de Pacientes' },
  { key: 'historias', label: 'Gestión de Historias Clínicas' },
  { key: 'seguimiento', label: 'Seguimiento y Continuidad' },
  { key: 'auditoria', label: 'Auditoría y Legalidad' }
];

export const HistoriasClinicasPage: React.FC = () => {
  const [selected, setSelected] = useState(menuOptions[0].key);

  return (
    <div>
      <nav>
        {menuOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setSelected(option.key)}
            style={{ fontWeight: selected === option.key ? 'bold' : 'normal' }}
          >
            {option.label}
          </button>
        ))}
      </nav>
      <div>
        {selected === 'pacientes' && <div>Gestión de Pacientes</div>}
        {selected === 'historias' && <div>Gestión de Historias Clínicas</div>}
        {selected === 'seguimiento' && <div>Seguimiento y Continuidad</div>}
        {selected === 'auditoria' && <div>Auditoría y Legalidad</div>}
      </div>
    </div>
  );
};