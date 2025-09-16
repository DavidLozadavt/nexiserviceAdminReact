import React, { useEffect, useState } from 'react';

interface TemporizadorProps {
  estado: string;
  id: number;
  onTimeUpdate?: (time: number) => void; 
}

const Temporizador: React.FC<TemporizadorProps> = ({ estado, id, onTimeUpdate }) => {
  const [colorFondo, setColorFondo] = useState<string>('gray');
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<number>(() => {
    const savedTime = localStorage.getItem(`tiempoTranscurrido_${id}`);
    return savedTime ? parseInt(savedTime, 10) : 0;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    switch (estado) {
      case 'PLANILLA':
        setColorFondo('#EDED5C');
        break;
      case 'EN VIAJE':
        setColorFondo('#1DF51DFF');
        break;
      case 'CANCELADO':
        setColorFondo('red');
        break;
      case 'PENDIENTE':
        setColorFondo('gray');
        break;
      default:
        setColorFondo('white');
        break;
    }

    if (estado === 'PLANILLA' || estado === 'EN VIAJE') {
      interval = setInterval(() => {
        setTiempoTranscurrido((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(`tiempoTranscurrido_${id}`, newTime.toString());
          if (onTimeUpdate) onTimeUpdate(newTime); 
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [estado, id, onTimeUpdate]);

  const formatTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  return (
    <button
      style={{
        backgroundColor: colorFondo,
        padding: '5px 8px',
        borderRadius: '15px',
        border: 'none',
        color: 'white',
        cursor: 'pointer',
        minWidth: '100px',
        fontSize: '14px',
        width: 'auto',
      }}
    >
      {(estado === 'PLANILLA' || estado === 'EN VIAJE' || estado === 'CANCELADO')
        ? formatTiempo(tiempoTranscurrido)
        : estado}
    </button>
  );
};

export default Temporizador;