import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  idPuntoDeVenta: number;
  onClose: () => void;
  onCajaCerrada?: () => void;
}

const CerrarCajaModal: React.FC<Props> = ({ idPuntoDeVenta, onClose, onCajaCerrada }) => {
  const [valorGasto, setValorGasto] = useState(0);
  const [valorEfectivo, setValorEfectivo] = useState(0);
  const [valorTransaccion, setValorTransaccion] = useState(0);
  const [valorPropina, setValorPropina] = useState(0);
  const [exedente, setExedente] = useState(0);
  const [observacion, setObservacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const valorCaja = valorEfectivo + valorTransaccion - valorGasto;

  const handleCerrarCaja = async () => {
    if (!observacion.trim()) {
      alert('Por favor ingresa una observación antes de cerrar la caja.');
      return;
    }
    try {
      setLoading(true);
      await axios.post(`caja-cerrar/${idPuntoDeVenta}`, {
        valorEfectivo,
        valorGasto,
        valorTransaccion,
        exedente,
        observacion
      });
      setShowConfirm(true);
      if (onCajaCerrada) onCajaCerrada();
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      alert('Error al cerrar la caja. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-semibold mb-4 text-neutral-950 dark:text-neutral-50">
            ✅ Caja cerrada exitosamente
          </h2>
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
          <h2 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
            Cerrar Caja
          </h2>
          <button
            onClick={onClose}
            className="text-white bg-blue-600 hover:bg-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* FORMULARIO */}
        <div className="px-6 py-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/** VALORES */}
            <div>
              <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Valor de Gastos
              </label>
              <input
                type="number"
                value={valorGasto}
                onChange={(e) => setValorGasto(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-950 dark:text-neutral-50"
                placeholder="Ingrese el valor"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Valor en Efectivo
              </label>
              <input
                type="number"
                value={valorEfectivo}
                onChange={(e) => setValorEfectivo(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-950 dark:text-neutral-50"
                placeholder="Ingrese el valor"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Valor en Transferencias
              </label>
              <input
                type="number"
                value={valorTransaccion}
                onChange={(e) => setValorTransaccion(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-950 dark:text-neutral-50"
                placeholder="Ingrese el valor"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Valor Propinas
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-neutral-950 dark:text-neutral-50">
                ${valorPropina.toLocaleString('es-CO')}
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Caja Total
              </label>
              <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-800 dark:text-blue-200 font-bold">
                ${(valorCaja + valorPropina).toLocaleString('es-CO')}
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                Excedente
              </label>
              <input
                type="number"
                value={exedente}
                onChange={(e) => setExedente(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-950 dark:text-neutral-50"
              />
            </div>
          </div>

          {/* OBSERVACIÓN */}
          <div>
            <label className="block font-medium text-neutral-950 dark:text-neutral-50 mb-1">
              Observación
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value.toUpperCase())}
              rows={4}
              placeholder="Observación..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-950 dark:text-neutral-50"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
          <button
            onClick={handleCerrarCaja}
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Cerrando...' : 'Cerrar Caja'}
          </button>
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CerrarCajaModal;
