import { useState, useCallback } from 'react';

export const useFormEvolucion = () => {
  const [mostrandoFormEvolucion, setMostrandoFormEvolucion] = useState<string | null>(null);

  const abrirFormEvolucion = useCallback((historiaId: string) => {
    setMostrandoFormEvolucion(historiaId);
  }, []);

  const cerrarFormEvolucion = useCallback(() => {
    setMostrandoFormEvolucion(null);
  }, []);

  const estaAbierto = useCallback((historiaId: string) => {
    return mostrandoFormEvolucion === historiaId;
  }, [mostrandoFormEvolucion]);

  return {
    mostrandoFormEvolucion,
    abrirFormEvolucion,
    cerrarFormEvolucion,
    estaAbierto,
  };
};