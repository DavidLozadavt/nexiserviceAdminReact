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
                <h4 className="w-screen -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 md:text-1xl dark:text-gray-900 dark:bg-transparent">
                    🏢 Datos Generales
                </h4>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    <InputField label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
                    <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />

                    <InputField label="NIT" name="nit" value={formData.nit} onChange={handleChange} readOnly={true} />
                    <InputField label="Dígito Verificación" name="digitoVerificacion" value={formData.digitoVerificacion} onChange={handleChange} readOnly={true} />

                    <InputField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} />
                    <InputField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />

                    <InputField label="Representante Legal" name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} />
                    <InputField label="Días hábiles para devolución" name="devolucion" value={formData.devolucion} onChange={handleChange} type="number" />

                    <InputField label="Días hábiles para garantía" name="garantia" value={formData.garantia} onChange={handleChange} type="number" />
                    <div className="hidden md:block"></div>
                </div>

                <div className="pt-6 mt-8 space-y-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="mb-4 text-xl font-semibold text-gray-800 bg-blue-200 md:text-1xl dark:text-gray-900 dark:bg-transparent">
                        🖼️ Identidad Visual
                    </h4>

                    {/* Grid de 2 columnas para distribuir Logo (izquierda) y Portada (derecha) */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

                        {/* LOGO (Columna Izquierda) */}
                        <div className="space-y-2">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Logo de la Empresa</h5>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, false)}
                                className="file-input"
                            />
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo Preview"
                                    className="object-contain w-full h-32 p-1 mt-2 border rounded-md bg-gray-50 dark:bg-gray-200"
                                />
                            )}
                        </div>

                        {/* PORTADA (Columna Derecha) */}
                        <div className="space-y-2">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Imagen de Portada</h5>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, true)}
                                className="file-input"
                            />
                            {portadaPreview && (
                                <img
                                    src={portadaPreview}
                                    alt="Portada Preview"
                                    className="object-contain w-full h-32 p-1 mt-2 border rounded-md bg-gray-50 dark:bg-gray-200"
                                />
                            )}
                        </div>
                    </div>
                </div>


                <div className="pt-6 mt-8 space-y-6 border-t border-gray-200 dark:border-gray-700">

                    {/* TÍTULO DE LA SECCIÓN */}
                    <h4 className="text-xl font-semibold text-gray-800 bg-blue-200 md:text-1xl dark:text-gray-900 dark:bg-transparent">
                        ⚙️ Configuración Avanzada
                    </h4>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                        {/* 1. CONFIGURACIÓN FISCAL (Columna 1) */}
                        <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Configuración Fiscal</h5>
                            <CheckboxField label="Responsable IVA" name="responsableIva" checked={formData.responsableIva} onChange={handleChange} />
                            <CheckboxField label="Retenciones" name="retenciones" checked={formData.retenciones} onChange={handleChange} />
                            <CheckboxField label="Facturación Electrónica" name="facturacionElectronica" checked={formData.facturacionElectronica} onChange={handleChange} />
                            <InputField label="Valor IVA (%)" name="valorIva" value={formData.valorIva} onChange={handleChange} type="number" />

                        </div>

                        {/* 2. OPCIONES DE MÓDULOS (Columna 2) */}
                        <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Opciones de Módulos (Punto POS)</h5>
                            <div className="space-y-3">
                                <CheckboxField label="Módulo Servicios" name="servicios" checked={formData.servicios} onChange={handleChange} />
                                <CheckboxField label="Módulo Catálogo" name="catalogo" checked={formData.catalogo} onChange={handleChange} />
                                <CheckboxField label="Módulo Productos" name="productos" checked={formData.productos} onChange={handleChange} />
                            </div>
                        </div>

                        {/* 3. CONFIGURACIÓN DE RESERVA Y ANTICIPO (Columna 3) */}
                        <div className="space-y-3">
                            <h5 className="font-semibold text-gray-700 dark:text-gray-300">Reserva y Anticipo</h5>
                            <div className="space-y-3">
                                {/* Checkbox */}
                                <CheckboxField
                                    label="Cobrar Anticipo en Reserva"
                                    name="cobrarPorcentajeReserva"
                                    checked={formData.cobrarPorcentajeReserva}
                                    onChange={handleChange}
                                />

                                {/* Input */}
                                <InputField
                                    label="Porcentaje Anticipo (%)"
                                    name="porcentajeReserva"
                                    value={formData.porcentajeReserva}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="Ej: 10"
                                    readOnly={formData.cobrarPorcentajeReserva !== 1}
                                />
                            </div>

                            {/* Mensaje de confirmación visual */}
                            {formData.cobrarPorcentajeReserva === 1 && (
                                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                                    ✔️ Anticipo activo: el cliente pagará el **{formData.porcentajeReserva || 0}%** del servicio para confirmar.
                                </p>
                            )}
                        </div>

                    </div>

                </div>


                {/* SECCIÓN INFERIOR (Redes, Acerca de) */}
                <div className="pt-6 mt-8 space-y-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-semibold text-gray-800 bg-blue-200 md:text-1xl dark:text-gray-900 dark:bg-transparent">
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
                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg btn btn-primary hover:bg-blue-700">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};