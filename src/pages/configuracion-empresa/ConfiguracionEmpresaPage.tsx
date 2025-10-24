// ConfiguracionEmpresaPage.tsx
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
// NOTA: Asegúrate de que en './types' BannerCompanyModel tiene rutaBannerUrl: string | null;

// ===================================================================
// COMPONENTES AUXILIARES (NgxSpinner y CustomModal se mantienen)
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
    const [showFacturacionModal, setShowFacturacionModal] = useState(false);
    const [pendingFacturacionValue, setPendingFacturacionValue] = useState<number>(0);

    const isEmpresaLoaded = !!empresa;

    // --- LÓGICA DE WOMPI (FETCH) ---
    const fetchWompiConfig = useCallback(async () => {
        if (!empresa?.id) return;
        setPageLoading(true);
        try {
            // Llama al endpoint de Laravel que desencripta y devuelve la configuración
            const response = await axios.get<WompiAPIResponse>(`/get_configuration_by_id_company`);
            const configData = response.data;

            if (configData) {
                setWompiKeys({
                    publicKeyProd: configData.publicKeyProd || '',
                    privateKeyProd: configData.privateKeyProd || '',
                    prodEvents: configData.prodEvents || '',
                    prodIntegrity: configData.prodIntegrity || '',
                });
            } else {
                setWompiKeys({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' });
            }
        } catch (error) {
            // Maneja el 404 de Laravel (No credentials) o cualquier otro error
            setWompiKeys({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' });
        } finally {
            setPageLoading(false);
        }
    }, [empresa, setPageLoading]);

    // --- LÓGICA DE WOMPI (SUBMIT) ---
    const handleWompiKeysSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!empresa?.id) { enqueueSnackbar('ID de empresa no disponible.', { variant: 'error' }); return; }
        setPageLoading(true);
        try {
            await axios.post('/update_or_create_credentials_wompi_by_id', {
                company_id: empresa.id,
                ...wompiKeys, // Envía las claves sin cifrar para que Laravel las encripte
            });
            enqueueSnackbar('Llaves de Wompi actualizadas correctamente.', { variant: 'success' });
            fetchWompiConfig(); // Recarga para asegurar que el estado está actualizado
        } catch (error) {
            enqueueSnackbar('Error al guardar las llaves de Wompi.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };

    // --- HANDLERS Y LÓGICA DE FACTURACIÓN ELECTRÓNICA (Se mantiene) ---
    const updateFacturacionElectronica = useCallback(async (newValue: number) => {
        setPageLoading(true);
        const booleanValue = newValue === 1;
        try {
            await axios.post('update_electronic_invoice', { facturaElectronica: booleanValue });
            setFormData(prev => ({ ...prev, facturacionElectronica: newValue }));
            enqueueSnackbar('Estado de Facturación Electrónica actualizado.', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Error al actualizar Facturación Electrónica.', { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    }, []);

    const confirmFacturacionChange = async (confirm: boolean) => {
        setShowFacturacionModal(false);
        if (confirm) {
            await updateFacturacionElectronica(pendingFacturacionValue);
        } else {
            setFormData(prev => ({ ...prev, facturacionElectronica: prev.facturacionElectronica }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checkedValue = (e.target as HTMLInputElement).checked ? 1 : 0;
        const newValue = type === 'checkbox' ? checkedValue : value;

        if (type === 'checkbox' && name === 'facturacionElectronica') {
            if (checkedValue !== formData.facturacionElectronica) {
                setPendingFacturacionValue(checkedValue);
                setShowFacturacionModal(true);
                return;
            }
        }
        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleWompiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWompiKeys(prev => ({ ...prev, [name]: value }));
    };

    // --- HANDLERS Y LÓGICA DE BANNERS ---

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

    // ✅ SOLUCIÓN A TS2322: Función síncrona que envuelve la lógica asíncrona.
    const guardarBanner = useCallback((data: { bannerData: BannerCompanyModel; file: File | null }) => {

        const { bannerData, file } = data;

        (async () => {
            setPageLoading(true);
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
        })();

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

    // --- OTROS HANDLERS (handleFileChange y handleSubmit se mantienen) ---

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


    // --- EFECTO DE MONTAJE: CARGA DE DATOS ---
    useEffect(() => {
        if (empresa) {
            // 1. Inicializa el formulario con los datos de la empresa (Datos Generales y Checklists)
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

            // 2. Inicializa vistas previas de Logo y Portada
            setLogoPreview(empresa.rutaLogoUrl || '');
            setPortadaPreview(empresa.rutaPortadaUrl || '');

            // 3. Carga de Banners (Fetch)
            fetchBanners();

            // 4. Carga de Llaves de Wompi (Fetch)
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

                    {/* MÓDULO DE PRODUCTOS/CHECKLISTS */}
                    <ConfiguracionProductos
                        setPageLoading={setPageLoading}
                        empresaId={empresa?.id}
                        isEmpresaLoaded={isEmpresaLoaded}
                    // NOTA: ConfiguracionProductos debe usar formData y handleChange para checklist
                    // Si ConfiguracionProductos contiene los checklists (servicios, catalogo, productos),
                    // asegúrate de que use formData.servicios, etc., y llame a handleChange.
                    />

                    {/* MÓDULO 3: WOMPI */}
                    <WompiKeysForm
                        wompiKeys={wompiKeys}
                        handleWompiKeysChange={handleWompiKeysChange}
                        handleWompiKeysSubmit={handleWompiKeysSubmit}
                    />

                    {/* MÓDULO 4: BANNERS (Debes añadir la lista de banners aquí) */}
                    {/* ... Componente o sección para mostrar la lista de banners y el botón "Añadir Banner" ... */}
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
                </div>
            </div>

            {/* MODALES */}

            {/* MODAL DE FACTURACIÓN ELECTRÓNICA */}
            <CustomModal
                title={null}
                show={showFacturacionModal}
                onClose={() => confirmFacturacionChange(false)}
                size="sm"
            >
                {/* ... (Contenido del modal de Facturación Electrónica se mantiene) ... */}
            </CustomModal>

            {/* MODAL DE BANNER */}
            <CustomModal
                title={bannerToEdit ? "Editar Banner" : "Añadir Banner"}
                show={showBannerModal}
                onClose={resetBannerModal}
            >
                <AddBanner
                    banner={bannerToEdit}
                    store={guardarBanner} // Función síncrona, resuelve TS2322
                    cancel={resetBannerModal}
                />
            </CustomModal>

            {/* SPINNER GLOBAL */}
            <NgxSpinner loading={pageLoading} />
        </Container>
    );
};

export { ConfiguracionEmpresaPage };