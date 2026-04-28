import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BannerCompanyModel } from '../types';
import { KeenIcon } from '@/components';

interface AddBannerProps {
    banner: BannerCompanyModel | null;
    store: (data: { bannerData: BannerCompanyModel; file: File | null }) => void;
    cancel: () => void;
    tk: any;
}

const AddBanner: React.FC<AddBannerProps> = ({ banner, store, cancel, tk }) => {
    const [descripcion, setDescripcion] = useState(banner?.descripcion || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(banner?.urlBannerUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDescripcion(banner?.descripcion || '');
        setPreviewImageUrl(banner?.urlBannerUrl || null);
        setSelectedFile(null);
    }, [banner]);

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
            setPreviewImageUrl(banner?.urlBannerUrl || null);
        }
    };

    const guardar = useCallback(() => {
        if (!descripcion.trim()) return;

        const bannerData: BannerCompanyModel = {
            id: banner?.id || null, 
            descripcion: descripcion.trim(),
            rutaBannerUrl: banner?.rutaBannerUrl || null, 
            urlBannerUrl: banner?.urlBannerUrl || null,
        };

        store({ bannerData, file: selectedFile });
    }, [descripcion, selectedFile, banner, store]);

    return (
        <div className="nx-in overflow-hidden rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd, animationDelay: '0.5s' }}>
            <div className="flex items-center gap-4 p-8 pb-0">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <KeenIcon icon="picture" className="text-2xl" />
                </div>
                <div>
                    <h4 className="text-2xl font-bold tracking-tight" style={{ color: tk.txt }}>
                        {banner?.id ? 'Editar Banner' : 'Añadir Nuevo Banner'}
                    </h4>
                    <p className="text-sm" style={{ color: tk.txt2 }}>Gestiona las imágenes promocionales de tu empresa</p>
                </div>
            </div>

            <div className="p-8 space-y-8">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: tk.txt3 }}>
                        Descripción del Banner
                    </label>
                    <input
                        type="text"
                        className="w-full px-5 py-3.5 rounded-2xl border transition-all focus:ring-2 focus:ring-purple-500/20"
                        style={{ background: tk.surf2, borderColor: tk.brd, color: tk.txt }}
                        placeholder="Ej: Oferta de temporada..."
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: tk.txt3 }}>
                        Imagen del Banner
                    </label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-full aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-black/5 transition-all overflow-hidden group"
                        style={{ borderColor: tk.brd, background: tk.surf2 }}
                    >
                        {previewImageUrl ? (
                            <>
                                <img 
                                    src={previewImageUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-sm font-bold border border-white/30">
                                        Cambiar Imagen
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <KeenIcon icon="upload" className="text-3xl" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold" style={{ color: tk.txt }}>Haz clic para subir</p>
                                    <p className="text-xs" style={{ color: tk.txt3 }}>Recomendado: 1920x1080 (JPG, PNG)</p>
                                </div>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={onFileSelected}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-8 border-t" style={{ borderColor: tk.brd }}>
                    <button
                        onClick={cancel}
                        className="px-6 py-3 font-bold rounded-2xl transition-all"
                        style={{ color: tk.txt2, background: tk.surf2 }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        disabled={!descripcion.trim() || (!banner?.id && !selectedFile)}
                        className="flex items-center gap-2 px-8 py-4 bg-purple-500 text-white font-bold rounded-2xl hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <KeenIcon icon="check-square" className="text-xl" />
                        {banner?.id ? 'Actualizar Banner' : 'Crear Banner'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBanner;

