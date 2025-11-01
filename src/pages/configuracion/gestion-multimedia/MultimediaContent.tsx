import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeenIcon } from '@/components';
import axios from 'axios';
import { ArrowLeftCircle, ArrowRightCircle, Image as ImageIcon } from 'lucide-react';

interface ContentProps {
  reload: boolean;
}

interface Cancion {
  id?: number;
  title?: string;
  artist?: string;
  preview_url?: string;
  image?: string;
}

interface Multimedia {
  id: number;
  idGrupoMultimediaPos?: number;
  urlMultimedia: string;
  cancion: string | null;
}

interface GrupoMultimedia {
  id: number;
  nombreGrupo: string;
  grupos_multimedia: Multimedia[];
}

const MultimediaContent = ({ reload }: ContentProps) => {
  const storageFilterId = 'multimedia-filter';
  const [grupos, setGrupos] = useState<GrupoMultimedia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem(storageFilterId) || '');
  const [currentPage, setCurrentPage] = useState(0);
  // mantener 6 por página (3 columnas x 2 filas)
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
      console.log('Multimedia obtenida:', response.data);
      setGrupos(response.data);
    } catch (err) {
      console.error('Error al obtener multimedia:', err);
      setError('Error al cargar multimedia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  const normalizeSong = (raw: any): Cancion | null => {
    if (!raw) return null;
    try {
      const s = typeof raw === 'string' ? JSON.parse(raw.replace(/^"|"$/g, '')) : raw;
      return s;
    } catch {
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        console.error('Error parseando canción:', e);
        return null;
      }
    }
  };

  return (
    <div className="relative w-full py-12 select-none">
      {/* Header estilo PuntosVenta */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-6 gap-4">
        <h2 className="text-4xl font-extrabold text-left text-neutral-950 dark:text-slate-50">
          Multimedia
        </h2>

        <div className="relative flex gap-4 items-center w-full sm:w-auto">
          <KeenIcon
            icon="magnifier"
            className="absolute left-0 ml-3 leading-none text-gray-500 -translate-y-1/2 text-md top-1/2"
          />
          <input
            type="text"
            placeholder="Buscar historias..."
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

      {/* Grid 3x2 (6 items) por página */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-6">
          {grupos.length > 0 ? (
            grupos.map((grupo) => (
              <div
                key={grupo.id}
                className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Imagen del grupo */}
                {grupo.grupos_multimedia && grupo.grupos_multimedia.length > 0 ? (
                  <img
                    src={grupo.grupos_multimedia[0].urlMultimedia}
                    alt={grupo.nombreGrupo}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}

                {/* Información del grupo */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{grupo.nombreGrupo}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">No hay grupos disponibles.</p>
          )}
        </div>
      </div>

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
