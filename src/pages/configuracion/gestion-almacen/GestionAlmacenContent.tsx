import React, { useEffect, useMemo, useState, useRef } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ModalAlmacen } from './ModalAlmacen';

interface ContentProps {
  reload: boolean;
}

const GestionAlmacenContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'almacen-filter';
  const [almacenes, setAlmacenes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [almacen, setAlmacen] = useState<any | undefined>(undefined);
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(storageFilterId) || '');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchAlmacenes = async () => {
    setLoading(true);
    setError('');
    try {
      const resp = await axios.get('almacenes');
      setAlmacenes(resp.data || []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los almacenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlmacenes();
  }, [reload]);

  const deleteAlmacen = async (id: number) => {
    confirmAction('¿Eliminar este almacén permanentemente?', async () => {
      try {
        await axios.delete(`almacenes/${id}`);
        fetchAlmacenes();
      } catch (err) {
        console.error(err);
        setError('Error al eliminar el almacén');
      }
    });
  };

  const handleAfterSave = () => {
    fetchAlmacenes();
    setIsModalOpen(false);
    setAlmacen(undefined);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return almacenes;
    const q = searchTerm.toLowerCase();
    return almacenes.filter(
      (a) =>
        (a.nombreAlmacen || '').toString().toLowerCase().includes(q) ||
        (a.direccion || '').toString().toLowerCase().includes(q) ||
        (a.descripcion || '').toString().toLowerCase().includes(q)
    );
  }, [searchTerm, almacenes]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-lg text-primary animate-pulse">
        Cargando almacenes...
      </div>
    );
  }

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap py-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 ">Gestion Almacen</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-auto">
            <KeenIcon
              icon="magnifier"
              className="leading-none text-md text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Buscar almacen"
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
            ? `No hay almacenes que coincidan con "${searchTerm}".`
            : 'No hay almacenes registrados. Usa el botón “Agregar Almacén” para comenzar.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 px-6">
          {paginatedData.map((a) => (
            <div
              key={a.id}
              className="group bg-white/60 dark:bg-neutral-900/50 backdrop-blur-xl rounded-3xl shadow-lg transition-all duration-300 border border-gray-200/30 dark:border-gray-800/60 overflow-hidden relative"
            >
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={a.rutaImagenUrl || '/media/images/almacen.png'}
                  alt={a.nombreAlmacen}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400 text-center ">{a.nombreAlmacen}</h3>
               

                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => {
                      setAlmacen(a);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition-all duration-200 hover:scale-[1.03]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteAlmacen(a.id)}
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
              className={`px-3 py-1.5 rounded-lg transition ${currentPage === idx ? 'bg-orange-500 text-white shadow' : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
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
      <ModalAlmacen
        open={isModalOpen}
        data={almacen}
        onClose={() => {
          setIsModalOpen(false);
          setAlmacen(undefined);
        }}
        onSave={handleAfterSave}
      />
    </div>
  );
};

export { GestionAlmacenContent };
