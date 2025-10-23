import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useEmpresaThemeContext } from '../../colores/EmpresaThemeProvider'; // 🔑

interface Props {
  punto: any;
  onBack: () => void;
}

const InfoPuntoVenta: React.FC<Props> = ({ punto, onBack }) => {
  const { styles } = useEmpresaThemeContext(); // 🔥 usamos los estilos dinámicos

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
    if (search.trim()) {
      result = result.filter((caja) => {
        const nombre = `${caja.usuario?.persona?.nombre1 || ''} ${
          caja.usuario?.persona?.apellido1 || ''
        }`.toLowerCase();
        return nombre.includes(search.toLowerCase());
      });
    }
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
    <div className={`${styles.card} w-full py-10 px-6 transition-colors duration-300 min-h-screen`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <h2 className={`${styles.text} text-3xl font-extrabold drop-shadow-sm`}>
          Información de {punto.nombre}
        </h2>
        <button
          onClick={onBack}
          className={`${styles.primary} ${styles.primaryHover} text-white px-4 py-2 rounded-2xl font-semibold shadow-md transition active:scale-95`}
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
          className={styles.input}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className={styles.select}
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
        <div className={`text-center font-medium ${styles.primary}`}>
          No se encontraron resultados.
        </div>
      ) : (
        <div
          className={`overflow-x-auto max-w-7xl mx-auto rounded-3xl ${styles.card} ${styles.shadow}`}
        >
          <table className="w-full border-collapse">
            <thead className={styles.tableHeader}>
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
                const bgRow = i % 2 === 0 ? styles.card : styles.cardHover;

                return (
                  <tr
                    key={caja.id}
                    className={`${bgRow} transition duration-300 ${styles.tableBorder}`}
                  >
                    <td className="p-4 text-sm">
                      {usuario ? `${usuario.nombre1} ${usuario.apellido1}` : 'Sin asignar'}
                    </td>
                    <td
                      className={`p-4 font-semibold ${isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {isOpen ? 'Abierto' : 'Cerrado'}
                    </td>
                    <td className="p-4 text-sm">{new Date(caja.fecha).toLocaleString()}</td>
                    <td className="p-4 text-sm">{new Date(caja.updated_at).toLocaleString()}</td>
                    <td className={`p-4 font-medium text-green-600 dark:text-green-400`}>
                      ${Intl.NumberFormat('es-CO').format(caja.valorEfectivo || 0)}
                    </td>
                    <td className={`p-4 font-medium text-red-600 dark:text-red-400`}>
                      ${Intl.NumberFormat('es-CO').format(caja.valorGasto || 0)}
                    </td>
                    <td className={`p-4 font-medium text-blue-600 dark:text-blue-400`}>
                      ${Intl.NumberFormat('es-CO').format(caja.valorTransaccion || 0)}
                    </td>
                    <td className="p-4 font-semibold text-yellow-600 dark:text-yellow-400">
                      {caja.excedente || '-'}
                    </td>
                    <td className="p-4">
                      {caja.observacion ? (
                        <button
                          onClick={() => setSelectedObs(caja.observacion)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${styles.text} bg-blue-500/20 hover:bg-blue-500/30`}
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
          <div
            className={`${styles.card} rounded-2xl p-6 w-96 shadow-2xl transition-colors duration-300`}
          >
            <h3 className={`text-xl font-bold mb-4 `}>Observación</h3>
            <div className="max-h-60 overflow-y-auto pr-2 mb-6">
              <p className={`text-sm leading-relaxed ${styles.text} whitespace-pre-wrap`}>
                {selectedObs}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedObs(null)}
                className={`${styles.primary} ${styles.primaryHover} text-white px-4 py-2 rounded-xl transition shadow-md`}
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
