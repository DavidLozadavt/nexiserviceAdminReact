import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  idPuntoDeVenta: number;
  onClose: () => void;
  onAbrirCaja?: (data: { observacion: string; excedente: number }) => void;
}

const AbrirCajaModal: React.FC<Props> = ({ idPuntoDeVenta, onClose, onAbrirCaja }) => {
  const [caja, setCaja] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [observacion, setObservacion] = useState('');
  const [excedente, setExcedente] = useState<number>(0);

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

  if (loading || !caja) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <p className="text-white text-lg">Cargando...</p>
      </div>
    );
  }

  const handleAbrir = () => {
    if (onAbrirCaja) {
      onAbrirCaja({ observacion, excedente });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 dark:bg-black/70 z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="flex flex-col gap-1 p-6 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-900 z-10">
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-500">Abrir Caja</h2>
          <span className="text-neutral-600 dark:text-neutral-400 text-sm">
            Información de la última apertura/cierre
          </span>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-orange-500/60 scrollbar-track-transparent">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <tbody>
              <tr className="bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200 w-1/2">
                  Último Cajero:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.usuario?.persona?.nombre1} {caja.usuario?.persona?.apellido1}
                </td>
              </tr>

              <tr className="bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Observación último cierre:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.observacion || '-'}
                </td>
              </tr>

              <tr className="bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Valor Gasto:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.valorGasto || '0'}
                </td>
              </tr>

              <tr className="bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Valor en efectivo:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.valorEfectivo || '0'}
                </td>
              </tr>

              <tr className="bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
                <td className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                  Valor Transacción:
                </td>
                <td className="py-3 px-4 text-neutral-700 dark:text-neutral-100">
                  {caja.valorTransaccion || '0'}
                </td>
              </tr>

              <tr className="bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
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
              <label className="block text-neutral-800 dark:text-neutral-200 font-semibold mb-1">
                Nuevo Excedente
              </label>
              <input
                type="number"
                value={excedente}
                onChange={(e) => setExcedente(parseFloat(e.target.value) || 0)}
                placeholder="Ingrese el excedente"
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-orange-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-neutral-800 dark:text-neutral-200 font-semibold mb-1">
                Observación
              </label>
              <textarea
                rows={4}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Escribe una observación antes de abrir la caja..."
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-orange-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-neutral-200 dark:border-neutral-700 sticky bottom-0 bg-white dark:bg-neutral-900">
          <button
            onClick={handleAbrir}
            className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-6 rounded-2xl font-semibold transition active:scale-95"
          >
            Abrir Caja
          </button>
          <button
            onClick={onClose}
            className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white py-2 px-6 rounded-2xl font-semibold transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbrirCajaModal;
