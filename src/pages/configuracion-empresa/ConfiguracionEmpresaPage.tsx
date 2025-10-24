// ConfiguracionEmpresaPage.tsx
// ... (Imports se mantienen iguales)
import { useAuthContext } from '@/auth';
import { Container } from '@/components';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

// Importamos los componentes modulares
import AddBanner from './components/AddBanner'; 
import { DatosGeneralesForm } from './components/DatosGeneralesForm'; 
import { WompiKeysForm } from './components/WompiKeysForm'; 
import { ConfiguracionProductos } from './components/ConfiguracionProductos';

// Importamos los tipos centralizados (Asegúrate de que la ruta sea correcta)
import { 
    EmpresaFormData, WompiKeysData, BannerCompanyModel, WompiAPIResponse 
} from './types'; 

// ===================================================================
// COMPONENTES AUXILIARES (CustomModal sin cambios, es genérico)
// ===================================================================

const NgxSpinner: React.FC<any> = ({ loading }) => (
    loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-lg text-white">Cargando...</div>
        </div>
    ) : null
);

const CustomModal: React.FC<any> = ({ title, show, children, onClose, size = 'lg' }) => {
    if (!show) return null;
    
    const maxWidthClass = size === 'sm' ? 'max-w-md' : 'max-w-lg';

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
            <div className={`w-full ${maxWidthClass} bg-white rounded-lg shadow-2xl dark:bg-gray-900`} onClick={e => e.stopPropagation()}>
                {title && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h5 className="text-xl font-bold dark:text-white">{title}</h5>
                        <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

const INITIAL_FORM_DATA: EmpresaFormData = {
// ... (datos iniciales)
    razonSocial: '', nit: '', digitoVerificacion: '', email: '', direccion: '', telefono: '',
    representanteLegal: '', devolucion: '', garantia: '', valorIva: '',
    responsableIva: 0, retenciones: 0, facturacionElectronica: 0,
    facebookUrl: '', instagramUrl: '', whatsappNumber: '', tiktokUrl: '',
    acercaDeNosotros: '', slogan: '', servicios: 0, catalogo: 0, productos: 0,
};

// ===================================================================
// COMPONENTE PRINCIPAL (CONFIGURACION EMPRESA PAGE)
// ===================================================================

const ConfiguracionEmpresaPage = () => {
    const { empresa } = useAuthContext();
    const [pageLoading, setPageLoading] = useState(false);

    // --- ESTADOS ---
    const [formData, setFormData] = useState<EmpresaFormData>(INITIAL_FORM_DATA);
    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [portadaPreview, setPortadaPreview] = useState('');
    const [portadaFile, setPortadaFile] = useState<File | null>(null);
    const [wompiKeys, setWompiKeys] = useState<WompiKeysData>({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' });
    const [banners, setBanners] = useState<BannerCompanyModel[]>([]);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [bannerToEdit, setBannerToEdit] = useState<BannerCompanyModel | null>(null);

    // --- ESTADOS PARA CONFIRMACIÓN DE FACTURACIÓN ELECTRÓNICA ---
    const [showFacturacionModal, setShowFacturacionModal] = useState(false);
    const [pendingFacturacionValue, setPendingFacturacionValue] = useState<number>(0);
    // -------------------------------------------------------------------

    const isEmpresaLoaded = !!empresa;
    
    // ===================================================================
    // FUNCIÓN DE ACTUALIZACIÓN DEDICADA: FACTURACIÓN ELECTRÓNICA
    // ===================================================================
    const updateFacturacionElectronica = useCallback(async (newValue: number) => {
        setPageLoading(true);
        const booleanValue = newValue === 1; 

        try {
            const dataToSend = {
                facturaElectronica: booleanValue, 
            };
            
            await axios.post('update_electronic_invoice', dataToSend); 
            
            setFormData(prev => ({ 
                ...prev, 
                facturacionElectronica: newValue 
            }));

            enqueueSnackbar('Estado de Facturación Electrónica actualizado.', { variant: 'success' });
            
        } catch (error) {
            enqueueSnackbar('Error al actualizar Facturación Electrónica.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    }, []); 

    // ===================================================================
    // FUNCIÓN DE CONFIRMACIÓN DEL MODAL
    // ===================================================================
    const confirmFacturacionChange = async (confirm: boolean) => {
        setShowFacturacionModal(false);

        if (confirm) {
            await updateFacturacionElectronica(pendingFacturacionValue);
        } else {
             setFormData(prev => ({
                ...prev,
                facturacionElectronica: prev.facturacionElectronica
            }));
        }
    };


    // --- HANDLERS GENERALES (AJUSTADO) ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        const checkedValue = (e.target as HTMLInputElement).checked ? 1 : 0;
        const newValue = type === 'checkbox' ? checkedValue : value;
        
        // 1. Manejo especial para Facturación Electrónica (Abre el modal)
        if (type === 'checkbox' && name === 'facturacionElectronica') {
            
            if (checkedValue !== formData.facturacionElectronica) {
                setPendingFacturacionValue(checkedValue);
                setShowFacturacionModal(true);
                return; 
            }
        }
        
        // 2. Actualización Local para el resto de campos 
        setFormData((prev) => ({
            ...prev,
            [name]: newValue
        }));
    };

    // ... (handleFileChange y handleSubmit se mantienen igual) ...

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isPortada: boolean = false) => {
        const file = e.target.files?.[0] || null;
        if (isPortada) {
            setPortadaFile(file);
            if (file) {
                setPortadaPreview(URL.createObjectURL(file));
            }
        } else {
            setLogoFile(file);
            if (file) {
                setLogoPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPageLoading(true);
        try {
            const dataToSend = new FormData();
            
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'servicios' && key !== 'catalogo' && key !== 'productos' && key !== 'facturacionElectronica') {
                    dataToSend.append(key, value !== null && value !== undefined ? String(value) : '');
                }
            });
            
            const itemsEmpresaArray: string[] = [];
            if (formData.servicios === 1) itemsEmpresaArray.push('servicios');
            if (formData.catalogo === 1) itemsEmpresaArray.push('catalogo');
            if (formData.productos === 1) itemsEmpresaArray.push('productos');
            dataToSend.append('itemsEmpresa', JSON.stringify(itemsEmpresaArray));

            if (logoFile) { dataToSend.append('rutaLogoFile', logoFile); }
            if (portadaFile) { dataToSend.append('rutaPortadaFile', portadaFile); }
            
            await axios.post(`company_update`, dataToSend);
            enqueueSnackbar('Datos actualizados correctamente', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Error al actualizar la empresa', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    // ... (Lógica de Banners, Wompi y useEffects se mantienen igual) ...
    const fetchBanners = useCallback(async () => { /* ... */ }, []);
    const openModalBanner = (banner: BannerCompanyModel | null = null) => { /* ... */ };
    const resetBannerModal = () => { /* ... */ };
    const guardarBanner = useCallback(async (data: { bannerData: BannerCompanyModel; file: File | null }) => { /* ... */ }, [fetchBanners]);
    const eliminarBanner = async (id: number | null) => { /* ... */ };
    const handleWompiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };
    const fetchWompiConfig = useCallback(async () => { /* ... */ }, [empresa, setPageLoading]);
    const handleWompiKeysSubmit = async (e: React.FormEvent) => { /* ... */ };

    useEffect(() => {
        if (empresa) {
            setFormData({ 
                razonSocial: empresa.razonSocial || '', nit: empresa.nit || '', digitoVerificacion: empresa.digitoVerificacion || '',
                email: empresa.email || '', direccion: empresa.direccion || '', telefono: empresa.telefono || '',
                representanteLegal: empresa.representanteLegal || '', devolucion: empresa.devolucion || '', garantia: empresa.garantia || '',
                valorIva: empresa.valorIva || '', responsableIva: empresa.responsableIva || 0, retenciones: empresa.retenciones || 0,
                facturacionElectronica: empresa.facturacionElectronica || 0, facebookUrl: empresa.facebookUrl || '', instagramUrl: empresa.instagramUrl || '',
                whatsappNumber: empresa.whatsappNumber || '', tiktokUrl: empresa.tiktokUrl || '', acercaDeNosotros: empresa.acercaDeNosotros || '',
                slogan: empresa.slogan || '', 
                servicios: Number(empresa.servicios) || 0, 
                catalogo: Number(empresa.catalogo) || 0, 
                productos: Number(empresa.productos) || 0,
            });
            setLogoPreview(empresa.rutaLogoUrl || '');
            setPortadaPreview(empresa.rutaPortadaUrl || '');
            fetchBanners();
            fetchWompiConfig();
        }
    }, [empresa, fetchBanners, fetchWompiConfig]);

    if (!isEmpresaLoaded) return <NgxSpinner loading={true} />;

    // ===================================================================
    // RENDERIZADO
    // ===================================================================
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
                  
                    {/* MÓDULO DE PRODUCTOS */}
                    <ConfiguracionProductos
                        setPageLoading={setPageLoading}
                        empresaId={empresa?.id}
                        isEmpresaLoaded={isEmpresaLoaded}
                    />

                    {/* MÓDULO 3: WOMPI */}
                    <WompiKeysForm
                        wompiKeys={wompiKeys}
                        handleWompiKeysChange={handleWompiKeysChange}
                        handleWompiKeysSubmit={handleWompiKeysSubmit}
                    />
                </div>
            </div>

            {/* MODAL DE CONFIRMACIÓN DE FACTURACIÓN ELECTRÓNICA (ESTILO UNIFICADO Y AZUL) */}
            <CustomModal
                title={null} 
                show={showFacturacionModal}
                onClose={() => confirmFacturacionChange(false)} 
                size="sm" 
            >
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    
                    {/* Icono de Exclamación Naranja (exactamente como en la imagen) */}
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

                    {/* Título y Mensaje (como en la imagen y tu solicitud) */}
                    <h5 className="mb-4 text-xl font-bold dark:text-white">
                        ¿Estás seguro?
                    </h5>
                    <p className="mb-6 text-gray-700 dark:text-gray-300">
                        {pendingFacturacionValue === 1 
                            ? "Estás seguro de activar la facturación electrónica para la empresa"
                            : "Estás seguro de desactivar la facturación electrónica para la empresa"
                        }
                    </p>
                    
                    {/* Botones (Confirmar AZUL, Cancelar GRIS - con sombra y estilos de la imagen) */}
                    <div className="flex justify-center w-full gap-3">
                        <button
                            onClick={() => confirmFacturacionChange(true)}
                            // Botón de Confirmar (AZUL para activar, ROJO para desactivar - con sombra de la imagen)
                            className={`w-1/2 px-4 py-2 font-semibold text-white rounded-lg transition-colors shadow-lg 
                                ${pendingFacturacionValue === 1 
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/50' // Azul para activar
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/50' // Rojo para desactivar
                                }`}
                        >
                            {pendingFacturacionValue === 1 ? "Sí, activar" : "Sí, desactivar"}
                        </button>
                        <button
                            onClick={() => confirmFacturacionChange(false)}
                            // Botón de Cancelar (Gris - con sombra de la imagen)
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
                {/* AddBanner recibe la lógica de guardado y cancelación del padre */}
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