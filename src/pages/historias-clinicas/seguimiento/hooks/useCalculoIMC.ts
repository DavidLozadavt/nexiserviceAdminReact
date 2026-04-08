// hooks/useCalculoIMC.ts
import { useMemo } from 'react';
import { IMCData, SignoVital } from '../types';

export const useCalculoIMC = (
  datosPeso: SignoVital[],
  datosAltura: SignoVital[]
): IMCData | null => {
  
  return useMemo(() => {
    if (datosPeso.length === 0 || datosAltura.length === 0) {
      return null;
    }

    const pesoActual = datosPeso[datosPeso.length - 1].valor;
    const alturaActual = datosAltura[datosAltura.length - 1].valor; 

    const alturaMetros = alturaActual / 100;

    const imc = pesoActual / (alturaMetros * alturaMetros);

    let categoria: IMCData['categoria'];
    let color: string;
    let alerta: boolean;

    if (imc < 18.5) {
      categoria = 'Bajo peso';
      color = 'text-info';
      alerta = true;
    } else if (imc >= 18.5 && imc < 25) {
      categoria = 'Normal';
      color = 'text-success';
      alerta = false;
    } else if (imc >= 25 && imc < 30) {
      categoria = 'Sobrepeso';
      color = 'text-warning';
      alerta = true;
    } else if (imc >= 30 && imc < 40) {
      categoria = 'Obesidad';
      color = 'text-danger';
      alerta = true;
    } else {
      categoria = 'Obesidad mórbida';
      color = 'text-danger';
      alerta = true;
    }

    return {
      valor: Math.round(imc * 10) / 10,
      categoria,
      color,
      alerta
    };
  }, [datosPeso, datosAltura]);
};