import React from 'react';
import { categoryStyles } from '@/colores/categoryStyles';
import { EmpresaFormData, InputFieldProps, CheckboxFieldProps } from '../types';
const InputField: React.FC<InputFieldProps & { maxLength?: number }> = ({ label, name, value, onChange, type = 'text', readOnly = false, placeholder = '', isTextArea = false, maxLength }) => {
    const commonProps = {
        name,
        value: value || '',
        onChange: onChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
        readOnly,
        placeholder,
        maxLength,
        className: "w-full p-2 border rounded-md input form-control bg-light-DEFAULT text-gray-800 border-gray-200 focus:border-blue-500 dark:bg-dark-DEFAULT dark:text-gray-700 dark:border-dark-DEFAULT",
    };
    return (
        <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 form-label dark:text-gray-300">{label}</label>
                {maxLength && (
                    <span className="text-[10px] text-gray-400 font-mono">
                        {(value?.toString() || '').length}/{maxLength}
                    </span>
                )}
            </div>
            {isTextArea ? (
                <textarea {...commonProps} rows={3} />
            ) : (
                <input type={type} {...commonProps} />
            )}
        </div>
    );
};
const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, name, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            name={name}
            checked={checked === 1 || checked === "1" || checked === true}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
);


export const DatosGeneralesForm = ({
    formData,
    logoPreview,
    portadaPreview,
    handleChange,
    handleFileChange,
    handleSubmit,
    activeTab
}: {
    formData: EmpresaFormData;
    logoPreview: string;
    portadaPreview: string;
    handleChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;
    handleFileChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        isPortada: boolean
    ) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    activeTab: string;
}) => {

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* TAB PERFIL */}
            {activeTab === 'perfil' && (
                <div className="p-6 border border-gray-200 rounded-lg card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
                    <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
                        <h4 className="w-screen p-2 -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 rounded-lg md:text-1xl dark:text-gray-900 dark:bg-transparent">
                            🏢 Datos Generales
                        </h4>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <InputField label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
                        <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />

                        <InputField label="NIT" name="nit" value={formData.nit} onChange={handleChange} readOnly={true} />
                        <InputField label="Dígito Verificación" name="digitoVerificacion" value={formData.digitoVerificacion} onChange={handleChange} readOnly={true} />

                        <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
                        <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />

                        <InputField label="Representante Legal" name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} />
                        <InputField label="Sobre Nosotros" name="slogan" value={formData.slogan} onChange={handleChange} maxLength={100} />
                    </div>

                    <div className="mt-4 space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Misión"
                                name="mision"
                                value={formData.mision}
                                onChange={handleChange}
                                isTextArea={true}
                                maxLength={90}
                            />
                            <InputField
                                label="Visión"
                                name="vision"
                                value={formData.vision}
                                onChange={handleChange}
                                isTextArea={true}
                                maxLength={90}
                            />
                        </div>
                    </div>

                    <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
                         <h4 className="p-2 mb-4 -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 rounded-lg md:text-1xl dark:text-gray-900 dark:bg-transparent">
                            ⚙️ Configuración Fiscal
                        </h4>
                        <div className="flex flex-col gap-6">
                            <div className="space-y-3">
                                <CheckboxField label="Responsable IVA" name="responsableIva" checked={formData.responsableIva} onChange={handleChange} />
                                <CheckboxField label="Retenciones" name="retenciones" checked={formData.retenciones} onChange={handleChange} />
                                <CheckboxField label="Facturación Electrónica" name="facturacionElectronica" checked={formData.facturacionElectronica} onChange={handleChange} />
                                <InputField label="Valor IVA (%)" name="valorIva" value={formData.valorIva} onChange={handleChange} type="number" />
                            </div>
                            <div className="space-y-3">
                                <InputField label="Días hábiles para devolución" name="devolucion" value={formData.devolucion} onChange={handleChange} type="number" />
                                <InputField label="Días hábiles para garantía" name="garantia" value={formData.garantia} onChange={handleChange} type="number" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB IDENTIDAD */}
            {activeTab === 'identidad' && (
                <div className="p-6 border border-gray-200 rounded-lg card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
                    <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
                        <h4 className="w-screen p-2 -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 rounded-lg md:text-1xl dark:text-gray-900 dark:bg-transparent">
                            🖼️ Identidad Visual
                        </h4>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* CONFIGURACIÓN DEL BANNER PRINCIPAL */}
                        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 dark:bg-neutral-800/30 dark:border-neutral-700">
                             <h5 className="mb-4 font-bold text-gray-800 dark:text-gray-200">Personalización del Banner Superior</h5>
                             
                             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Contenido</label>
                                    <select 
                                        name="tipoBanner" 
                                        value={formData.tipoBanner} 
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md form-select bg-white text-gray-800 border-gray-200 focus:border-blue-500 dark:bg-dark-DEFAULT dark:text-gray-300 dark:border-dark-DEFAULT"
                                    >
                                        <option value="image">Imagen de Portada</option>
                                        <option value="color">Color Sólido</option>
                                    </select>
                                </div>

                                {formData.tipoBanner === 'color' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seleccionar Color del Fondo</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color" 
                                                name="colorBanner" 
                                                value={formData.colorBanner} 
                                                onChange={handleChange} 
                                                className="w-12 h-10 border rounded cursor-pointer p-0.5" 
                                            />
                                            <input 
                                                type="text" 
                                                name="colorBanner" 
                                                value={formData.colorBanner} 
                                                onChange={handleChange}
                                                className="w-full p-2 border rounded-md text-sm border-gray-200 dark:bg-dark-DEFAULT dark:border-dark-DEFAULT dark:text-gray-300"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subir Imagen de Portada</label>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, true)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                )}
                             </div>

                             {/* Previsualización del Banner */}
                             <div className="mt-6">
                                <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">Previsualización</p>
                                <div 
                                    className="relative w-full overflow-hidden border rounded-lg shadow-inner h-32 dark:border-gray-700"
                                    style={formData.tipoBanner === 'color' ? { backgroundColor: formData.colorBanner } : {}}
                                >
                                    {formData.tipoBanner === 'image' && (
                                        portadaPreview ? (
                                            <img src={portadaPreview} alt="Portada Preview" className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                                                Sin imagen seleccionada
                                            </div>
                                        )
                                    )}
                                </div>
                             </div>
                        </div>

                        {/* LOGO */}
                        <div className="space-y-2">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Logo de la Empresa</h5>
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, false)} className="file-input" />
                            {logoPreview && (
                                <img src={logoPreview} alt="Logo Preview" className="object-contain w-full p-1 mt-2 border rounded-md h-52 bg-gray-50 dark:bg-gray-200" />
                            )}
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4 mt-8">
                        <div className="space-y-2">
                             <h5 className="font-semibold text-gray-700 dark:text-gray-300">Color Primario</h5>
                             <input type="color" name="colorPrimary" value={formData.colorPrimary} onChange={handleChange} className="w-full h-10 border rounded cursor-pointer" />
                        </div>
                        <div className="space-y-2">
                             <h5 className="font-semibold text-gray-700 dark:text-gray-300">Color Secundario</h5>
                             <input type="color" name="colorSecondary" value={formData.colorSecondary} onChange={handleChange} className="w-full h-10 border rounded cursor-pointer" />
                        </div>
                    </div>
                </div>
            )}

            {/* TAB REDES Y CONTENIDO */}
            {activeTab === 'redes' && (
                <div className="p-6 border border-gray-200 rounded-lg card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
                    <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
                        <h4 className="w-screen p-2 -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 rounded-lg md:text-1xl dark:text-gray-900 dark:bg-transparent">
                            🌐 Redes Sociales y Contenido
                        </h4>
                    </div>                   
                    
                    <div className="flex flex-col gap-4">
                        <InputField label="Facebook URL" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} />
                        <InputField label="Instagram URL" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} />
                        <InputField label="WhatsApp Número" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                        <InputField label="TikTok URL" name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} />
                        <InputField label="YouTube URL (Canal)" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} />
                    </div>


                </div>
            )}

            {/* TAB MODULOS */}
            {activeTab === 'modulos' && (
                <div className="p-6 border border-gray-200 rounded-lg card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
                    <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
                        <h4 className="w-screen p-2 -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 rounded-lg md:text-1xl dark:text-gray-900 dark:bg-transparent">
                            ⚙️ Módulos Adicionales y Reserva
                        </h4>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="space-y-4">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Opciones de Módulos (Punto POS)</h5>
                            <div className="space-y-3">
                                <CheckboxField label="Módulo Servicios" name="servicios" checked={formData.servicios} onChange={handleChange} />
                                <CheckboxField label="Módulo Catálogo" name="catalogo" checked={formData.catalogo} onChange={handleChange} />
                                <CheckboxField label="Módulo Productos" name="productos" checked={formData.productos} onChange={handleChange} />
                            </div>
                        </div>

                        {/* CLARIDAD PARA EL USUARIO: GESTIÓN DE SERVICIOS */}
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 dark:bg-dark-light dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/30">
                                    <i className="ki-duotone ki-delivery text-blue-600 text-xl"></i>
                                </div>
                                <h6 className="font-semibold text-gray-800 dark:text-gray-200">¿Deseas gestionar tus servicios?</h6>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Esta pantalla solo activa las funcionalidades. Para agregar nuevos servicios, cambiar precios o descripciones, ve al módulo especializado.
                            </p>
                            <a 
                                href="/configuracion/gestion-servicios" 
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg transition-all hover:bg-blue-600 hover:text-white dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                            >
                                <i className="ki-duotone ki-setting-4"></i>
                                Ir a Gestión de Servicios
                            </a>
                        </div>

                        <div className="space-y-4">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Logística de Reservas y Anticipos</h5>
                            <div className="space-y-3">
                                <CheckboxField label="Cobrar Anticipo en Reserva" name="cobrarPorcentajeReserva" checked={formData.cobrarPorcentajeReserva} onChange={handleChange} />
                                <InputField label="Porcentaje Anticipo (%)" name="porcentajeReserva" value={formData.porcentajeReserva} onChange={handleChange} type="number" placeholder="Ej: 10" readOnly={formData.cobrarPorcentajeReserva !== 1} />
                            </div>
                            {formData.cobrarPorcentajeReserva === 1 && (
                                <p className="p-3 mt-2 text-sm text-blue-800 bg-blue-100 rounded-md dark:text-blue-300 dark:bg-blue-900/30">
                                    ✔️ Anticipo activo: el cliente pagará el <strong>{formData.porcentajeReserva || 0}%</strong> del servicio en línea para confirmar su cita.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* BOTÓN DE GUARDAR SIEMPRE VISIBLE */}
            {(activeTab === 'perfil' || activeTab === 'identidad' || activeTab === 'redes' || activeTab === 'modulos') && (
                <div className="flex justify-end pt-4 mt-6">
                    <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-500 rounded-lg btn hover:bg-blue-600">
                        Guardar Cambios de {
                            activeTab === 'perfil' ? 'Perfil' :
                            activeTab === 'identidad' ? 'Identidad Visual' :
                            activeTab === 'redes' ? 'Redes' : 'Módulos'
                        }
                    </button>
                </div>
            )}
        </form>
    );
};