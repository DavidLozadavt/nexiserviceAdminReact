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
  const itemsPerPage = 4;

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
    confirmAction('Esta acción eliminará este punto de venta de forma permanente.', async () => {
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

  const goToNext = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  };

  const goToPrev = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando puntos de venta...</div>;
  }

  return (
    <div className="relative w-full py-12 select-none">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-6 gap-4">
        <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-slate-50">
          Puntos de Venta
        </h2>
        <div className="relative flex gap-4 items-center">
          <KeenIcon
            icon="magnifier"
            className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
          />
          <input
            type="text"
            placeholder="Buscar punto de venta"
            className="pl-8 input input-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
          <button
            className="btn btn-primary bg-green-600 text-white"
            onClick={() => {
              setIsModalOpen(true);
              setPuntoVenta(undefined);
            }}
          >
            Agregar Punto de Venta
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 mx-4 p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
          {error}
        </div>
      )}

      {/* CARRUSEL */}
      <div className="card-body relative overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm
              ? `No hay puntos de venta que coincidan con "${searchTerm}".`
              : 'No hay puntos de venta registrados. Usa el botón "Agregar Punto de Venta" para comenzar.'}
          </div>
        ) : (
          <div className="relative max-w-7xl mx-auto">
            {/* Flecha izquierda */}
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 transition disabled:opacity-40"
            >
              ❮
            </button>

            {/* Grid de tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 w-full px-8">
              {paginatedData.map((pv) => (
                <div
                  key={pv.id}
                  className="cursor-pointer bg-neutral-200/20 dark:bg-neutral-950 rounded-3xl overflow-hidden shadow-xl hover:shadow-orange-500/50 transform hover:scale-[0.98] transition-all duration-300 flex-shrink-0 snap-start mb-6 flex flex-col"
                >
                  <div className="w-full h-48 bg-white overflow-hidden rounded-t-3xl">
                    <img
                      src={pv.imagenUrl || '/media/images/default.png'}
                      alt={pv.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-orange-600">{pv.nombre}</h3>
                    <div className="mt-4 flex justify-between gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setPuntoVenta(pv);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition"
                      >
                        Actualizar
                      </button>
                      <button
                        onClick={() => deletePuntoVenta(pv.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Flecha derecha */}
            <button
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 transition disabled:opacity-40"
            >
              ❯
            </button>
          </div>
        )}
      </div>

      {/* PAGINACION */}
      <div className="flex justify-end mt-4 gap-2 px-8">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          «
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`px-3 py-1 rounded ${currentPage === idx ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages - 1}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          »
        </button>
      </div>

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
