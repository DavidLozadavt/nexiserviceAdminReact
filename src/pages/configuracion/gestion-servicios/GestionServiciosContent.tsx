import { useEffect, useMemo, useState, useRef } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ModalServicio } from './ModalServicio';
import { Servicio } from './types';

interface ContentProps {
  reload: boolean;
}

const ServiciosContent = ({ reload }: ContentProps) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [servicio, setServicio] = useState<Servicio | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchServicios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/servicios');
      setServicios(response.data);
    } catch {
      setError('Error al cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  const deleteServicio = async (id: number) => {
    confirmAction('¿Seguro que quieres eliminar este servicio?', async () => {
      try {
        await axios.delete(`/servicios/${id}`);
        fetchServicios();
      } catch {
        setError('Error al eliminar el servicio.');
      }
    });
  };

  const [itemsPerPage, setItemsPerPage] = useState(8); // por defecto 8

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(4); // en pantallas pequeñas: 2x2
      } else {
        setItemsPerPage(8); // en pantallas grandes: 2x4
      }
    };

    handleResize(); // ejecutar al cargar
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchServicios();
  }, [reload]);

  const filteredData = useMemo(() => {
    let data = servicios;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((s) => s.nombre.toLowerCase().includes(term));
    }
    return data;
  }, [searchTerm, servicios]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isCentered = !loading && filteredData.length <= 2;

  if (loading)
    return (
      <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
        Cargando servicios...
      </div>
    );

  return (
    <div className="relative w-full py-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-6 gap-4">
        <h2 className="text-4xl font-extrabold text-left text-neutral-950 dark:text-slate-50">
          Servicios
        </h2>
        <div className="relative flex gap-4 items-center w-full sm:w-auto">
          <KeenIcon
            icon="magnifier"
            className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
          />
          <input
            type="text"
            placeholder="Buscar Servicios"
            className="pl-8 input input-sm w-full sm:w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="text-red-600 mb-4 px-6">{error}</div>}

      {/* Carrusel de servicios */}
      {filteredData.length > 0 && (
        <>
          <div className="relative max-w-7xl mx-auto">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 transition disabled:opacity-40"
            >
              ❮
            </button>

            <div className="relative max-w-7xl mx-auto">

              <div
                ref={scrollRef}
                className="scroll-hide flex gap-6 overflow-x-auto scroll-smooth px-6 pb-6 snap-x snap-mandatory touch-pan-x min-h-[600px] flex-wrap"
                style={{ marginLeft: '3rem' }} // Empujar todo a la derecha
              >

                {/* tarjetas */}
                {paginatedItems.map((srv) => (
                  <div
                    key={srv.id}
                    className="cursor-pointer w-[90%] sm:w-[45%] md:w-[45%] lg:w-[22%] bg-neutral-300/5 dark:bg-neutral-950 rounded-3xl overflow-hidden shadow-xl hover:shadow-orange-500/50 transform active:scale-95 transition-all duration-300 flex-shrink-0 snap-start mb-6"
                  >
                    <div className="w-full h-48 overflow-hidden rounded-t-3xl">
                      <img
                        src={srv.rutaServicioUrl || '/media/images/servicio.png'}
                        alt={srv.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-6 flex flex-col gap-2 text-center">
                      <h3 className="text-xl font-bold text-orange-500 dark:text-orange-400">
                        {srv.nombre}
                      </h3>
                      {srv.descripcion && (
                        <p className="text-neutral-950 dark:text-neutral-50 text-sm">
                          {srv.descripcion}
                        </p>
                      )}
                      {srv.valor && (
                        <p className="text-green-500 font-semibold">
                          {srv.valor.toLocaleString('es-CO')} COP
                        </p>
                      )}

                      <div className="mt-4 flex justify-between gap-2 sm:gap-4 flex-wrap">
                        <button
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-2xl transition"
                          title="Gestionar"
                        >
                          <KeenIcon icon="setting" />
                        </button>
                        <button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-2xl transition"
                          title="Actualizar"
                          onClick={() => {
                            setIsModalOpen(true);
                            setServicio(srv);
                          }}
                        >
                          <KeenIcon icon="notepad-edit" />
                        </button>
                        <button
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-2xl transition"
                          title="Eliminar"
                          onClick={() => deleteServicio(srv.id)}
                        >
                          <KeenIcon icon="trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 transition disabled:opacity-40"
            >
              ❯
            </button>
          </div>

          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              «
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              »
            </button>
          </div>
        </>
      )}

      {filteredData.length === 0 && (
        <div className="p-8 text-center text-yellow-400 font-medium">No hay servicios registrados.</div>
      )}

      <ModalServicio
        open={isModalOpen}
        data={servicio}
        onClose={() => {
          setIsModalOpen(false);
          setServicio(undefined);
        }}
        onSave={fetchServicios}
      />

      <style>
        {`
          .scroll-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scroll-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export { ServiciosContent };
