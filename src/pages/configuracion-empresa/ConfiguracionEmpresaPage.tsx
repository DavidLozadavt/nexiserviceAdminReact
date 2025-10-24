import { Container } from '@/components';
import { DatosGeneralesForm } from './components/DatosGeneralesForm';
import { WompiKeysForm } from './components/WompiKeysForm';
import { ConfiguracionProductos } from './components/ConfiguracionProductos';
import AddBanner from './components/AddBanner';
import { NgxSpinner, CustomModal } from './components/CustomComponents'; // ⬅️ Nuevo Import
import { useConfiguracionEmpresa } from './hooks/useConfiguracionEmpresa'; 

const ConfiguracionEmpresaPage = () => {
    const {
        pageLoading, formData, logoPreview, portadaPreview, wompiKeys, banners,
        showBannerModal, bannerToEdit, showFacturacionModal, pendingFacturacionValue,
        isEmpresaLoaded,
        confirmFacturacionChange, handleChange, handleWompiKeysChange, openModalBanner, 
        resetBannerModal, guardarBanner, eliminarBanner, handleFileChange, handleSubmit,
        handleWompiKeysSubmit
    } = useConfiguracionEmpresa();

    if (!isEmpresaLoaded) return <NgxSpinner loading={true} />;

    return (
        <Container>
            <div className="container p-4">
                <div className="p-6 space-y-8 bg-white rounded-lg shadow-md card dark:bg-gray-900">
                    <h3 className="mb-4 text-2xl font-bold dark:text-white">Configuración de la Empresa</h3>

                    {/* MÓDULO 1: DATOS GENERALES */}
                    <DatosGeneralesForm
                        formData={formData}
                        logoPreview={logoPreview}
                        portadaPreview={portadaPreview}
                        handleChange={handleChange}
                        handleFileChange={handleFileChange}
                        handleSubmit={handleSubmit}
                    />

                    {/* MÓDULO DE PRODUCTOS/CHECKLISTS (Propiedades del hook se pasan al componente) */}
                    <ConfiguracionProductos
                        setPageLoading={useConfiguracionEmpresa().setPageLoading} // Pasando el setter del hook
                        empresaId={useConfiguracionEmpresa().empresa?.id}
                        isEmpresaLoaded={isEmpresaLoaded}
                    />

                    {/* MÓDULO 4: BANNERS (Lógica del hook se usa aquí) */}
                    <div className="p-5 border border-gray-200 rounded-lg shadow-sm card dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b card-header dark:border-gray-700">
                            <h4 className="text-xl font-semibold dark:text-white">Banners de la Empresa ({banners.length})</h4>
                            <button
                                className="p-2 text-sm font-semibold text-white transition-colors bg-green-500 rounded-lg btn hover:bg-green-600"
                                onClick={() => openModalBanner()}
                            >
                                Añadir Banner
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {banners.map(banner => (
                                <div key={banner.id} className="p-3 border rounded-lg shadow-sm dark:border-gray-700">
                                    <img src={banner.urlBannerUrl || 'placeholder.png'} alt={banner.descripcion} className="object-cover w-full h-24 mb-2 rounded" />
                                    <p className="text-sm truncate dark:text-gray-300">{banner.descripcion}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => openModalBanner(banner)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => eliminarBanner(banner.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {banners.length === 0 && <p className="text-gray-500 dark:text-gray-400">No hay banners configurados.</p>}
                    </div>

                    {/* MÓDULO 3: WOMPI */}
                    <WompiKeysForm
                        wompiKeys={wompiKeys}
                        handleWompiKeysChange={handleWompiKeysChange}
                        handleWompiKeysSubmit={handleWompiKeysSubmit}
                    />
                </div>
            </div>

            {/* MODALES */}

            {/* MODAL DE CONFIRMACIÓN DE FACTURACIÓN ELECTRÓNICA */}
            <CustomModal
                title={null}
                show={showFacturacionModal}
                onClose={() => confirmFacturacionChange(false)}
                size="sm"
            >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    
                    {/* Icono de Exclamación Naranja */}
                    <div className="p-4 mb-4 bg-yellow-100 rounded-full dark:bg-yellow-900/50">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="w-10 h-10 text-yellow-500 dark:text-yellow-400" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>

                    {/* Título y Mensaje */}
                    <h5 className="mb-4 text-xl font-bold dark:text-white">
                        ¿Estás seguro?
                    </h5>
                    <p className="mb-6 text-gray-700 dark:text-gray-300">
                        {pendingFacturacionValue === 1 
                            ? "Estás seguro de activar la facturación electrónica para la empresa"
                            : "Estás seguro de desactivar la facturación electrónica para la empresa"
                        }
                    </p>
                    
                    {/* Botones */}
                    <div className="flex justify-center w-full gap-3">
                        <button
                            onClick={() => confirmFacturacionChange(true)}
                            className={`w-1/2 px-4 py-2 font-semibold text-white rounded-lg transition-colors shadow-lg 
                                ${pendingFacturacionValue === 1 
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/50' 
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/50' 
                                }`}
                        >
                            {pendingFacturacionValue === 1 ? "Sí, activar" : "Sí, desactivar"}
                        </button>
                        <button
                            onClick={() => confirmFacturacionChange(false)}
                            className="w-1/2 px-4 py-2 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg shadow-lg hover:bg-gray-300 shadow-gray-400/50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </CustomModal>

            {/* MODAL DE BANNER */}
            <CustomModal
                title={bannerToEdit ? "Editar Banner" : "Añadir Banner"}
                show={showBannerModal}
                onClose={resetBannerModal}
            >
                <AddBanner
                    banner={bannerToEdit}
                    store={guardarBanner}
                    cancel={resetBannerModal}
                />
            </CustomModal>

            {/* SPINNER GLOBAL */}
            <NgxSpinner loading={pageLoading} />
        </Container>
    );
};

export { ConfiguracionEmpresaPage };