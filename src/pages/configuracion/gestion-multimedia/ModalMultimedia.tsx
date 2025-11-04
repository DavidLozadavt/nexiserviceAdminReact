import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

interface ModalProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

interface Song {
  id: number;
  title: string;
  artist: string;
  image: string;
  preview_url: string;
}

// FileEntry puede ser un File nuevo o un objeto existente con url e id
type FileEntry = File | { id?: number; url: string; existing?: true };

const ModalMultimedia = ({ open, data, onClose, onSave }: ModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [groupName, setGroupName] = useState(data?.nombreGrupo || '');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [errors, setErrors] = useState<{ groupName?: string }>({});
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Estados por archivo (paralelos a `files`)
  const [searches, setSearches] = useState<string[]>([]);
  const [songsList, setSongsList] = useState<Song[][]>([]);
  const [selectedSongs, setSelectedSongs] = useState<(Song | null)[]>([]);
  const [loading, setLoading] = useState<boolean[]>([]);
  const [showSearch, setShowSearch] = useState<boolean[]>([]);

  useEffect(() => {
    if (open) {
      // Normalizar `data`: puede venir como objeto de grupo o array con un grupo
      const grupo = Array.isArray(data) ? data[0] : data;
      setGroupName(grupo?.nombreGrupo || '');
      // Si estamos editando y hay multimedia asociada, poblar entradas existentes
      if (grupo?.grupos_multimedia && Array.isArray(grupo.grupos_multimedia)) {
        const existing: FileEntry[] = grupo.grupos_multimedia.map((m: any) => ({
          id: m.id,
          url: m.urlMultimedia ?? m.url ?? '',
          existing: true
        }));
        setFiles(existing);
        setSearches(existing.map((_, i) => ''));
        setSongsList(
          existing.map((m: any, i: number) => {
            // intentar parsear cancion si viene en m.cancion
            try {
              const raw = grupo.grupos_multimedia[i]?.cancion;
              if (!raw) return [];
              return typeof raw === 'string' ? JSON.parse(raw) : [raw];
            } catch {
              return [];
            }
          })
        );
        // selectedSongs: si cancion existe y es objeto, usarla
        setSelectedSongs(
          existing.map((_, i) => {
            const raw = grupo.grupos_multimedia[i]?.cancion;
            try {
              if (!raw) return null;
              const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
              return parsed || null;
            } catch {
              return null;
            }
          })
        );
        setLoading(existing.map(() => false));
        setShowSearch(existing.map(() => false));
      } else {
        // nuevo
        setFiles([]);
        setSearches([]);
        setSongsList([]);
        setSelectedSongs([]);
        setLoading([]);
        setShowSearch([]);
      }
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data]);

  const onFiles = (selected: FileList | null) => {
    if (!selected) return;
    const arr = Array.from(selected);
    const entries: FileEntry[] = arr;
    setFiles((prev) => [...prev, ...entries]);
    setSearches((prev) => [...prev, ...arr.map(() => '')]);
    setSongsList((prev) => [...prev, ...arr.map(() => [])]);
    setSelectedSongs((prev) => [...prev, ...arr.map(() => null)]);
    setLoading((prev) => [...prev, ...arr.map(() => false)]);
    setShowSearch((prev) => [...prev, ...arr.map(() => false)]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onFiles(e.dataTransfer.files);
  };

  const handleBrowse = () => inputRef.current?.click();

  const removeFile = (index: number) => {
    const entry = files[index];
    // si era existente, marcar para borrar en backend
    if (entry && typeof entry === 'object' && 'existing' in entry && (entry as any).id) {
    } else {
      // si es File, revocar objeto URL (se crea en render)
      // no action here because URL.createObjectURL se crea en render, pero podemos revoke si guardamos refs (omitir por simplicidad)
    }

    setFiles((prev) => prev.filter((_, i) => i !== index));
    setSearches((prev) => prev.filter((_, i) => i !== index));
    setSongsList((prev) => prev.filter((_, i) => i !== index));
    setSelectedSongs((prev) => prev.filter((_, i) => i !== index));
    setLoading((prev) => prev.filter((_, i) => i !== index));
    setShowSearch((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const err: any = {};
    if (!groupName.trim()) err.groupName = 'Nombre del grupo requerido';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSearch = async (term: string, index: number) => {
    const newSearches = [...searches];
    newSearches[index] = term;
    setSearches(newSearches);

    if (!term.trim()) {
      const newSongsList = [...songsList];
      newSongsList[index] = [];
      setSongsList(newSongsList);
      return;
    }

    try {
      const newLoading = [...loading];
      newLoading[index] = true;
      setLoading(newLoading);

      const resp = await axios.get(`/deezer/search?q=${encodeURIComponent(term)}`);
      const results: Song[] = resp.data?.data ?? resp.data ?? [];

      const newSongsList = [...songsList];
      newSongsList[index] = results;
      setSongsList(newSongsList);
    } catch (err) {
      console.error('Error buscando canciones:', err);
      enqueueSnackbar('Error al buscar canciones.', { variant: 'error' });
    } finally {
      const newLoading = [...loading];
      newLoading[index] = false;
      setLoading(newLoading);
    }
  };

  const handleSelectSong = (song: Song, index: number) => {
    const newSelected = [...selectedSongs];
    newSelected[index] = song;
    setSelectedSongs(newSelected);
    enqueueSnackbar(`Canción seleccionada: ${song.title}`, { variant: 'success' });

    const newSearches = [...searches];
    newSearches[index] = song.title;
    setSearches(newSearches);

    const newSongsList = [...songsList];
    newSongsList[index] = [];
    setSongsList(newSongsList);

    // Ocultamos buscador después de elegir
    const newShowSearch = [...showSearch];
    newShowSearch[index] = false;
    setShowSearch(newShowSearch);
  };

  const handleToggleSearch = (index: number) => {
    const newShowSearch = [...showSearch];
    newShowSearch[index] = !newShowSearch[index];
    setShowSearch(newShowSearch);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append('nombreGrupo', groupName.trim());

      // enviar nuevos archivos y canciones asociadas
      files.forEach((entry, i) => {
        if (entry instanceof File) {
          form.append('archivos[]', entry);
          if (selectedSongs[i]) {
            form.append(`canciones_new[${i}]`, JSON.stringify(selectedSongs[i]));
          }
        } else {
          // existente: agregar su id para que el backend lo mantenga
          if ((entry as any).id) {
            form.append('existing_ids[]', String((entry as any).id));
            if (selectedSongs[i]) {
              form.append(
                `canciones_existing_${(entry as any).id}`,
                JSON.stringify(selectedSongs[i])
              );
            }
          }
        }
      });

      if (data && (Array.isArray(data) || data?.id)) {
        const grupo = Array.isArray(data) ? data[0] : data;
        if (grupo?.id) {
          await axios.post(`update_grupo_multimedia/${grupo.id}`, form);
          enqueueSnackbar('Grupo multimedia actualizado.', { variant: 'success' });
        } else {
          await axios.post('store_grupo_multimedia', form);
          enqueueSnackbar('Grupo multimedia guardado.', { variant: 'success' });
        }
      }

      if (onSave) await onSave();
      onClose();
    } catch (err) {
      console.error('Error guardando multimedia:', err);
      enqueueSnackbar('Error al guardar multimedia.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // helper para obtener URL de vista previa (File o existente)
  const previewUrl = (entry: FileEntry) => {
    if (!entry) return '';
    if (entry instanceof File) {
      return URL.createObjectURL(entry);
    } else {
      return entry.url || '';
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[960px] top-[5%] p-4">
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="image" className="mr-2" />
            Gestión Multimedia
          </ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-6 px-0 py-5">
          {/* Zona de arrastre */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white dark:bg-neutral-900"
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <div className="mb-3 text-sm text-gray-600">
              <KeenIcon icon="plus" className="inline mr-2 text-lg" />
              Arrastra archivos aquí o
              <button type="button" onClick={handleBrowse} className="ml-2 text-blue-600 underline">
                Añadir Archivos Multimedia
              </button>
            </div>

            {/* Vista previa de archivos */}
            <div className="flex flex-wrap justify-start gap-4 mt-4">
              {files.map((file, i) => {
                const url = previewUrl(file);
                const song = selectedSongs[i];
                const isExisting = !(file instanceof File) && (file as any).existing;
                return (
                  <div
                    key={i}
                    className="relative w-64 bg-white dark:bg-neutral-800 rounded-2xl shadow-md overflow-hidden p-3"
                  >
                    {url ? (
                      <img
                        src={url}
                        alt={file instanceof File ? file.name : `archivo-${i}`}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-500 rounded-md">
                        Sin vista
                      </div>
                    )}

                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      ×
                    </button>

                    {/* Botón para abrir/cerrar buscador */}
                    <button
                      onClick={() => handleToggleSearch(i)}
                      className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-md text-sm mt-2"
                    >
                      {song ? 'Cambiar Canción' : 'Añadir Canción'}
                    </button>

                    {/* Buscador específico por archivo */}
                    {showSearch[i] && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Buscar canción"
                          value={searches[i] || ''}
                          onChange={(e) => handleSearch(e.target.value, i)}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                        {loading[i] && <p className="text-xs text-gray-500 mt-1">Buscando...</p>}
                        {songsList[i]?.length > 0 && (
                          <div className="max-h-40 overflow-auto mt-1 border rounded-lg bg-white dark:bg-neutral-900">
                            {songsList[i].map((songItem) => (
                              <div
                                key={songItem.id}
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                                onClick={() => handleSelectSong(songItem, i)}
                              >
                                <img
                                  src={songItem.image}
                                  alt={songItem.title}
                                  className="w-8 h-8 rounded object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-xs">{songItem.title}</p>
                                  <p className="text-[10px] text-gray-500">{songItem.artist}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vista previa de canción seleccionada */}
                    {song && (
                      <div className="w-full mt-4 rounded-xl bg-white dark:bg-neutral-900 p-3 shadow-sm border border-gray-200 dark:border-neutral-700">
                        <div className="flex flex-col items-center text-center">
                          <img
                            src={song.image}
                            alt={song.title}
                            className="w-12 h-12 object-cover rounded-lg mb-3"
                          />
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {song.title}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">{song.artist}</p>
                          <audio
                            controls
                            src={song.preview_url}
                            className="w-full mt-1 rounded-md"
                          ></audio>
                        </div>
                      </div>
                    )}
                    {isExisting && (
                      <div className="text-xs text-gray-500 mt-2">Archivo guardado (edición)</div>
                    )}
                  </div>
                );
              })}
            </div>

            {files.length === 0 && (
              <div className="text-gray-500">No hay archivos seleccionados</div>
            )}
          </div>

          {/* Nombre del grupo */}
          <div>
            <label htmlFor="groupName" className="block mb-1 text-sm font-medium">
              Nombre del grupo de historias
            </label>
            <input
              id="groupName"
              type="text"
              className={`input p-2 border ${errors.groupName ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Ej: Clientes, Nuestros Servicios"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.groupName) setErrors((prev) => ({ ...prev, groupName: '' }));
              }}
            />
            {errors.groupName && <p className="mt-1 text-sm text-red-500">{errors.groupName}</p>}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 px-4 mt-2">
            <button
              className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalMultimedia };
