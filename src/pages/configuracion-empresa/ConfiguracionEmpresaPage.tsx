import { useAuthContext } from '@/auth';
import { Container } from '@/components';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Importaciones de Banners con rutas relativas correctas
import AddBanner from './components/AddBanner'; 
import { BannerCompanyModel } from './types'; 

// --- Componentes Placeholder (Para que el código compile y sea ejecutable) ---
const CustomModal: React.FC<any> = ({ title, show, children, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h5 className="text-xl font-bold">{title}</h5>
                    <button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};
const NgxSpinner: React.FC<any> = ({ loading }) => (
    loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-lg text-white">Cargando...</div>
        </div>
    ) : null
);
// Componente de entrada básico para simular un input de tu UI
const InputField: React.FC<any> = ({ label, name, value, onChange, type = 'text', readOnly = false }) => (
    <div className="flex items-center gap-2.5">
        <label className="form-label min-w-[140px] max-w-56">{label}</label>
        <input 
            type={type} 
            name={name} 
            className="w-full p-2 border border-gray-300 rounded-md input form-control" 
            value={value || ''} 
            onChange={onChange}
            readOnly={readOnly}
        />
    </div>
);
const CheckboxField: React.FC<any> = ({ label, name, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <input 
            type="checkbox" 
            name={name} 
            checked={checked === 1} 
            onChange={onChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
);
// --- Fin Componentes Placeholder ---

// TIPADO DE DATOS
interface EmpresaData {
    razonSocial: string; nit: string; digitoVerificacion: string | number; email: string; direccion: string; telefono: string; 
    representanteLegal: string; devolucion: string | number; garantia: string | number; valorIva: string | number; 
    responsableIva: number; retenciones: number; facturacionElectronica: number; rutaLogoUrl: string; rutaPortadaUrl: string;
    facebookUrl: string; instagramUrl: string; whatsappNumber: string; tiktokUrl: string; acercaDeNosotros: string; slogan: string; 
    servicios: number; catalogo: number; productos: number;
}
type EmpresaFormData = Omit<EmpresaData, 'rutaLogoUrl' | 'rutaPortadaUrl'> & { [key: string]: any };

const ConfiguracionEmpresaPage = () => {
    const authContext = useAuthContext();
    const { empresa } = authContext; 
    
    const [pageLoading, setPageLoading] = useState(false);

    // --- ESTADOS GENERALES Y EMPRESA ---
    const [formData, setFormData] = useState<EmpresaFormData>({} as EmpresaFormData);
    
    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [portadaPreview, setPortadaPreview] = useState('');
    const [portadaFile, setPortadaFile] = useState<File | null>(null);

    const [wompiKeys, setWompiKeys] = useState({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' });
    
    // --- ESTADO DE BANNERS ---
    const [banners, setBanners] = useState<BannerCompanyModel[]>([]);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [bannerToEdit, setBannerToEdit] = useState<BannerCompanyModel | null>(null);

    // ------------------- LÓGICA DE BANNERS (Rutas Finales Corregidas) -------------------
    
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

        if (isNew && !file) {
             enqueueSnackbar('Debe seleccionar una imagen para un banner nuevo.', { variant: 'warning' });
             setPageLoading(false);
             return;
        }

        const formData = new FormData();
        formData.append('descripcion', bannerData.descripcion);
        
        let endpoint = '';
        
        if (isNew) {
            endpoint = `/store_banner`; 
        } else {
            endpoint = `/update_banner/${bannerData.id}`; 
        } 
        
        // --- CAMPO DE ARCHIVO CORREGIDO: rutaBannerFile ---
        if (file) {
            formData.append('rutaBannerFile', file, file.name); 
        }

        try {
            await axios.post(endpoint, formData); 
            await fetchBanners(); 
            enqueueSnackbar(`Banner ${isNew ? 'creado' : 'actualizado'} con éxito.`, { variant: 'success' });
            resetBannerModal();
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? `Fallo de red (${error.response?.status || 'N/A'}). Ruta: ${endpoint}`
                : (error as Error).message;
            console.error("Error al guardar banner:", error);
            enqueueSnackbar(`Error al guardar: ${errorMessage}`, { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    }, [fetchBanners]);

    const eliminarBanner = async (id: number | null) => {
        if (!id || !window.confirm("¿Estás seguro de que quieres eliminar este banner? Esta acción es irreversible.")) return;
        
        setPageLoading(true);
        try {
            // ELIMINAR: RUTA DE LARAVEL: delete_banner/{id} (DELETE)
            await axios.delete(`/delete_banner/${id}`);
            
            setBanners(prev => prev.filter(b => b.id !== id));
            enqueueSnackbar('Banner eliminado con éxito.', { variant: 'success' });
        } catch (error) {
            const errorMessage = axios.isAxiosError(error) 
                ? `Fallo de red (${error.response?.status || 'N/A'}). Ruta: /delete_banner/${id}`
                : "Error desconocido al eliminar el banner.";
            console.error("Error al eliminar banner:", error);
            enqueueSnackbar(`Error al eliminar: ${errorMessage}`, { variant: 'error' });
        } finally {
            setPageLoading(false);
        }
    };
    
    // ------------------- LÓGICA GENERAL DE LA EMPRESA -------------------

    useEffect(() => {
        if (empresa) {
            // Inicializar estados con datos de la empresa
             setFormData({
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
        }
    }, [empresa, fetchBanners]);

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
    
    // CORRECCIÓN DE TS7006 ANTERIOR (FormEvent)
    const handleWompiKeysSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        enqueueSnackbar('Llaves de Wompi actualizadas correctamente', { variant: 'success' });
    };

    if (!empresa) return <div>Cargando...</div>;

    // ------------------- RENDERIZADO -------------------
    return (
        <Container>
            {/* SECCIÓN 1: CONFIGURACIÓN GENERAL DE LA EMPRESA */}
            <form onSubmit={handleSubmit}>
                <div className="card pb-2.5">
                    <div className="card-header">
                        <h3 className="card-title">Configuración de Empresa</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8 items-start">
                            
                            {/* COLUMNA IZQUIERDA (Campos de Texto) */}
                            <div className="space-y-4">
                                <InputField label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
                                <InputField label="NIT" name="nit" value={formData.nit} onChange={handleChange} readOnly={true} />
                                <InputField label="Dígito Verificación" name="digitoVerificacion" value={formData.digitoVerificacion} onChange={handleChange} readOnly={true} />
                                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
                                <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
                                <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
                                <InputField label="Representante Legal" name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} />
                                <InputField label="Facebook URL" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} />
                                <InputField label="Instagram URL" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} />
                                <InputField label="WhatsApp Número" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                                <InputField label="TikTok URL" name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} />
                            </div>

                            {/* COLUMNA DERECHA (Logo y Portada) */}
                            <div className="space-y-6">
                                {/* LOGO */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Logo de la Empresa</h4>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleFileChange(e, false)} 
                                        className="mb-2 form-control"
                                    />
                                    {logoPreview && (
                                        <img src={logoPreview} alt="Logo Preview" className="object-contain w-auto h-20 p-1 border" />
                                    )}
                                </div>
                                
                                {/* PORTADA */}
                                <div>
                                    <h4 className="mb-2 font-semibold">Imagen de Portada</h4>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleFileChange(e, true)} 
                                        className="mb-2 form-control"
                                    />
                                    {portadaPreview && (
                                        <img src={portadaPreview} alt="Portada Preview" className="object-cover w-full h-24 p-1 border" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Opciones de IVA/POS y otros */}
                        <div className="grid grid-cols-1 gap-5 pt-6 mt-6 border-t md:grid-cols-3">
                            <InputField label="% Devolución" name="devolucion" value={formData.devolucion} onChange={handleChange} type="number" />
                            <InputField label="% Garantía" name="garantia" value={formData.garantia} onChange={handleChange} type="number" />
                            <InputField label="Valor IVA" name="valorIva" value={formData.valorIva} onChange={handleChange} type="number" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5 pt-4 md:grid-cols-3">
                            <CheckboxField label="Responsable IVA" name="responsableIva" checked={formData.responsableIva} onChange={handleChange} />
                            <CheckboxField label="Retenciones" name="retenciones" checked={formData.retenciones} onChange={handleChange} />
                            <CheckboxField label="Facturación Electrónica" name="facturacionElectronica" checked={formData.facturacionElectronica} onChange={handleChange} />
                        </div>

                        {/* Textareas */}
                        <div className="mt-6 space-y-4">
                            <label className="font-semibold form-label">Acerca de Nosotros</label>
                            <textarea 
                                name="acercaDeNosotros" 
                                value={formData.acercaDeNosotros || ''} 
                                onChange={handleChange} 
                                rows={3} 
                                className="w-full p-2 border rounded form-control"
                            />
                            <label className="font-semibold form-label">Slogan</label>
                            <input type="text" name="slogan" value={formData.slogan || ''} onChange={handleChange} className="w-full p-2 border rounded form-control" />
                        </div>

                        {/* Opciones de Módulos */}
                        <div className="grid grid-cols-1 gap-5 pt-4 mt-6 border-t md:grid-cols-3">
                            <CheckboxField label="Módulo Servicios" name="servicios" checked={formData.servicios} onChange={handleChange} />
                            <CheckboxField label="Módulo Catálogo" name="catalogo" checked={formData.catalogo} onChange={handleChange} />
                            <CheckboxField label="Módulo Productos" name="productos" checked={formData.productos} onChange={handleChange} />
                        </div>

                        {/* Botón de Guardar */}
                        <div className="flex justify-end pt-6 mt-6 border-t">
                            <button type="submit" className="p-2 text-white bg-blue-600 rounded btn btn-primary hover:bg-blue-700">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            
            {/* SECCIÓN 2: ASIGNAR LLAVES SECRETAS DE WOMPI */}
            <div className="mt-5 card">
                <div className="card-body">
                    <h3 className="mb-4 text-xl font-semibold card-title">Asignar llaves secretas de Wompi</h3>
                    <form onSubmit={handleWompiKeysSubmit} className="max-w-xl mx-auto space-y-4">
                         <InputField 
                            label="Public Key (Prod)" 
                            name="publicKeyProd" 
                            value={wompiKeys.publicKeyProd} 
                            // CORRECCIÓN DE TS7006: Tipado de 'e' en el onChange de Wompi
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWompiKeys({...wompiKeys, publicKeyProd: e.target.value})} 
                         />
                        <button type="submit" className="p-2 text-white bg-green-600 rounded btn btn-primary hover:bg-green-700">Guardar Llaves</button>
                    </form>
                </div>
            </div>

            {/* SECCIÓN 3: GESTIÓN DE BANNERS */}
            <div className="mt-5 card">
                <div className="card-body">
                    <h3 className="mb-4 text-2xl font-semibold card-title">Gestión de Banners</h3>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {banners.map((banner) => (
                            <div key={banner.id} className="relative h-full overflow-hidden transition-shadow rounded-lg shadow-md card group hover:shadow-lg">
                                <img
                                    src={banner.urlBannerUrl || "https://placehold.co/400x150/ccc/000?text=SIN+IMAGEN"}
                                    className="object-cover w-full h-32"
                                    alt="Banner"
                                />
                                <div className="p-2 text-center">
                                    <p className="text-sm font-medium text-gray-700 truncate" title={banner.descripcion}>{banner.descripcion}</p>
                                </div>
                                <div className="absolute flex space-x-1 transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
                                    <button
                                        className="p-1 text-white bg-yellow-500 rounded-full shadow-md btn btn-sm hover:bg-yellow-600"
                                        onClick={() => openModalBanner(banner)} 
                                        title="Editar"
                                    >
                                        <i className="text-xs fa-solid fa-pen-to-square"></i>
                                    </button>
                                    <button
                                        className="p-1 text-white bg-red-500 rounded-full shadow-md btn btn-sm hover:bg-red-600"
                                        onClick={() => eliminarBanner(banner.id)}
                                        title="Eliminar"
                                    >
                                        <i className="text-xs fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="flex items-center justify-center p-2 mt-6 text-white bg-purple-600 rounded btn btn-primary hover:bg-purple-700"
                        onClick={() => openModalBanner(null)} 
                    >
                        <i className="mr-2 fa-solid fa-file-circle-plus"></i>
                        Añadir banner
                    </button>
                </div>
            </div>
            
            {/* SECCIÓN 4: CONFIGURACIÓN DE PRODUCTOS */}
            <div className="mt-5 card">
                <div className="card-body">
                    <h3 className="card-title">Configuración de Productos</h3>
                    <p className="text-gray-500">Aquí iría la lógica compleja de búsqueda, filtro, tabla y paginación de productos.</p>
                </div>
            </div>
            

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

            {/* SPINNER */}
            <NgxSpinner loading={pageLoading} />
        </Container>
    );
};

export { ConfiguracionEmpresaPage };