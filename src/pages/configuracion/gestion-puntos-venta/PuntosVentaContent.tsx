import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { ArrowLeftCircle, ArrowRightCircle, Building2, Monitor } from 'lucide-react';
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

  // Mostrar 6 por página (ya aplicado)
  const itemsPerPage = 6;

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchPuntosVenta = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('punto_de_ventas');
      setPuntosVenta(response.data || []);
    } catch (err) {
      console.error(err);
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
        console.error(err);
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

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return <div className="p-4 text-center text-neutral-500">Cargando puntos de venta...</div>;
  }

  return (
    <div className="relative w-full py-12 select-none">
      {/* Header (estilo Servicios) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-6 gap-4">
        <h2 className="text-4xl font-extrabold text-left text-neutral-950 dark:text-slate-50">
          Puntos de Venta
        </h2>
        <div className="relative flex gap-4 items-center w-full sm:w-auto">
          <KeenIcon
            icon="magnifier"
            className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
          />
          <input
            type="text"
            placeholder="Buscar punto de venta"
            className="pl-8 input input-sm w-full sm:w-auto"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>
      </div>

      {error && <div className="text-red-600 mb-4 px-6">{error}</div>}

      {/* Carrusel / Grid estilo Servicios */}
      {filteredData.length > 0 ? (
        <>
          <div className="relative max-w-7xl mx-auto">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center
                      w-11 h-11 rounded-full bg-white/90 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700
                    text-neutral-700 dark:text-neutral-100 shadow-md transition"
            >
              <ArrowLeftCircle className="w-6 h-6" />
            </button>

            <div className="relative max-w-7xl mx-auto">
              <div
                ref={scrollRef}
                className="scroll-hide flex flex-wrap justify-center gap-6 overflow-x-auto scroll-smooth px-10 pb-6 snap-x snap-mandatory touch-pan-x"
              >
                {paginatedData.map((pv) => (
                  <div
                    key={pv.id}
                    className="cursor-pointer w-[85%] sm:w-[46%] md:w-[32%] lg:w-[30%]
                              bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700
                              rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-transform duration-300
                              flex flex-col justify-between flex-shrink-0 snap-start mb-6 min-h-[360px]"
                  >
                    <div className="w-full h-52 overflow-hidden rounded-t-3xl">
                      <img
                        src={pv.imagenUrl || '/media/images/default.png'}
                        alt={pv.nombre}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    <div className="px-6 py-6 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center gap-6 mb-2">
                          <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            {pv.nombre}
                          </h3>
                        </div>

                        {pv.sede?.nombreSede && (
                          <p className="text-neutral-700 dark:text-neutral-400 text-s1 flex items-center gap-6">
                            <Building2 className="w-5 h-5 text-blue-500" />
                            <span className="font-medium">{pv.sede.nombreSede}</span>
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex gap-4">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 
                                      py-2 rounded-2xl"
                          onClick={() => {
                            setIsModalOpen(true);
                            setPuntoVenta(pv);
                          }}
                        >
                          <KeenIcon icon="notepad-edit" className="text-green-600 hover:text-green-400 text-lg" />
                          {/* Editar */}
                        </button>

                        <button
                          className="flex-1 flex items-center justify-center gap-2 
                                      py-2 rounded-2xl"
                          onClick={() => deletePuntoVenta(pv.id)}
                        >
                          <KeenIcon icon="trash" className="text-red-600 hover:text-red-400 text-lg" />
                          {/* Eliminar */}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center
                      w-11 h-11 rounded-full bg-white/90 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700
                    text-neutral-700 dark:text-neutral-100 shadow-md transition"
            >
              <ArrowRightCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Paginación visual */}
          <div className="flex justify-center mt-4 gap-2">
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
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </>
      ) : (
        <div className="p-10 text-center text-gray-500 dark:text-gray-400">
          {searchTerm
            ? `No hay puntos de venta que coincidan con "${searchTerm}".`
            : 'No hay puntos de venta registrados. Usa el botón “Agregar” para comenzar.'}
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

      <style>{`
        .scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scroll-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PuntosVentaContent;
