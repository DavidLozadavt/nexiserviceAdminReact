// ConfiguracionEmpresaPage.tsx
import { useAuthContext } from '@/auth';
import { Container } from '@/components';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';

// Importamos los componentes modulares
import AddBanner from './components/AddBanner'; // Componente existente
import { DatosGeneralesForm } from './components/DatosGeneralesForm'; // Módulo 1
import { WompiKeysForm } from './components/WompiKeysForm'; // Módulo 3
import { ConfiguracionProductos } from './components/ConfiguracionProductos';

// Importamos los tipos centralizados (Asegúrate de que la ruta sea correcta)
import { 
    EmpresaFormData, WompiKeysData, BannerCompanyModel, WompiAPIResponse 
} from './types'; 

// ===================================================================
// COMPONENTES AUXILIARES (Deberían estar en un archivo helpers.tsx)
// ===================================================================

const NgxSpinner: React.FC<any> = ({ loading }) => (
    loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-lg text-white">Cargando...</div>
        </div>
    ) : null
);
const CustomModal: React.FC<any> = ({ title, show, children, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl dark:bg-gray-900" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h5 className="text-xl font-bold dark:text-white">{title}</h5>
                    <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

const INITIAL_FORM_DATA: EmpresaFormData = {
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

    const isEmpresaLoaded = !!empresa;

    // --- HANDLERS GENERALES ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checkedValue = (e.target as HTMLInputElement).checked ? 1 : 0;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checkedValue : value
        }));
    };

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
                dataToSend.append(key, value !== null && value !== undefined ? String(value) : '');
            });
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

    // --- LÓGICA BANNERS (Proveído a GestionBanners y AddBanner) ---

    const fetchBanners = useCallback(async () => {
        setPageLoading(true);
        try {
            const response = await axios.get<BannerCompanyModel[]>(`/banners_company`);
            setBanners(response.data);
        } catch (error) {
            enqueueSnackbar('Error al cargar banners.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    }, []);

    const openModalBanner = (banner: BannerCompanyModel | null = null) => {
        setBannerToEdit(banner);
        setShowBannerModal(true);
    };

    const resetBannerModal = () => {
        setShowBannerModal(false);
        setBannerToEdit(null);
    };

    const guardarBanner = useCallback(async (data: { bannerData: BannerCompanyModel; file: File | null }) => {
        setPageLoading(true);
        const { bannerData, file } = data;
        const isNew = !bannerData.id;
        if (isNew && !file) { enqueueSnackbar('Debe seleccionar una imagen para un banner nuevo.', { variant: 'warning' }); setPageLoading(false); return; }
        const formData = new FormData();
        formData.append('descripcion', bannerData.descripcion);
        let endpoint = isNew ? `/store_banner` : `/update_banner/${bannerData.id}`;
        if (file) { formData.append('rutaBannerFile', file, file.name); }
        try {
            await axios.post(endpoint, formData);
            await fetchBanners();
            enqueueSnackbar(`Banner ${isNew ? 'creado' : 'actualizado'} con éxito.`, { variant: 'success' });
            resetBannerModal();
        } catch (error) {
            console.error("Error al guardar banner:", error);
            enqueueSnackbar(`Error al guardar: ${axios.isAxiosError(error) ? error.message : (error as Error).message}`, { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    }, [fetchBanners]);

    const eliminarBanner = async (id: number | null) => {
        if (!id || !window.confirm("¿Estás seguro de que quieres eliminar este banner?")) return;
        setPageLoading(true);
        try {
            await axios.delete(`/delete_banner/${id}`);
            setBanners(prev => prev.filter(b => b.id !== id));
            enqueueSnackbar('Banner eliminado con éxito.', { variant: 'success' });
        } catch (error) {
            console.error("Error al eliminar banner:", error);
            enqueueSnackbar('Error al eliminar el banner.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    // --- LÓGICA WOMPI (Proveído a WompiKeysForm) ---

    const handleWompiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWompiKeys(prev => ({ ...prev, [name]: value }));
    };

    const fetchWompiConfig = useCallback(async () => {
        if (!empresa?.id) return;
        setPageLoading(true);
        try {
            const response = await axios.get<WompiAPIResponse>(`/get_configuration_by_id_company`);
            const configData = response.data;
            if (configData && configData.publicKeyProd) {
                setWompiKeys({
                    publicKeyProd: configData.publicKeyProd || '',
                    privateKeyProd: configData.privateKeyProd || '',
                    prodEvents: configData.prodEvents || '',
                    prodIntegrity: configData.prodIntegrity || '',
                });
            } else { setWompiKeys({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' }); }
        } catch (error) {
            setWompiKeys({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' });
        } finally {
            setPageLoading(false);
        }
    }, [empresa, setPageLoading]);

    const handleWompiKeysSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!empresa?.id) { enqueueSnackbar('ID de empresa no disponible.', { variant: 'error' }); return; }
        setPageLoading(true);
        try {
            await axios.post('/update_or_create_credentials_wompi_by_id', {
                company_id: empresa.id,
                ...wompiKeys,
            });
            enqueueSnackbar('Llaves de Wompi actualizadas correctamente.', { variant: 'success' });
            fetchWompiConfig();
        } catch (error) {
            enqueueSnackbar('Error al guardar las llaves de Wompi.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };


    // --- EFECTOS DE CARGA INICIAL ---
    useEffect(() => {
        if (empresa) {
            setFormData({ /* ... carga de datos de empresa ... */
                razonSocial: empresa.razonSocial || '', nit: empresa.nit || '', digitoVerificacion: empresa.digitoVerificacion || '',
                email: empresa.email || '', direccion: empresa.direccion || '', telefono: empresa.telefono || '',
                representanteLegal: empresa.representanteLegal || '', devolucion: empresa.devolucion || '', garantia: empresa.garantia || '',
                valorIva: empresa.valorIva || '', responsableIva: empresa.responsableIva || 0, retenciones: empresa.retenciones || 0,
                facturacionElectronica: empresa.facturacionElectronica || 0, facebookUrl: empresa.facebookUrl || '', instagramUrl: empresa.instagramUrl || '',
                whatsappNumber: empresa.whatsappNumber || '', tiktokUrl: empresa.tiktokUrl || '', acercaDeNosotros: empresa.acercaDeNosotros || '',
                slogan: empresa.slogan || '', servicios: empresa.servicios || 0, catalogo: empresa.catalogo || 0, productos: empresa.productos || 0,
            });
            setLogoPreview(empresa.rutaLogoUrl || '');
            setPortadaPreview(empresa.rutaPortadaUrl || '');
            fetchBanners();
            fetchWompiConfig();
        }
    }, [empresa, fetchBanners, fetchWompiConfig]);

    if (!isEmpresaLoaded) return <NgxSpinner loading={true} />;

    // ===================================================================
    // RENDERIZADO CON MÓDULOS
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

            {/* MODAL DE BANNER (Global, usa CustomModal y AddBanner) */}
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