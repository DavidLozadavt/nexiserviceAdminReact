import React, { useState, useEffect, useCallback } from 'react';
import { BannerCompanyModel } from '../types';
// Define las propiedades que este componente recibe
interface AddBannerProps {
    banner: BannerCompanyModel | null;
    store: (data: { bannerData: BannerCompanyModel; file: File | null }) => void;
    cancel: () => void;
}

const AddBanner: React.FC<AddBannerProps> = ({ banner, store, cancel }) => {
    // --- ESTADO DEL FORMULARIO Y ARCHIVO ---
    const [descripcion, setDescripcion] = useState(banner?.descripcion || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(banner?.urlBannerUrl || null);

    // Sincronizar el estado de la descripción cuando el prop 'banner' cambie (para edición)
    useEffect(() => {
        setDescripcion(banner?.descripcion || '');
        setPreviewImageUrl(banner?.urlBannerUrl || null);
        setSelectedFile(null); // Resetear el archivo al editar/crear
    }, [banner]);

    // --- HANDLERS ---
    
    // Simula la función onFileSelected(event) del Angular
    const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Si no se selecciona un archivo, mantener la URL existente si estamos editando
            setPreviewImageUrl(banner?.urlBannerUrl || null);
        }
    };
    
    // Simula la función guardar() del Angular
    const guardar = useCallback(() => {
        // Validación básica: la descripción es requerida, y en modo creación, el archivo también.
        if (!descripcion.trim()) {
            // Aquí se usaría una notificación de error si estuviera disponible
            console.error("La descripción del banner es obligatoria.");
            return;
        }

        const bannerData: BannerCompanyModel = {
            id: banner?.id || null, 
            descripcion: descripcion.trim(),
            rutaBannerUrl: banner?.rutaBannerUrl || null, 
        urlBannerUrl: banner?.urlBannerUrl || null,
        };

        // Llama a la función 'store' del componente padre para manejar la subida
        store({ bannerData, file: selectedFile });
    }, [descripcion, selectedFile, banner, store]);

    // --- RENDERIZADO ---
    return (
        <div className="max-w-lg p-4 mx-auto bg-white rounded-lg shadow-xl">
            <h4 className="mb-4 text-xl font-semibold text-gray-800">
                {banner?.id ? 'Editar Banner' : 'Añadir Banner'}
            </h4>
            <div className="space-y-4">
                {/* Texto del Banner */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700" htmlFor="descripcion">
                        Texto del Banner:
                    </label>
                    <input
                        type="text"
                        id="descripcion"
                        className="input"
                        placeholder="Ingrese un texto"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
                
                {/* Imagen del Banner */}
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                        Imagen del Banner:
                    </label>
                    <input
                        type="file"
                        className="input-file"
                        accept="image/*"
                        onChange={onFileSelected}
                    />
                </div>

                {/* Vista Previa */}
                {previewImageUrl && (
                    <div className="p-2 border border-gray-200 rounded-lg">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Vista previa:
                        </label>
                        <img 
                            src={previewImageUrl} 
                            alt="Vista previa" 
                            className="object-cover w-full rounded" 
                            style={{ maxHeight: '200px' }}
                        />
                    </div>
                )}
            </div>

            {/* Footer con botones */}
            <div className="flex justify-end mt-6 space-x-3">
                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={guardar}
                    // Deshabilitar si la descripción está vacía, o si es nuevo y no hay archivo
                    disabled={!descripcion.trim() || (!banner?.id && !selectedFile)} 
                >
                    <i className="mr-1 fa fa-dot-circle-o"></i> Aceptar
                </button>
                <button
                    type="reset"
                    className="btn btn-secondary"
                    onClick={cancel}
                >
                    <i className="mr-1 fa fa-ban"></i> Cancelar
                </button>
            </div>
        </div>
    );
};

export default AddBanner;
