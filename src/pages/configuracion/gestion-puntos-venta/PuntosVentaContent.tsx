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
    <div className="min-w-full card card-grid relative">
      {/* HEADER */}
      <div className="flex justify-end py-5 card-header">
        <div className="relative">
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
          <div className="relative">
            {/* Botones izquierda / derecha */}
            {currentPage > 0 && (
              <button
                onClick={goToPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-3 shadow-lg z-20"
              >
                <KeenIcon icon="left" className="text-gray-700" />
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-3 shadow-lg z-20"
              >
                <KeenIcon icon="right" className="text-gray-700" />
              </button>
            )}

            {/* Contenedor animado */}
            <div
              className={`flex ${totalPages > 1 ? 'transition-transform duration-500 ease-in-out' : ''}`}
              style={
                totalPages > 1
                  ? {
                      transform: `translateX(-${currentPage * 50}%)`,
                      width: `${totalPages * 100}%`
                    }
                  : {
                      width: '100%'
                    }
              }
            >
              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                const pageItems = filteredData.slice(
                  pageIndex * itemsPerPage,
                  (pageIndex + 1) * itemsPerPage
                );
                return (
                  <div
                    key={pageIndex}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 w-full px-8"
                  >
                    {pageItems.map((pv) => (
                      <div
                        key={pv.id}
                        className="rounded-xl overflow-hidden border-2 border-green-500 shadow-md bg-white hover:shadow-lg transition duration-200 flex flex-col"
                      >
                        {/* Título */}
                        <div className="bg-green-600 text-white text-center py-2 font-bold text-lg">
                          {pv.nombre}
                        </div>
                        {/* Imagen */}
                        <div className="flex justify-center bg-gray-50 py-4">
                          <img
                            src={pv.imagenUrl || '/media/images/default.png'}
                            alt="Punto de Venta"
                            className="w-52 h-32 object-contain"
                          />
                        </div>
                        {/* Botones */}
                        <div className="flex justify-between gap-4 py-4 px-4 border-t border-green-200">
                          <button
                            className="w-24 h-10 flex items-center justify-center rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold shadow"
                            onClick={() => {
                              setIsModalOpen(true);
                              setPuntoVenta(pv);
                            }}
                          >
                            Actualizar
                          </button>
                          <button
                            className="w-24 h-10 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white font-semibold shadow"
                            onClick={() => deletePuntoVenta(pv.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full ${
                    i === currentPage ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                ></button>
              ))}
            </div>
          </div>
        )}
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
