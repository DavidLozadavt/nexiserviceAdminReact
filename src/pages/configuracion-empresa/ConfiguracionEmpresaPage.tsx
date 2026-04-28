import { useState, useMemo, useEffect, useRef } from 'react';
import { useSettings } from '@/providers';
import { Container, KeenIcon, FloatingSaveBar } from '@/components';
import { DatosGeneralesForm } from './components/DatosGeneralesForm';
import { WompiKeysForm } from './components/WompiKeysForm';
import { ConfiguracionProductos } from './components/ConfiguracionProductos';
import AddBanner from './components/AddBanner';
import { NgxSpinner, CustomModal } from './components/CustomComponents';
import { useConfiguracionEmpresa } from './hooks/useConfiguracionEmpresa';
import { BannerEditorModal } from './components/BannerEditorModal';
import Swal from 'sweetalert2';

// ─────────────────────────────────────────────────────────────
// TIPOS Y CONSTANTES
// ─────────────────────────────────────────────────────────────

type TabType = 'perfil' | 'identidad' | 'redes' | 'modulos' | 'pagos';

const TABS: { id: TabType; label: string; icon: string; desc: string }[] = [
    { id: 'perfil',    label: 'Perfil y Fiscal', icon: 'profile-circle', desc: 'Información institucional y legal' },
    { id: 'identidad', label: 'Marca y Banners', icon: 'color-swatch',    desc: 'Logo, colores y banners públicos' },
    { id: 'redes',     label: 'Redes Sociales',  icon: 'instagram',       desc: 'Enlaces a tus perfiles sociales' },
    { id: 'modulos',   label: 'Módulos y App',   icon: 'setting-2',       desc: 'Activar/desactivar funcionalidades' },
    { id: 'pagos',     label: 'Pasarela Wompi',  icon: 'wallet',          desc: 'Configuración de pagos en línea' },
];

// ─────────────────────────────────────────────────────────────
// UTILIDADES Y ESTILOS
// ─────────────────────────────────────────────────────────────

function useThemeTokens(dark: boolean) {
  return {
    surf:   dark ? '#111113' : '#ffffff',
    surf2:  dark ? '#1c1c1f' : '#f9f9fa',
    brd:    dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)',
    brdH:   dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.16)',
    txt:    dark ? '#e4e4e7' : '#18181b',
    txt2:   dark ? 'rgba(255,255,255,0.5)' : '#52525b',
    txt3:   dark ? 'rgba(255,255,255,0.3)' : '#71717a',
    primary: '#3b82f6',
    accent: dark ? '#2dd4bf' : '#0d9488',
  };
}

const AmbientCanvas: React.FC<{ dark: boolean; isMobile: boolean }> = ({ dark, isMobile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: isMobile ? 15 : 30 }, () => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005, size: Math.random() * 2 + 1
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dotColor = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x * canvas.width, d.y * canvas.height, d.size, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, [dark, isMobile]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

const ConfiguracionEmpresaPage = () => {
    const { getThemeMode } = useSettings();
    const isDarkMode = getThemeMode() === 'dark';
    const tk = useThemeTokens(isDarkMode);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const h = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', h);
      return () => window.removeEventListener('resize', h);
    }, []);

    const {
        pageLoading, formData, logoPreview, portadaPreview, wompiKeys, banners,
        showBannerModal, bannerToEdit, showFacturacionModal, pendingFacturacionValue,
        isEmpresaLoaded, empresa, setPageLoading, isDirty, isWompiDirty,
        confirmFacturacionChange, handleChange, handleWompiKeysChange, openModalBanner,
        resetBannerModal, guardarBanner, eliminarBanner, handleFileChange, handleSubmit,
        handleWompiKeysSubmit, resetFormData,
        showBannerEditor, setShowBannerEditor, tempBannerUrl, setTempBannerUrl,
        setFormData, productCount, catalogCount, serviceCount, teamCount
    } = useConfiguracionEmpresa();

    const [activeTab, setActiveTab] = useState<TabType>('perfil');

    if (!isEmpresaLoaded) return <NgxSpinner loading={true} />;

    return (
        <>
            <style>{`
                @keyframes nx-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .nx-in { animation: nx-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .glass-tab { backdrop-filter: blur(8px); background: ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)'}; }
                .tab-active { background: #3b82f6 !important; color: white !important; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
            `}</style>

            <div className="flex flex-col gap-4 p-2 w-full min-w-0 md:p-8 overflow-x-hidden">
                
                {/* HEADER BANNER */}
                <header className="nx-in relative w-full min-w-0 overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd, animationDelay: '0.1s' }}>
                    <AmbientCanvas dark={isDarkMode} isMobile={isMobile} />
                    <div className="relative z-10 flex flex-col items-start justify-between gap-4 p-5 md:p-10 lg:flex-row lg:items-center lg:p-12">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-500">
                                    <KeenIcon icon="setting-3" className="text-lg md:text-2xl" />
                                </div>
                                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold tracking-tight truncate" style={{ color: tk.txt }}>Configuración</h1>
                            </div>
                            <p className="max-w-md text-xs md:text-base opacity-80" style={{ color: tk.txt2 }}>
                                Gestiona la identidad, módulos y parámetros operativos de tu empresa.
                            </p>
                        </div>
                        
                        <div className="w-full lg:w-auto flex flex-row items-center justify-between lg:flex-col lg:items-center gap-2 p-3 md:p-4 border rounded-2xl md:rounded-3xl bg-gray-50/50 dark:bg-white/5" style={{ borderColor: tk.brd }}>
                            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest" style={{ color: tk.txt3 }}>Estado del Perfil</div>
                            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold" style={{ color: tk.txt }}>
                                <span className="w-2 h-2 shrink-0 bg-green-500 rounded-full animate-pulse" />
                                <span>Activo</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-6 w-full min-w-0">
                    {/* HORIZONTAL TABS */}
                    <div className="nx-in sticky top-[60px] z-[5] md:top-[70px] w-full min-w-0" style={{ animationDelay: '0.2s' }}>
                        <div className="relative w-full min-w-0">
                            <nav className="flex flex-nowrap overflow-x-auto gap-2 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-3xl border glass-tab scrollbar-none shadow-sm no-scrollbar" style={{ background: tk.surf, borderColor: tk.brd }}>
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 min-w-fit flex-1 group ${
                                            activeTab === tab.id ? 'tab-active' : 'hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors ${activeTab === tab.id ? 'bg-white/20' : 'bg-blue-500/10'}`}>
                                            <KeenIcon 
                                                icon={tab.icon} 
                                                className={`text-base md:text-xl ${activeTab === tab.id ? 'text-white' : 'text-blue-500'}`} 
                                            />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold tracking-tight text-[11px] md:text-sm whitespace-nowrap leading-none mb-0 md:mb-1">{tab.label}</span>
                                            <span className={`hidden md:block text-[10px] leading-tight text-left whitespace-nowrap ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {tab.desc}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                            {/* Scroll hint gradient on mobile */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none md:hidden animate-pulse">
                                <KeenIcon icon="right" className="text-blue-500/40 text-lg" />
                            </div>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <main className="flex-1 space-y-6 w-full min-w-0">
                        <div className="nx-in" style={{ animationDelay: '0.3s' }}>
                            <DatosGeneralesForm
                                formData={formData}
                                logoPreview={logoPreview}
                                portadaPreview={portadaPreview}
                                handleChange={handleChange}
                                handleFileChange={handleFileChange}
                                handleSubmit={handleSubmit}
                                activeTab={activeTab}
                                tk={tk}
                                setShowBannerEditor={setShowBannerEditor}
                                setTempBannerUrl={setTempBannerUrl}
                                productCount={productCount}
                                catalogCount={catalogCount}
                                serviceCount={serviceCount}
                                teamCount={teamCount}
                            />

                            {/* TAB IDENTIDAD - ADICIONAL: BANNERS */}
                            {activeTab === 'identidad' && (
                                <section className="nx-in mt-6 space-y-6 overflow-hidden rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd, animationDelay: '0.4s' }}>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-8 pb-0 md:pb-0 gap-4">
                                        <div>
                                            <h4 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: tk.txt }}>Banners Promocionales</h4>
                                            <p className="text-xs" style={{ color: tk.txt2 }}>Gestiona las imágenes publicitarias de tu página</p>
                                        </div>
                                        <button 
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 w-full sm:w-auto justify-center"
                                            onClick={() => openModalBanner()}
                                        >
                                            <KeenIcon icon="plus" className="text-lg" />
                                            Añadir
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:gap-6 p-4 md:p-8 sm:grid-cols-2 xl:grid-cols-3">
                                        {banners.map(banner => (
                                            <div key={banner.id} className="group relative overflow-hidden rounded-3xl border transition-all hover:shadow-xl" style={{ background: tk.surf2, borderColor: tk.brd }}>
                                                <div className="relative aspect-video overflow-hidden bg-gray-200">
                                                    <img 
                                                        src={banner.urlBannerUrl || 'placeholder.png'} 
                                                        alt={banner.descripcion} 
                                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                        <div className="flex gap-2 w-full justify-end">
                                                            <button 
                                                                className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white hover:text-blue-600 transition-all"
                                                                onClick={() => openModalBanner(banner)}
                                                            >
                                                                <KeenIcon icon="notepad-edit" />
                                                            </button>
                                                            <button 
                                                                className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-all"
                                                                onClick={() => {
                                                                    Swal.fire({
                                                                        title: '¿Eliminar banner?',
                                                                        text: 'Esta acción no se puede deshacer.',
                                                                        icon: 'warning',
                                                                        showCancelButton: true,
                                                                        confirmButtonText: 'Sí, eliminar',
                                                                        confirmButtonColor: '#ef4444',
                                                                        cancelButtonText: 'Cancelar'
                                                                    }).then((r) => {
                                                                        if (r.isConfirmed) {
                                                                            eliminarBanner(banner.id);
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                <KeenIcon icon="trash" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <p className="text-xs font-bold truncate uppercase tracking-wider" style={{ color: tk.txt }}>{banner.descripcion}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {banners.length === 0 && (
                                        <div className="flex flex-col items-center justify-center p-12 text-center">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-4">
                                                <KeenIcon icon="picture" className="text-3xl text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium" style={{ color: tk.txt3 }}>No hay banners configurados.</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* MÓDULO 3: Configuraciones Especiales */}
                            {activeTab === 'modulos' && (
                                <div className="nx-in space-y-6" style={{ animationDelay: '0.4s' }}>
                                    <ConfiguracionProductos
                                        setPageLoading={setPageLoading}
                                        empresaId={empresa?.id}
                                        isEmpresaLoaded={isEmpresaLoaded}
                                        tk={tk}
                                    />
                                </div>
                            )}

                            {/* MÓDULO 4: WOMPI KEYS */}
                            {activeTab === 'pagos' && (
                                <div className="nx-in" style={{ animationDelay: '0.4s' }}>
                                    <WompiKeysForm
                                        wompiKeys={wompiKeys}
                                        handleWompiKeysChange={handleWompiKeysChange}
                                        handleWompiKeysSubmit={handleWompiKeysSubmit}
                                        tk={tk}
                                    />
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* MODALES ESTILIZADOS */}
            <CustomModal show={showFacturacionModal} onClose={() => confirmFacturacionChange(false)} size="sm">
                <div className="flex flex-col items-center p-8 text-center">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-[2rem] flex items-center justify-center mb-6">
                        <KeenIcon icon="information-2" className="text-4xl text-yellow-500" />
                    </div>
                    <h5 className="text-2xl font-bold mb-3" style={{ color: tk.txt }}>¿Confirmar cambio?</h5>
                    <p className="text-sm mb-8" style={{ color: tk.txt2 }}>
                        Vas a {pendingFacturacionValue === 1 ? 'activar' : 'desactivar'} la facturación electrónica. Asegúrate de que los datos fiscales sean correctos.
                    </p>
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={() => confirmFacturacionChange(true)}
                            className={`flex-1 py-4 font-bold text-white rounded-2xl transition-all shadow-lg ${
                                pendingFacturacionValue === 1 ? 'bg-blue-600 shadow-blue-500/30' : 'bg-red-600 shadow-red-500/30'
                            }`}
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={() => confirmFacturacionChange(false)}
                            className="flex-1 py-4 font-bold rounded-2xl border transition-all"
                            style={{ borderColor: tk.brd, color: tk.txt2 }}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </CustomModal>

            <CustomModal show={showBannerModal} onClose={resetBannerModal}>
                <AddBanner banner={bannerToEdit} store={guardarBanner} cancel={resetBannerModal} tk={tk} />
            </CustomModal>

            <BannerEditorModal 
                show={showBannerEditor}
                onClose={() => setShowBannerEditor(false)}
                image={tempBannerUrl || portadaPreview}
                logo={logoPreview}
                formData={formData}
                tk={tk}
                onSave={async (newOffset) => {
                    // Cerramos modal primero para mejorar UX
                    setShowBannerEditor(false);
                    // Disparamos el submit pasando el nuevo offset manualmente para evitar cierres obsoletos
                    await handleSubmit(undefined, { bannerYOffset: newOffset });
                }}
            />


            <FloatingSaveBar 
                show={(isDirty || isWompiDirty) && !showBannerEditor && !showBannerModal}
                label={(isDirty && isWompiDirty) ? 'Múltiples cambios detectados' : isWompiDirty ? 'Cambios en Wompi detectados' : 'Cambios en perfil detectados'}
                isLoading={pageLoading}
                onSave={async () => {
                    if (isDirty) await handleSubmit({ preventDefault: () => {} } as any);
                    if (isWompiDirty) await handleWompiKeysSubmit({ preventDefault: () => {} } as any);
                }}
                onCancel={resetFormData}
            />

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
            `}</style>
            <NgxSpinner loading={pageLoading} />
        </>
    );
};

export { ConfiguracionEmpresaPage };