import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider';

interface Props {
  idPuntoDeVenta: number;
  onClose: () => void;
  onAbrirCaja?: (data: { observacion: string; excedente: number }) => void;
}

const AbrirCajaModal: React.FC<Props> = ({ idPuntoDeVenta, onClose, onAbrirCaja }) => {
  const { styles } = useEmpresaThemeContext();
  const [caja, setCaja] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAbrir, setLoadingAbrir] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [excedente, setExcedente] = useState<number>(0);

  // 🔹 Cargar datos de la última caja
  useEffect(() => {
    const fetchCaja = async () => {
      try {
        const res = await axios.get(`caja-latest/${idPuntoDeVenta}`);
        setCaja(res.data);
      } catch (error) {
        console.error('Error al cargar la caja:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCaja();
  }, [idPuntoDeVenta]);

  // 🔹 Función para abrir la caja
  const handleAbrir = async () => {
    if (!observacion.trim()) {
      alert('Por favor ingresa una observación antes de abrir la caja.');
      return;
    }

    try {
      setLoadingAbrir(true);
      await axios.post(`abrir-caja/${idPuntoDeVenta}`, {
        observacion,
        excedente
      });

      if (onAbrirCaja) {
        onAbrirCaja({ observacion, excedente });
      }
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      alert('Hubo un error al abrir la caja. Intenta nuevamente.');
    } finally {
      setLoadingAbrir(false);
    }
  };

  if (loading || !caja) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <p className="text-white text-lg">Cargando información...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 dark:bg-black/70 z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col gap-1 p-6 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className={`text-2xl font-bold ${styles.text}`}>Abrir Caja</h2>
          <span className="text-neutral-600 dark:text-neutral-400 text-sm">
            Información de la última apertura/cierre
          </span>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-orange-500/60 scrollbar-track-transparent">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <tbody>
              <tr className={`${styles.card} rounded-xl`}>
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200 w-1/2">
                  Último Cajero:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.usuario?.persona?.nombre1} {caja.usuario?.persona?.apellido1}
                </td>
              </tr>
              <tr className={`${styles.card} rounded-xl`}>
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Observación último cierre:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.observacion || '-'}
                </td>
              </tr>
              <tr className={`${styles.card} rounded-xl`}>
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Valor Gasto:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.valorGasto || '0'}
                </td>
              </tr>
              <tr className={`${styles.card} rounded-xl`}>
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Valor en efectivo:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.valorEfectivo || '0'}
                </td>
              </tr>
              <tr className={`${styles.card} rounded-xl`}>
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Valor Transacción:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.valorTransaccion || '0'}
                </td>
              </tr>
              <tr className={`${styles.card} rounded-xl`}>
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Excedente anterior:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.exedente || '0'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Inputs nuevos */}
          <div className="mt-4 space-y-4">
            <div>
              <label className={`block font-semibold mb-1 ${styles.text}`}>Nuevo Excedente</label>
              <input
                type="number"
                value={excedente}
                onChange={(e) => setExcedente(parseFloat(e.target.value) || 0)}
                placeholder="Ingrese el excedente"
                className={`${styles.input} w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-orange-500 outline-none transition`}
              />
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${styles.text}`}>Observación</label>
              <textarea
                rows={4}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escribe una observación antes de abrir la caja..."
                className={`${styles.textarea} w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-orange-500 outline-none transition resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-neutral-200 dark:border-neutral-700 sticky bottom-0 bg-white dark:bg-neutral-900">
          <button
            onClick={handleAbrir}
            disabled={loadingAbrir}
            className={`${styles.button} py-3 px-8 text-base rounded-2xl font-semibold shadow-md transition active:scale-95`}
          >
            {loadingAbrir ? 'Abriendo...' : 'Abrir Caja'}
          </button>

          <button
            onClick={onClose}
            disabled={loadingAbrir}
            className={`${styles.buttonSelect} py-3 px-8 text-base rounded-2xl font-semibold shadow-md transition active:scale-95`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbrirCajaModal;
