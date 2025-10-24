import { useAuthContext } from '@/auth';
import { Container } from '@/components';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState, useEffect, useCallback } from 'react';
// Importaciones de Banners con rutas relativas correctas
import AddBanner from './components/AddBanner'; 
import { BannerCompanyModel } from './types'; 
// *** NUEVA IMPORTACIÓN DEL COMPONENTE DE PRODUCTOS ***
import { ConfiguracionProductos } from './components/ConfiguracionProductos'; 

// --- Componentes Placeholder (Se mantienen para asegurar compilación) ---
interface InputFieldProps {
    label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    type?: string; readOnly?: boolean; placeholder?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', readOnly = false, placeholder = '' }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 form-label">{label}</label>
        <input 
            type={type} 
            name={name} 
            className="w-full p-2 border border-gray-300 rounded-md input form-control focus:border-blue-500" 
            value={value || ''} 
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
        />
    </div>
);
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
const CheckboxField: React.FC<any> = ({ label, name, checked, onChange }) => ( 
    <div className="flex items-center space-x-2">
        <input 
            type="checkbox" 
            name={name} 
            checked={checked === 1} 
            onChange={onChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
);
// --- Fin Componentes Placeholder ---


// TIPADO DE DATOS (Mantenido)
interface EmpresaData {
    razonSocial: string; nit: string; digitoVerificacion: string | number; email: string; direccion: string; telefono: string; 
    representanteLegal: string; devolucion: string | number; garantia: string | number; valorIva: string | number; 
    responsableIva: number; retenciones: number; facturacionElectronica: number; rutaLogoUrl: string; rutaPortadaUrl: string;
    facebookUrl: string; instagramUrl: string; whatsappNumber: string; tiktokUrl: string; acercaDeNosotros: string; slogan: string; 
    servicios: number; catalogo: number; productos: number;
}
type EmpresaFormData = Omit<EmpresaData, 'rutaLogoUrl' | 'rutaPortadaUrl'> & { [key: string]: any };

const INITIAL_FORM_DATA: EmpresaFormData = {
    razonSocial: '', nit: '', digitoVerificacion: '', email: '', direccion: '', telefono: '', 
    representanteLegal: '', devolucion: '', garantia: '', valorIva: '', 
    responsableIva: 0, retenciones: 0, facturacionElectronica: 0, 
    facebookUrl: '', instagramUrl: '', whatsappNumber: '', tiktokUrl: '', 
    acercaDeNosotros: '', slogan: '', servicios: 0, catalogo: 0, productos: 0,
};


const ConfiguracionEmpresaPage = () => {
    const authContext = useAuthContext();
    const { empresa } = authContext; 
    
    // El loading se maneja aquí para afectar a todo el componente
    const [pageLoading, setPageLoading] = useState(false);

    // --- ESTADOS DE EMPRESA Y WOMPI ---
    const [formData, setFormData] = useState<EmpresaFormData>(INITIAL_FORM_DATA);
    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [portadaPreview, setPortadaPreview] = useState('');
    const [portadaFile, setPortadaFile] = useState<File | null>(null);
    const [wompiKeys, setWompiKeys] = useState({ publicKeyProd: '', privateKeyProd: '', prodEvents: '', prodIntegrity: '' });
    
    // --- ESTADOS DE BANNERS ---
    const [banners, setBanners] = useState<BannerCompanyModel[]>([]);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [bannerToEdit, setBannerToEdit] = useState<BannerCompanyModel | null>(null);
    
    // Flag para saber si los datos iniciales de la empresa ya cargaron
    const isEmpresaLoaded = !!empresa;

    // ------------------- LÓGICA DE BANNERS (Mantenida) -------------------
    
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
    
    // --- EFECTOS DE CARGA INICIAL ---
    
    useEffect(() => {
        if (empresa) {
             // Carga datos de empresa
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
            // Nota: El componente ConfiguracionProductos se encargará de cargar los productos internamente
        }
    }, [empresa, fetchBanners]);

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
    
    const handleWompiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setWompiKeys(prev => ({ ...prev, [name]: value }));
    };

    const handleWompiKeysSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de guardado de llaves de Wompi
        enqueueSnackbar('Llaves de Wompi actualizadas correctamente', { variant: 'success' });
    };

    if (!isEmpresaLoaded) return <NgxSpinner loading={true} />;


    // ------------------- RENDERIZADO -------------------
    return (
        <Container>
            <div className="container p-4">
                {/* CARD PRINCIPAL - Contenedor de todas las secciones */}
                <div className="p-6 space-y-8 bg-white rounded-lg shadow-md card">
                    <h3 className="mb-4 text-2xl font-bold">Configuración de la Empresa</h3>

                    {/* SECCIÓN 1: CONFIGURACIÓN GENERAL */}
                    <div className="p-5 border border-gray-200 rounded-lg shadow-sm card">
                        <div className="pb-4 mb-4 border-b card-header">
                            <h4 className="text-xl font-semibold">Datos Generales</h4>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
                                
                                {/* COLUMNA IZQUIERDA (Campos de Texto) */}
                                <div className="space-y-4">
                                    <InputField label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
                                    <InputField label="NIT" name="nit" value={formData.nit} onChange={handleChange} readOnly={true} />
                                    <InputField label="Dígito Verificación" name="digitoVerificacion" value={formData.digitoVerificacion} onChange={handleChange} readOnly={true} />
                                    <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
                                    <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
                                    <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
                                    <InputField label="Representante Legal" name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} />
                                    <InputField label="Días hábiles para devolución" name="devolucion" value={formData.devolucion} onChange={handleChange} type="number" />
                                    <InputField label="Días hábiles para garantía" name="garantia" value={formData.garantia} onChange={handleChange} type="number" />
                                </div>

                                {/* COLUMNA DERECHA (Logo y Portada, IVA/Módulos) */}
                                <div className="space-y-6">
                                    {/* Logo */}
                                    <div>
                                        <h5 className="mb-2 font-semibold text-gray-700">Logo de la Empresa</h5>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileChange(e, false)} 
                                            className="w-full p-2 text-sm border rounded form-control"
                                        />
                                        {logoPreview && (
                                            <img src={logoPreview} alt="Logo Preview" className="object-contain w-auto h-20 p-1 mt-2 border rounded-md bg-gray-50" />
                                        )}
                                    </div>
                                    
                                    {/* Portada */}
                                    <div>
                                        <h5 className="mb-2 font-semibold text-gray-700">Imagen de Portada</h5>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileChange(e, true)} 
                                            className="w-full p-2 text-sm border rounded form-control"
                                        />
                                        {portadaPreview && (
                                            <img src={portadaPreview} alt="Portada Preview" className="object-cover w-full h-24 p-1 mt-2 border rounded-md bg-gray-50" />
                                        )}
                                    </div>
                                    
                                    {/* IVA/POS */}
                                    <div className="pt-4 space-y-4 border-t border-gray-200">
                                        <h5 className="font-semibold text-gray-700">Configuración Fiscal</h5>
                                        <InputField label="Valor IVA (%)" name="valorIva" value={formData.valorIva} onChange={handleChange} type="number" />
                                        <CheckboxField label="Responsable IVA" name="responsableIva" checked={formData.responsableIva} onChange={handleChange} />
                                        <CheckboxField label="Retenciones" name="retenciones" checked={formData.retenciones} onChange={handleChange} />
                                        <CheckboxField label="Facturación Electrónica" name="facturacionElectronica" checked={formData.facturacionElectronica} onChange={handleChange} />
                                    </div>

                                     <div className="pt-4 border-t border-gray-200">
                                    <h5 className="mb-3 font-semibold text-gray-700">Opciones de Módulos (Punto POS)</h5>
                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                        <CheckboxField label="Módulo Servicios" name="servicios" checked={formData.servicios} onChange={handleChange} />
                                        <CheckboxField label="Módulo Catálogo" name="catalogo" checked={formData.catalogo} onChange={handleChange} />
                                        <CheckboxField label="Módulo Productos" name="productos" checked={formData.productos} onChange={handleChange} />
                                    </div>
                                </div>

                                </div>
                            </div>
                            
                            {/* SECCIÓN INFERIOR (Redes, Acerca de) */}
                            <div className="pt-6 mt-8 space-y-6 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-800">Redes Sociales y Slogan</h4>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <InputField label="Facebook URL" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} />
                                    <InputField label="Instagram URL" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} />
                                    <InputField label="WhatsApp Número" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                                    <InputField label="TikTok URL" name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} />
                                </div>
                                
                                <InputField label="Slogan / Qué ofrecemos" name="slogan" value={formData.slogan} onChange={handleChange} />

                                <div className="flex flex-col gap-1">
                                    <label className="font-semibold text-gray-700 form-label">Acerca de Nosotros</label>
                                    <textarea 
                                        name="acercaDeNosotros" 
                                        value={formData.acercaDeNosotros || ''} 
                                        onChange={handleChange} 
                                        rows={3} 
                                        className="w-full p-2 border rounded form-control"
                                    />
                                </div>
                            </div>

                            {/* Botón de Guardar General */}
                            <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                                <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg btn btn-primary hover:bg-blue-700">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- SECCIÓN GESTIÓN DE BANNERS (Mantenida) --- */}
                    <div className="p-5 border border-gray-200 rounded-lg shadow-sm card">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b card-header">
                            <h4 className="text-xl font-semibold">Gestión de Banners</h4>
                            <button
                                className="btn btn-primary flex items-center bg-blue-400 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                                onClick={() => openModalBanner(null)} 
                            >
                                <i className="mr-2 fa-solid fa-file-circle-plus"></i>
                                Añadir banner
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {banners.map((banner) => (
                                <div key={banner.id} className="relative h-full overflow-hidden transition-shadow border border-gray-200 rounded-lg shadow-lg card group hover:shadow-xl">
                                    <img
                                        src={banner.urlBannerUrl || "https://placehold.co/400x150/ccc/000?text=SIN+IMAGEN"}
                                        className="object-cover w-full h-32"
                                        alt="Banner"
                                    />
                                    <div className="p-3 text-center bg-white">
                                        <p className="text-sm font-medium text-gray-700 truncate" title={banner.descripcion}>{banner.descripcion}</p>
                                    </div>
                                    <div className="absolute flex space-x-1 transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
                                        <button
                                            className="p-2 text-white bg-yellow-500 rounded-full shadow-lg hover:bg-yellow-600"
                                            onClick={() => openModalBanner(banner)} 
                                            title="Editar"
                                        >
                                            <i className="text-xs fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            className="p-2 text-white bg-red-500 rounded-full shadow-lg hover:bg-red-600"
                                            onClick={() => eliminarBanner(banner.id)}
                                            title="Eliminar"
                                        >
                                            <i className="text-xs fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                       {/* *** LLAMADA AL NUEVO COMPONENTE DE PRODUCTOS *** */}
                    <ConfiguracionProductos 
                        setPageLoading={setPageLoading}
                        empresaId={empresa?.id}
                        isEmpresaLoaded={isEmpresaLoaded}
                    />
                    

                    {/* --- SECCIÓN WOMPI (Mantenida) --- */}
                    <div className="p-5 border border-gray-200 rounded-lg shadow-sm card">
                        <div className="pb-4 mb-4 border-b card-header">
                            <h4 className="text-xl font-semibold">Asignar llaves secretas de Wompi</h4>
                        </div>
                        <form onSubmit={handleWompiKeysSubmit} className="max-w-3xl mx-auto space-y-4">
                             <InputField 
                                label="Llave pública" 
                                name="publicKeyProd" 
                                value={wompiKeys.publicKeyProd} 
                                onChange={handleWompiKeysChange}
                                placeholder="Escribe la llave pública" 
                             />
                             <InputField 
                                label="Llave privada" 
                                name="privateKeyProd" 
                                value={wompiKeys.privateKeyProd} 
                                onChange={handleWompiKeysChange}
                                placeholder="Escribe la llave privada" 
                             />
                             <InputField 
                                label="Llave de eventos" 
                                name="prodEvents" 
                                value={wompiKeys.prodEvents} 
                                onChange={handleWompiKeysChange}
                                placeholder="Escribe la llave de eventos" 
                             />
                             <InputField 
                                label="Llave de integridad" 
                                name="prodIntegrity" 
                                value={wompiKeys.prodIntegrity} 
                                onChange={handleWompiKeysChange}
                                placeholder="Escribe la llave de integridad" 
                             />
                            <div className="flex justify-end pt-4">
                                 <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg btn btn-primary hover:bg-blue-700">
                                     Guardar Llaves
                                </button>
                            </div>
                        </form>
                    </div>

                    
                 

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

            {/* SPINNER GLOBAL */}
            <NgxSpinner loading={pageLoading} />
        </Container>
    );
};

export { ConfiguracionEmpresaPage };