import { useState, useCallback } from 'react';

export const useHistorialExpandido = () => {
  const [historialExpandido, setHistorialExpandido] = useState<{ [key: string]: boolean }>({});

  const toggleHistorial = useCallback((historiaId: string) => {
    setHistorialExpandido(prev => ({
      ...prev,
      [historiaId]: !prev[historiaId]
    }));
  }, []);

  return {
    historialExpandido,
    toggleHistorial,
  };
};