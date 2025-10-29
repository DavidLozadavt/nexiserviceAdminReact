import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Persona {
  nombre1?: string;
  apellido1?: string;
}

interface Usuario {
  persona?: Persona;
}

interface Caja {
  id: number;
  usuario?: Usuario;
  observacion?: string;
  valorGasto?: number;
  valorEfectivo?: number;
  valorTransaccion?: number;
  excedente?: number;
}

interface Props {
  idPuntoDeVenta: number;
  onClose: () => void;
  onAbrirCaja?: (data: { observacion: string; excedente: number }) => void;
}

const AbrirCajaModal: React.FC<Props> = ({ idPuntoDeVenta, onClose, onAbrirCaja }) => {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAbrir, setLoadingAbrir] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [excedente, setExcedente] = useState<number>(0);

  useEffect(() => {
    const fetchCaja = async () => {
      try {
        const res = await axios.get<Caja>(`caja-latest/${idPuntoDeVenta}`);
        setCaja(res.data);
      } catch (error) {
        console.error('Error al cargar la caja:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCaja();
  }, [idPuntoDeVenta]);

  const handleAbrir = async () => {
    if (!observacion.trim()) return;
    setLoadingAbrir(true);
    try {
      await axios.post(`abrir-caja/${idPuntoDeVenta}`, { observacion, excedente });
      if (onAbrirCaja) onAbrirCaja({ observacion, excedente });
      onClose();
    } catch (error) {
      console.error('Error al abrir la caja:', error);
      if (onAbrirCaja) onAbrirCaja({ observacion, excedente });
      onClose();
    } finally {
      setLoadingAbrir(false);
    }
  };

  if (loading || !caja) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <span className="text-neutral-950 dark:text-neutral-50 text-lg font-semibold">
          Cargando información...
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
          <div>
            <h2 className="text-2xl font-bold text-neutral-950 dark:text-neutral-50">Abrir Caja</h2>
            <small className="text-neutral-700 dark:text-neutral-50/80">
              Última apertura o cierre
            </small>
          </div>
          <button
            onClick={onClose}
            className="text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 dark:border-neutral-700 rounded-lg text-left">
              <tbody>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="font-semibold py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    Último Cajero:
                  </td>
                  <td className="py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    {caja.usuario?.persona?.nombre1} {caja.usuario?.persona?.apellido1}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="font-semibold py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    Observación último cierre:
                  </td>
                  <td className="py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    {caja.observacion || '-'}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="font-semibold py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    Valor Gasto:
                  </td>
                  <td className="py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    {caja.valorGasto || 0}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="font-semibold py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    Valor en efectivo:
                  </td>
                  <td className="py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    {caja.valorEfectivo || 0}
                  </td>
                </tr>
                <tr className="border-b border-gray-100 dark:border-neutral-700">
                  <td className="font-semibold py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    Valor Transacción:
                  </td>
                  <td className="py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    {caja.valorTransaccion || 0}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    Excedente anterior:
                  </td>
                  <td className="py-2 px-3 text-neutral-950 dark:text-neutral-50">
                    {caja.excedente || 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1 text-neutral-950 dark:text-neutral-50">
                Nuevo Excedente
              </label>
              <input
                type="number"
                value={excedente}
                onChange={(e) => setExcedente(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-950 dark:text-neutral-50"
                placeholder="Ingrese el excedente"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-neutral-950 dark:text-neutral-50">
                Observación
              </label>
              <textarea
                rows={4}
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-neutral-950 dark:text-neutral-50"
                placeholder="Escribe una observación antes de abrir la caja..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
          <button
            onClick={handleAbrir}
            disabled={loadingAbrir}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {loadingAbrir ? 'Abriendo...' : 'Abrir Caja'}
          </button>
          <button
            onClick={onClose}
            disabled={loadingAbrir}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbrirCajaModal;
