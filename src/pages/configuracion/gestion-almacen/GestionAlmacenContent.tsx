import { useEffect, useMemo, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ModalAlmacen } from './ModalAlmacen';

interface ContentProps {
  reload: boolean;
}

const GestionAlmacenContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'almacen-filter';
  const [gestionAlmacen, setGestionAlmacen] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [almacen, setAlmacen] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(storageFilterId) || '');

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchAlmacenes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('almacenes');
      setGestionAlmacen(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.message : 'Error desconocido.';
      setError(`Error al cargar los almacenes: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlmacen = async (id: number) => {
    confirmAction('Esta acción eliminará este Almacén de forma permanente.', async () => {
      try {
        await axios.delete(`almacenes/${id}`);
        fetchAlmacenes();
      } catch (err) {
        const errorMessage = axios.isAxiosError(err) ? err.message : 'Error desconocido.';
        setError(`Error al eliminar el almacén: ${errorMessage}`);
      }
    });
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [reload]);

  const handleAfterSave = () => {
    fetchAlmacenes();
    setIsModalOpen(false);
    setAlmacen(undefined);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return gestionAlmacen;
    const term = searchTerm.toLowerCase();
    return gestionAlmacen.filter(
      (a) =>
        a.nombreAlmacen?.toLowerCase().includes(term) ||
        a.descripcion?.toLowerCase().includes(term) ||
        a.direccion?.toLowerCase().includes(term) ||
        a.nombreSede?.toLowerCase().includes(term)
    );
  }, [searchTerm, gestionAlmacen]);

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
    return <div className="p-4 text-center">Cargando almacenes...</div>;
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
              placeholder="Buscar Almacenes"
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
              ? `No hay almacenes que coincidan con "${searchTerm}".`
              : 'No hay almacenes registrados. Usa el botón "Agregar Almacén" para comenzar.'}
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
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full shrink-0 px-6"
                    style={{ width: '50%' }}
                  >
                    {pageItems.map((alm) => (
                      <div
                        key={alm.id}
                        className="rounded-xl overflow-hidden border border-gray-200 shadow-md bg-white hover:shadow-lg transition duration-200"
                      >
                        <div className="bg-green-600 text-white text-center py-2 font-semibold text-lg">
                          {alm.nombreAlmacen}
                        </div>
                        <div className="flex justify-center bg-gray-50 py-3">
                          <img
                            src={alm.rutaImagenUrl || '/media/images/almacen.png'}
                            alt="Almacén"
                            className="w-52 h-28 object-contain"
                          />
                        </div>
                        <div className="flex justify-between gap-4 py-4 px-4 border-t border-gray-200">
                          <button
                            className="w-12 h-12 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-400"
                            title="Gestionar"
                          >
                            <KeenIcon icon="element-11" className="text-white" />
                          </button>
                          <button
                            className="w-12 h-12 flex items-center justify-center rounded-md bg-green-400 hover:bg-green-400"
                            title="Actualizar"
                            onClick={() => {
                              setIsModalOpen(true);
                              setAlmacen(alm);
                            }}
                          >
                            <KeenIcon icon="notepad-edit" className="text-white" />
                          </button>
                          <button
                            className="w-12 h-12 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-400"
                            title="Eliminar"
                            onClick={() => deleteAlmacen(alm.id)}
                          >
                            <KeenIcon icon="trash" className="text-white" />
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
      <ModalAlmacen
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAlmacen(undefined);
        }}
        data={almacen}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export { GestionAlmacenContent };
