// hooks/useSignosVitales.ts
import { useMemo } from 'react';
import { 
  SignosVitalesData, 
  SignoVital, 
  EstadisticaSignoVital,
  HistoriaClinicaSignos 
} from '../types';

export const useSignosVitales = (historias: HistoriaClinicaSignos[]) => {
  
  // Procesar y extraer signos vitales de todas las historias
  const signosVitalesData = useMemo((): SignosVitalesData => {
    const peso: SignoVital[] = [];
    const altura: SignoVital[] = [];
    const presionArterial: SignoVital[] = [];
    const frecuenciaCardiaca: SignoVital[] = [];

    // Ordenar historias por fecha (más antigua a más reciente)
    const historiasOrdenadas = [...historias].sort(
      (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
    );

    historiasOrdenadas.forEach((historia) => {
      const datos = historia.datosFisicos;
      const fecha = historia.fechaCreacion;

      if (datos?.peso) {
        const pesoNum = parseFloat(datos.peso);
        if (!isNaN(pesoNum)) {
          peso.push({ fecha, valor: pesoNum, unidad: 'kg' });
        }
      }

      if (datos?.altura) {
        const alturaNum = parseFloat(datos.altura);
        if (!isNaN(alturaNum)) {
          altura.push({ fecha, valor: alturaNum, unidad: 'cm' });
        }
      }

      if (datos?.presionArterial) {
        const presionNum = parseFloat(datos.presionArterial);
        if (!isNaN(presionNum)) {
          presionArterial.push({ fecha, valor: presionNum, unidad: 'mmHg' });
        }
      }

      if (datos?.frecuenciaCardiaca) {
        const fcNum = parseFloat(datos.frecuenciaCardiaca);
        if (!isNaN(fcNum)) {
          frecuenciaCardiaca.push({ fecha, valor: fcNum, unidad: 'bpm' });
        }
      }
    });

    return { peso, altura, presionArterial, frecuenciaCardiaca };
  }, [historias]);

  // Calcular estadísticas para un signo vital específico
  const calcularEstadisticas = (
    datos: SignoVital[],
    rangoNormalMin?: number,
    rangoNormalMax?: number
  ): EstadisticaSignoVital | null => {
    if (datos.length === 0) return null;

    const actual = datos[datos.length - 1].valor;
    const anterior = datos.length > 1 ? datos[datos.length - 2].valor : actual;
    const cambio = actual - anterior;
    const porcentajeCambio = anterior !== 0 ? (cambio / anterior) * 100 : 0;

    let tendencia: 'subiendo' | 'bajando' | 'estable' = 'estable';
    if (cambio > 0.5) tendencia = 'subiendo';
    else if (cambio < -0.5) tendencia = 'bajando';

    let alerta = false;
    let mensaje = '';

    if (rangoNormalMin !== undefined && rangoNormalMax !== undefined) {
      if (actual < rangoNormalMin) {
        alerta = true;
        mensaje = 'Valor por debajo del rango normal';
      } else if (actual > rangoNormalMax) {
        alerta = true;
        mensaje = 'Valor por encima del rango normal';
      }
    }

    return {
      actual,
      anterior,
      cambio,
      porcentajeCambio,
      tendencia,
      alerta,
      mensaje
    };
  };

  // Estadísticas individuales
  const estadisticasPeso = calcularEstadisticas(signosVitalesData.peso);
  const estadisticasAltura = calcularEstadisticas(signosVitalesData.altura);
  const estadisticasPresion = calcularEstadisticas(
    signosVitalesData.presionArterial,
    60,  // min normal
    90   // max normal (presión diastólica)
  );
  const estadisticasFC = calcularEstadisticas(
    signosVitalesData.frecuenciaCardiaca,
    60,  // min normal
    100  // max normal
  );

  // Verificar si hay datos disponibles
  const tieneDatos = 
    signosVitalesData.peso.length > 0 ||
    signosVitalesData.altura.length > 0 ||
    signosVitalesData.presionArterial.length > 0 ||
    signosVitalesData.frecuenciaCardiaca.length > 0;

  return {
    signosVitalesData,
    estadisticasPeso,
    estadisticasAltura,
    estadisticasPresion,
    estadisticasFC,
    tieneDatos
  };
};