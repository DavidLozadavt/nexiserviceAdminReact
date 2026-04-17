import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { useConfirm } from '@/hooks';
import { ArrowLeftCircle, ArrowRightCircle, Image as ImageIcon } from 'lucide-react';
import { ModalMultimedia } from './ModalMultimedia';

interface ContentProps {
  reload: boolean;
  onNewHistoria?: () => void;
}

interface Multimedia {
  id: number;
  idGrupoMultimediaPos: number;
  urlMultimedia: string;
  cancion: string | null;
}

interface GrupoMultimedia {
  id: number;
  nombreGrupo: string;
  grupos_multimedia: Multimedia[];
}

const MultimediaContent = ({ reload, onNewHistoria }: ContentProps) => {
  const storageFilterId = 'multimedia-filter';
  const [grupos, setGrupos] = useState<GrupoMultimedia[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoMultimedia | null>(null); // ✅ nuevo estado
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const { confirmAction } = useConfirm();
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(storageFilterId) || '');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('multimedia_by_company');
      const gruposFormateados = response.data.map((grupo: any) => ({
        ...grupo,
        grupos_multimedia: grupo.grupos_multimedia.map((item: any) => ({
          ...item,
          cancion: item.cancion
            ? (() => {
                try {
                  const parsed = JSON.parse(item.cancion);
                  return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
                } catch {
                  return null;
                }
              })()
            : null
        }))
      }));

      setGrupos(gruposFormateados);
    } catch (err) {
      console.error('Error al obtener multimedia:', err);
      setError('Error al cargar multimedia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [reload]);

  const deleteHistoria = async (id: number) => {
    confirmAction('¿Eliminar este grupo permanentemente?', async () => {
      try {
        await axios.delete(`delete_grupo_multimedia/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
        setError('Error al eliminar la historia');
      }
    });
  };

  const handleAfterSave = () => {
    fetchData(); // recarga los datos
    setIsModalOpen(false);
    setSelectedGrupo(null); // limpia el grupo en edición
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return grupos;
    const q = searchTerm.toLowerCase();
    return grupos.filter((g) => g.nombreGrupo.toLowerCase().includes(q));
  }, [searchTerm, grupos]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return <div className="p-4 text-center text-neutral-500">Cargando multimedia...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header section matching Reels style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 dark:bg-dark-light dark:border-gray-800 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
             <KeenIcon icon="subtitle" className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">Gestión de Historias</h2>
            <p className="text-gray-500 text-sm font-medium">Visualiza y organiza tus contenidos efímeros</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <KeenIcon
              icon="magnifier"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
            />
            <input
              type="text"
              placeholder="Buscar historias..."
              className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
          </div>
          
          {onNewHistoria && (
            <button 
              className="btn btn-primary shadow-lg shadow-violet-500/20 flex items-center gap-2 group whitespace-nowrap" 
              onClick={onNewHistoria}
            >
              <KeenIcon icon="plus-square" className="text-lg group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Nueva Historia</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm dark:bg-dark-light dark:border-gray-800 relative">
        {filteredData.length > 0 ? (
          <>
            <div className="relative max-w-7xl mx-auto">
            {/* Flecha izquierda */}
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
                {paginatedData.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="cursor-pointer w-[80%] sm:w-[50%] md:w-[45%] lg:w-[31%]
                               bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800
                               rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500
                               flex flex-col flex-shrink-0 snap-start mb-10 group"
                  >
                    {/* Multimedia Container with Premium Border */}
                    <div className="w-full h-64 overflow-hidden bg-black relative group/media">
                      {(() => {
                        const file = grupo.grupos_multimedia?.[0];
                        if (!file?.urlMultimedia) {
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-800 text-gray-400">
                              <ImageIcon className="w-12 h-12 opacity-20" />
                            </div>
                          );
                        }

                        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(file.urlMultimedia);

                        return (
                          <>
                            {isVideo ? (
                              <video
                                src={file.urlMultimedia}
                                preload="metadata"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={file.urlMultimedia}
                                alt={grupo.nombreGrupo}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110"
                              />
                            )}
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                          </>
                        );
                      })()}
                      
                      {/* Story Indicator Badge */}
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest">
                        Story Collection
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-1 bg-white dark:bg-neutral-950">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">
                          {grupo.nombreGrupo}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                           <KeenIcon icon="files" className="text-sm" />
                           <span>{grupo.grupos_multimedia?.length || 0} Elementos</span>
                        </div>
                      </div>

                      {/* Glassmorphism Action Buttons */}
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedGrupo(grupo);
                            setIsModalOpen(true);
                          }}
                          className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-violet-50 dark:bg-violet-900/10 text-violet-600 dark:text-violet-400 font-bold text-sm hover:bg-violet-600 hover:text-white transition-all duration-300"
                        >
                          <KeenIcon icon="notepad-edit" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => deleteHistoria(grupo.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                          title="Eliminar"
                        >
                          <KeenIcon icon="trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flecha derecha */}
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

          {/* Paginación */}
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
                className={`px-3 py-1 rounded ${
                  currentPage === idx ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
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
            ? `No hay resultados que coincidan con "${searchTerm}".`
            : 'No hay historias disponible.'}
        </div>
      )}
      </div>
      {/* Modal */}
      <ModalMultimedia
        open={isModalOpen}
        data={selectedGrupo ? [selectedGrupo] : []} // ✅ enviamos solo el grupo seleccionado
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGrupo(null);
        }}
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

export default MultimediaContent;