import { useEffect, useMemo, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ModalServicio } from './ModalServicio';

interface Servicio {
  id: number;
  nombreServicio: string;
  descripcion?: string;
  precio?: number;
  imagenUrl?: string;
}

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
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10

  const fetchServicios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('servicios');
      setServicios(response.data);
      setCurrentPage(1);
    } catch {
      setError('Error al cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  const deleteServicio = async (id: number) => {
    confirmAction('¿Seguro que quieres eliminar este servicio?', async () => {
      try {
        await axios.delete(`servicios/${id}`);
        fetchServicios();
      } catch {
        setError('Error al eliminar el servicio.');
      }
    });
  };

  useEffect(() => {
    fetchServicios();
  }, [reload]);

  // Filtrado
  const filteredData = useMemo(() => {
    if (!searchTerm) return servicios;
    const term = searchTerm.toLowerCase();
    return servicios.filter((s) =>
      s.nombreServicio.toLowerCase().includes(term)
    );
  }, [searchTerm, servicios]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-4 text-center">Cargando servicios...</div>;

  return (
    <div className="min-w-full card card-grid">
      <div className="flex flex-wrap justify-between py-5 card-header">
        <h3 className="card-title">Servicios</h3>
        {/* Buscar */}
        <div className="relative flex gap-4 items-center">
          <KeenIcon
            icon="magnifier"
            className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
          />
          <input
            type="text"
            placeholder="Buscar Servicios"
            className="pl-8 input input-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {/* Grid de servicios */}
      <div className="card-body grid grid-cols-1 md:grid-cols-3 gap-6">
        {paginatedItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay servicios registrados.
          </div>
        ) : (
          paginatedItems.map((srv) => (
            <div
              key={srv.id}
              className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white hover:shadow-lg transition duration-200"
            >
              <div className="flex justify-center bg-gray-50 py-3">
                <img
                  src={srv.imagenUrl || '/media/images/servicio.png'}
                  alt={srv.nombreServicio}
                  className="w-52 h-32 object-cover rounded-lg"
                />
              </div>

              <div className="p-4 text-center">
                <h3 className="font-bold text-lg uppercase text-gray-800">
                  {srv.nombreServicio}
                </h3>
                <p className="text-gray-600 mt-1 text-sm">{srv.descripcion}</p>
                <p className="mt-2 font-semibold text-gray-900">
                  {srv.precio?.toLocaleString('es-CO')} COP
                </p>
              </div>

              <div className="flex justify-center gap-3 py-3 border-t border-gray-100">
                <button
                  className="w-12 h-12 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-400"
                  title="Gestionar"
                >
                  <KeenIcon icon="setting" className="text-white" />
                </button>

                <button
                  className="w-12 h-12 flex items-center justify-center rounded-md bg-green-400 hover:bg-green-400"
                  title="Actualizar"
                  onClick={() => {
                    setIsModalOpen(true);
                    setServicio(srv);
                  }}
                >
                  <KeenIcon icon="notepad-edit" className="text-white" />
                </button>

                <button
                  className="w-12 h-12 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-400"
                  title="Eliminar"
                  onClick={() => deleteServicio(srv.id)}
                >
                  <KeenIcon icon="trash" className="text-white" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contenedor de selector y paginación */}
      <div className="flex justify-between items-center mt-4">
        {/* Selector de cantidad por página */}
        <div className="flex items-center gap-2">
          <span className="text-gray-700 text-sm">Mostrando:</span>
          <div className="relative">
            <select
              id="itemsPerPage"
              className="input input-sm appearance-none pr-6"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
              <option value={30}>30</option>
              <option value={35}>35</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <span className="text-gray-700 text-sm">por página</span>
        </div>

        {/* Paginación tipo << 1 2 3 >> */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 text-gray-700 text-sm">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              « Previous
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`${currentPage === idx + 1 ? 'font-bold underline' : ''}`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next » 
            </button>
          </div>
        )}
      </div>

      <ModalServicio
        open={isModalOpen}
        data={servicio}
        onClose={() => {
          setIsModalOpen(false);
          setServicio(undefined);
        }}
        onSave={fetchServicios}
      />
    </div>
  );
};

export { ServiciosContent };
