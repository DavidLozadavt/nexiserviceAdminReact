import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

interface Props {
  punto: any;
  onBack: () => void;
}

const InfoPuntoVenta: React.FC<Props> = ({ punto, onBack }) => {
  const [cajas, setCajas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObs, setSelectedObs] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'reciente' | 'antiguo' | 'abierto' | 'cerrado'>('reciente');

  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const res = await axios.get(`get_boxes_by_point_of_sale/${punto.id}`);
        setCajas(res.data);
      } catch (error) {
        console.error('Error al cargar cajas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCajas();
  }, [punto]);

  const filteredCajas = useMemo(() => {
    let result = [...cajas];

    // 🔍 Filtrar por búsqueda
    if (search.trim()) {
      result = result.filter((caja) => {
        const nombre = `${caja.usuario?.persona?.nombre1 || ''} ${
          caja.usuario?.persona?.apellido1 || ''
        }`.toLowerCase();
        return nombre.includes(search.toLowerCase());
      });
    }

    // ⚙️ Filtros
    switch (filter) {
      case 'reciente':
        result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        break;
      case 'antiguo':
        result.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        break;
      case 'abierto':
        result = result.filter((caja) => caja.estado?.estado?.toLowerCase() === 'abierto');
        break;
      case 'cerrado':
        result = result.filter((caja) => caja.estado?.estado?.toLowerCase() === 'cerrado');
        break;
    }

    return result;
  }, [cajas, search, filter]);

  return (
    <div className="w-full py-10 px-6 bg-white dark:bg-neutral-950 transition-colors duration-300 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50 drop-shadow-sm">
          Información de {punto.nombre}
        </h2>
        <button
          onClick={onBack}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-2xl font-semibold shadow-md hover:shadow-orange-500/30 transition active:scale-95"
        >
          ← Volver
        </button>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="Buscar cajero..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
        >
          <option value="reciente">Más reciente</option>
          <option value="antiguo">Más antiguo</option>
          <option value="abierto">Solo abiertos</option>
          <option value="cerrado">Solo cerrados</option>
        </select>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          Cargando información...
        </p>
      ) : filteredCajas.length === 0 ? (
        <div className="text-center text-orange-500 font-medium">No se encontraron resultados.</div>
      ) : (
        <div className="overflow-x-auto max-w-7xl mx-auto rounded-3xl backdrop-blur-xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-[0_0_25px_-5px_rgba(255,140,0,0.25)]">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 text-white text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 text-left">Cajero</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Fecha Apertura</th>
                <th className="p-4 text-left">Última Actualización</th>
                <th className="p-4 text-left">Efectivo</th>
                <th className="p-4 text-left">Gasto</th>
                <th className="p-4 text-left">Transferencias</th>
                <th className="p-4 text-left">Excedente</th>
                <th className="p-4 text-left">Observación</th>
              </tr>
            </thead>
            <tbody>
              {filteredCajas.map((caja, i) => {
                const isOpen = caja.estado?.estado?.toLowerCase() === 'abierto';
                const usuario = caja.usuario?.persona;
                const bgRow =
                  i % 2 === 0
                    ? 'bg-neutral-100 dark:bg-neutral-900/40'
                    : 'bg-neutral-50 dark:bg-neutral-800/40';

                return (
                  <tr
                    key={caja.id}
                    className={`${bgRow} hover:bg-neutral-200/60 dark:hover:bg-neutral-700/40 transition duration-300 border-b border-neutral-200 dark:border-neutral-800`}
                  >
                    <td className="p-4 text-sm text-neutral-800 dark:text-neutral-200">
                      {usuario ? `${usuario.nombre1} ${usuario.apellido1}` : 'Sin asignar'}
                    </td>
                    <td
                      className={`p-4 font-semibold ${
                        isOpen
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {isOpen ? 'Abierto' : 'Cerrado'}
                    </td>
                    <td className="p-4 text-neutral-700 dark:text-neutral-300 text-sm">
                      {new Date(caja.fecha).toLocaleString()}
                    </td>
                    <td className="p-4 text-neutral-700 dark:text-neutral-300 text-sm">
                      {new Date(caja.updated_at).toLocaleString()}
                    </td>
                    <td className="p-4 text-green-600 dark:text-green-400 font-medium">
                      ${Intl.NumberFormat('es-CO').format(caja.valorEfectivo || 0)}
                    </td>
                    <td className="p-4 text-red-600 dark:text-red-400 font-medium">
                      ${Intl.NumberFormat('es-CO').format(caja.valorGasto || 0)}
                    </td>
                    <td className="p-4 text-blue-600 dark:text-blue-400 font-medium">
                      ${Intl.NumberFormat('es-CO').format(caja.valorTransaccion || 0)}
                    </td>
                    <td className="p-4 text-yellow-600 dark:text-yellow-400 font-semibold">
                      {caja.excedente || '-'}
                    </td>
                    <td className="p-4">
                      {caja.observacion ? (
                        <button
                          onClick={() => setSelectedObs(caja.observacion)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-sm font-semibold transition"
                        >
                          Ver
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Observación */}
      {selectedObs && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-96 shadow-2xl transition-colors duration-300">
            <h3 className="text-xl font-bold text-orange-600 dark:text-orange-500 mb-4">
              Observación
            </h3>
            <div className="max-h-60 overflow-y-auto pr-2 mb-6">
              <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap text-sm leading-relaxed">
                {selectedObs}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedObs(null)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl transition shadow-md hover:shadow-orange-500/30"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPuntoVenta;
