import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { KeenIcon } from '@/components';
import { useConfirm } from '@/hooks';
import { useAuthContext } from '@/auth';

interface ReelsContentProps {
  reload: boolean;
}

export const ReelsContent = ({ reload }: ReelsContentProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { confirmAction } = useConfirm();
  const { empresa } = useAuthContext();

  const [urls, setUrls] = useState<string[]>([]);
  const [initialUrls, setInitialUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [newLink, setNewLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (empresa && empresa.reelsUrls) {
      const dbUrls = Array.isArray(empresa.reelsUrls) ? empresa.reelsUrls : [];
      setUrls(dbUrls);
      setInitialUrls(dbUrls);
    }
  }, [empresa?.id, reload]);

  const hasChanges = files.length > 0 || JSON.stringify(urls) !== JSON.stringify(initialUrls);

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    setUrls([...urls, newLink.trim()]);
    setNewLink('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveUrl = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('reelsUrls', JSON.stringify(urls));
      
      files.forEach(file => {
        formData.append('reelsFiles[]', file);
      });

      await axios.post('company_update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      enqueueSnackbar('Reels actualizados correctamente. Refresca la vista si es necesario.', { variant: 'success' });
      setFiles([]); // Clear local files since they are uploaded
      setInitialUrls(urls);
    } catch (e) {
      console.error(e);
      enqueueSnackbar('Error al actualizar reels', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})/);
      const videoId = match ? match[1] : null;
      if (videoId) {
        return (
          <img 
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
            alt="YouTube thumbnail" 
            className="w-full h-full object-cover" 
          />
        );
      }
    } else if (url.includes('tiktok.com')) {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center text-white">
          <span className="font-bold text-xs tracking-tighter">TikTok</span>
        </div>
      );
    } else if (url.includes('instagram.com')) {
      return (
        <div className="w-full h-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white">
          <span className="font-bold text-xs">IG</span>
        </div>
      );
    } else if (/\.(mp4|webm|ogg|mov)$/i.test(url)) {
      return (
        <div className="w-full h-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-500">
           <KeenIcon icon="video" className="text-2xl" />
        </div>
      );
    }
    
    // Fallback if not recognized
    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        <KeenIcon icon="link" className="text-xl text-gray-500" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-100 dark:bg-dark-light dark:border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Reels / Shorts</h2>
          <p className="text-gray-500 text-sm mt-1">Configura enlaces externos o sube videos para mostrar en tu negocio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="btn btn-primary"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enlaces */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm dark:bg-dark-light dark:border-gray-800">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Añadir desde URL</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="input w-full"
              placeholder="Ej: https://instagram.com/reel/... o https://youtube.com/shorts/..."
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            />
            <button onClick={handleAddLink} className="btn btn-light btn-active-light-primary shrink-0" disabled={!newLink.trim()}>
              Agregar
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {urls.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No hay URLs configuradas</p>
            )}
            {urls.map((url, i) => (
              <div key={i} className="flex gap-3 items-center p-3 bg-gray-50 dark:bg-dark-active rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-black/5 flex items-center justify-center">
                  {renderPreview(url)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <span className="text-sm truncate block text-gray-600 dark:text-gray-300" title={url}>
                    {url}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(i)}
                  className="btn btn-sm btn-icon btn-light-danger shrink-0"
                  title="Eliminar"
                >
                  <KeenIcon icon="trash" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subir Videos */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm dark:bg-dark-light dark:border-gray-800">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">Añadir Archivo</h3>
          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button 
            className="btn btn-light-primary w-full justify-center mb-4" 
            onClick={() => fileInputRef.current?.click()}
          >
            <KeenIcon icon="file-up" className="mr-2"/>
            Seleccionar videos
          </button>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {files.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No hay archivos seleccionados para subir</p>
            )}
            {files.map((file, i) => {
              const filePreview = URL.createObjectURL(file);
              return (
                <div key={i} className="flex gap-3 items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="w-16 h-16 shrink-0 rounded overflow-hidden bg-black flex items-center justify-center">
                    <video src={filePreview} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden flex flex-col justify-center">
                    <span className="text-sm font-medium truncate text-blue-700 dark:text-blue-300" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-xs text-blue-500/70">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="btn btn-sm btn-icon btn-light-danger shrink-0"
                    title="Eliminar"
                  >
                    <KeenIcon icon="trash" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
