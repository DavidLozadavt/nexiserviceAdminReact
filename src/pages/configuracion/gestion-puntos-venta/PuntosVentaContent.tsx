import { useEffect, useMemo, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import ModalPuntosVenta from './ModalPuntosVenta';

interface ContentProps {
  reload: boolean;
}

const PuntosVentaContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'pointV-filter';
  const [puntosVenta, setPuntosVenta] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [puntoVenta, setPuntoVenta] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(storageFilterId) || '');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchPuntosVenta = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('punto_de_ventas');
      setPuntosVenta(response.data);
    } catch (err) {
      setError('Error al cargar los puntos de venta');
    } finally {
      setLoading(false);
    }
  };

  const deletePuntoVenta = async (id: number) => {
    confirmAction('¿Eliminar este punto de venta permanentemente?', async () => {
      try {
        await axios.delete(`punto_de_ventas/${id}`);
        fetchPuntosVenta();
      } catch (err) {
        setError('Error al eliminar el punto de venta');
      }
    });
  };

  useEffect(() => {
    fetchPuntosVenta();
  }, [reload]);

  const handleAfterSave = () => {
    fetchPuntosVenta();
    setIsModalOpen(false);
    setPuntoVenta(undefined);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return puntosVenta;
    const term = searchTerm.toLowerCase();
    return puntosVenta.filter(
      (pv) =>
        pv.nombre?.toLowerCase().includes(term) ||
        pv.sede?.nombre?.toLowerCase().includes(term) ||
        pv.tipo?.toLowerCase().includes(term)
    );
  }, [searchTerm, puntosVenta]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-lg text-primary animate-pulse">
        Cargando puntos de venta...
      </div>
    );
  }

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap py-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion puntos de venta</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Buscar punto de venta"
              className="input input-sm pl-8 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 mx-6 p-4 text-sm text-red-700 bg-red-100 border border-red-300 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      {/* GRID */}
      {filteredData.length === 0 ? (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400">
          {searchTerm
            ? `No hay puntos de venta que coincidan con "${searchTerm}".`
            : 'No hay puntos de venta registrados. Usa el botón “Agregar” para comenzar.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-6">
          {paginatedData.map((pv, index) => (
            <div
              key={pv.id}
              className="group bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/30 dark:border-gray-800/60 overflow-hidden relative"
            >
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={pv.imagenUrl || '/media/images/default.png'}
                  alt={pv.nombre}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                  {pv.nombre}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  {pv.sede?.nombreSede || 'Sin sede asignada'}
                </p>

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setPuntoVenta(pv);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deletePuntoVenta(pv.id)}
                    className="flex-1 ml-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            «
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentPage === idx
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            »
          </button>
        </div>
      )}

      {/* MODAL */}
      <ModalPuntosVenta
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPuntoVenta(undefined);
        }}
        data={puntoVenta}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export default PuntosVentaContent;
