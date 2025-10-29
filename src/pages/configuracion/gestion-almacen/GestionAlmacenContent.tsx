import { useEffect, useMemo, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ModalAlmacen } from './ModalAlmacen';
import { useEmpresaThemeContext } from '../../../colores/EmpresaThemeProvider';

interface ContentProps {
  reload: boolean;
}

const GestionAlmacenContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'almacen-filter';
  const [gestionAlmacen, setGestionAlmacen] = useState<any[]>([]);
  const { styles } = useEmpresaThemeContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [almacen, setAlmacen] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(storageFilterId) || '');
  const itemsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

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
      setError('Error al cargar los almacenes.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlmacen = async (id: number) => {
    confirmAction('¿Seguro que quieres eliminar este almacén?', async () => {
      try {
        await axios.delete(`almacenes/${id}`);
        fetchAlmacenes();
      } catch {
        setError('Error al eliminar el almacén.');
      }
    });
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [reload]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return gestionAlmacen;
    const term = searchTerm.toLowerCase();
    return gestionAlmacen.filter((a) => a.nombreAlmacen?.toLowerCase().includes(term));
  }, [searchTerm, gestionAlmacen]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-4 text-center text-neutral-500">Cargando almacenes...</div>;

  return (
    <div className={`relative w-full py-12 select-none`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 px-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Almacenes</h1>
        <div className="relative flex gap-4 items-center w-full sm:w-auto">
          <KeenIcon
            icon="magnifier"
            className={`absolute left-0 ml-3 leading-none -translate-y-1/2 text-md top-1/2 ${styles.text}`}
          />
          <input
            type="text"
            placeholder="Buscar Almacén"
            className={`pl-8 input input-sm w-full sm:w-auto ${styles.input}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className={`btn btn-sm ${styles.primary} ${styles.primaryHover} text-white`}
            onClick={() => {
              setIsModalOpen(true);
              setAlmacen(undefined);
            }}
          >
            Nuevo Almacén
          </button>
        </div>
      </div>

      {/* Tarjetas */}
      <div className={`relative max-w-7xl mx-auto p-0`}>
        {/* Flecha izquierda */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 transition disabled:opacity-40"
        >
          ❮
        </button>

        {/* Carrusel de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6 w-full px-6">
          {paginatedData.map((alm) => (
            <div
              key={alm.id}
              className="cursor-pointer  bg-neutral-200/20 dark:bg-neutral-950 rounded-3xl overflow-hidden shadow-xl hover:shadow-orange-500/50 transform hover:scale-[0.98] transition-all duration-300 flex-shrink-0 snap-start mb-6"
            >
              <div className="w-full h-48 bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={alm.rutaImagenUrl || '/media/images/almacen.png'}
                  alt={alm.nombreAlmacen}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-orange-600">{alm.nombreAlmacen}</h3>
                <div className="mt-4 flex justify-between gap-2 flex-wrap">
                  <button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl transition">
                    <KeenIcon icon="setting" />
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(true);
                      setAlmacen(alm);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition"
                  >
                    <KeenIcon icon="notepad-edit" />
                  </button>
                  <button
                    onClick={() => deleteAlmacen(alm.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition"
                  >
                    <KeenIcon icon="trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flecha derecha */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-orange-600/30 hover:bg-orange-600/70 text-white p-3 rounded-full z-10 transition disabled:opacity-40"
        >
          ❯
        </button>
      </div>

      {/* Paginación */}
      <div className="flex justify-end mt-4 gap-2 px-6">
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

      {/* Modal */}
      <ModalAlmacen
        open={isModalOpen}
        data={almacen}
        onClose={() => {
          setIsModalOpen(false);
          setAlmacen(undefined);
        }}
        onSave={fetchAlmacenes}
      />
    </div>
  );
};

export { GestionAlmacenContent };
