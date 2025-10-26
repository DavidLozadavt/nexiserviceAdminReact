import React from 'react';
import { categoryStyles } from '@/colores/categoryStyles';
import { EmpresaFormData, InputFieldProps, CheckboxFieldProps } from '../types';
const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', readOnly = false, placeholder = '', isTextArea = false }) => {
    const commonProps = {
        name,
        value: value || '',
        onChange: onChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
        readOnly,
        placeholder,
        className: "w-full p-2 border rounded-md input form-control bg-light-DEFAULT text-gray-800 border-gray-200 focus:border-blue-500 dark:bg-dark-DEFAULT dark:text-gray-700 dark:border-dark-DEFAULT",
    };
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 form-label dark:text-gray-300">{label}</label>
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
            checked={checked === 1}
            onChange={onChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
);


interface DatosGeneralesFormProps {
    formData: EmpresaFormData;
    logoPreview: string;
    portadaPreview: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, isPortada: boolean) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const DatosGeneralesForm: React.FC<DatosGeneralesFormProps> = ({
    formData,
    logoPreview,
    portadaPreview,
    handleChange,
    handleFileChange,
    handleSubmit,
}) => {
    return (
        <div className="p-6 space-y-8 border border-gray-200 rounded-lg card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
            <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
<h4 className="-ml-6 text-xl font-semibold text-gray-800 md:text-2xl dark:text-gray-900">
  🏢 Datos Generales
</h4>
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
                            <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Logo de la Empresa</h5>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, false)}
                                className="w-full p-2 text-sm text-gray-800 border border-gray-200 rounded form-control bg-light-DEFAULT dark:bg-dark-DEFAULT dark:text-gray-200 dark:border-dark-DEFAULT"
                            />
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="object-cover w-32 h-24 p-1 mt-2 border rounded-md bg-gray-50 dark:bg-gray-200"
                                />
                            )}
                        </div>

                        {/* Portada */}
                        <div>
                            <h5 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Imagen de Portada</h5>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, true)}
                                className="w-full p-2 text-sm text-gray-800 border border-gray-200 rounded form-control bg-light-DEFAULT dark:bg-dark-DEFAULT dark:text-gray-200 dark:border-dark-DEFAULT"
                            />
                            {portadaPreview && (
                                <img
                                    src={portadaPreview}
                                    alt="Portada Preview"
                                    className="object-cover w-full h-24 p-1 mt-2 border rounded-md bg-gray-50 dark:bg-gray-200"
                                />
                            )}
                        </div>

                        {/* IVA/POS */}
                        <div className="pt-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Configuración Fiscal</h5>
                            <InputField label="Valor IVA (%)" name="valorIva" value={formData.valorIva} onChange={handleChange} type="number" />
                            <CheckboxField label="Responsable IVA" name="responsableIva" checked={formData.responsableIva} onChange={handleChange} />
                            <CheckboxField label="Retenciones" name="retenciones" checked={formData.retenciones} onChange={handleChange} />
                            <CheckboxField label="Facturación Electrónica" name="facturacionElectronica" checked={formData.facturacionElectronica} onChange={handleChange} />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h5 className="mb-3 font-semibold text-gray-700 dark:text-gray-300">Opciones de Módulos (Punto POS)</h5>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <CheckboxField label="Módulo Servicios" name="servicios" checked={formData.servicios} onChange={handleChange} />
                                <CheckboxField label="Módulo Catálogo" name="catalogo" checked={formData.catalogo} onChange={handleChange} />
                                <CheckboxField label="Módulo Productos" name="productos" checked={formData.productos} onChange={handleChange} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* SECCIÓN INFERIOR (Redes, Acerca de) */}
                <div className="pt-6 mt-8 space-y-6 border-t border-gray-200 dark:border-gray-700">
<h4 className="text-xl font-semibold text-gray-800 md:text-2xl dark:text-gray-900">
  🌐 Redes Sociales
</h4>                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <InputField label="Facebook URL" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} />
                        <InputField label="Instagram URL" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} />
                        <InputField label="WhatsApp Número" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} />
                        <InputField label="TikTok URL" name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} />
                    </div>

                    <InputField label="Slogan / Qué ofrecemos" name="slogan" value={formData.slogan} onChange={handleChange} />

                    <InputField
                        label="Acerca de Nosotros"
                        name="acercaDeNosotros"
                        value={formData.acercaDeNosotros}
                        onChange={handleChange}
                        isTextArea={true}
                    />
                </div>

                {/* Botón de Guardar General */}
                <div className="flex justify-center pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg btn btn-primary hover:bg-blue-700">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};