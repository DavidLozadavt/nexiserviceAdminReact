import React, { useState } from 'react';
import { EmpresaFormData, InputFieldProps, CheckboxFieldProps } from '../types';
import { KeenIcon } from '@/components';

const InputField: React.FC<InputFieldProps & { tk: any; maxLength?: number }> = ({ label, name, value, onChange, type = 'text', readOnly = false, placeholder = '', isTextArea = false, maxLength, helperText, tk }) => {
    const commonProps = {
        name,
        value: value || '',
        onChange: onChange as (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
        readOnly,
        placeholder,
        maxLength,
        className: `w-full px-3 py-2.5 md:px-4 md:py-3 text-sm font-medium transition-all duration-200 border rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500`,
        style: {
            background: tk.surf2,
            borderColor: tk.brd,
            color: tk.txt
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: tk.txt3 }}>{label}</label>
                {maxLength && (
                    <span className="text-[10px] font-mono" style={{ color: tk.txt3 }}>
                        {(value?.toString() || '').length}/{maxLength}
                    </span>
                )}
            </div>
            {isTextArea ? (
                <textarea {...commonProps} rows={3} className={`${commonProps.className} resize-none`} />
            ) : (
                <input type={type} {...commonProps} />
            )}
            {helperText && (
                <p className="px-1 text-[10px] font-medium opacity-60" style={{ color: tk.txt2 }}>{helperText}</p>
            )}
        </div>
    );
};

const CheckboxField: React.FC<CheckboxFieldProps & { tk: any }> = ({ label, name, checked, onChange, tk, disabled, tooltip }) => (
    <div className="relative group">
        <label 
            className={`flex items-center gap-3 py-[0.7rem] px-4 rounded-2xl border transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`} 
            style={{ borderColor: tk.brd, background: tk.surf2 }}
        >
            <div className="relative flex items-center justify-center">
                <input
                    type="checkbox"
                    name={name}
                    checked={checked === 1 || checked === "1" || checked === true}
                    onChange={disabled ? undefined : onChange}
                    disabled={disabled}
                    className={`peer appearance-none w-6 h-6 border-2 rounded-lg border-blue-200 checked:bg-blue-500 checked:border-blue-500 transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                />
                <KeenIcon icon="check" className="absolute text-white text-xs opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
            </div>
            <span className={`text-sm font-bold select-none transition-colors ${!disabled && 'group-hover:text-blue-500'}`} style={{ color: tk.txt }}>{label}</span>
        </label>

        {disabled && tooltip && (
            <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-60 p-4 rounded-2xl border backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] scale-95 group-hover:scale-100 origin-bottom"
                style={{ background: `${tk.surf}ee`, borderColor: tk.brd, color: tk.txt }}
            >
                <div className="font-black mb-2 text-blue-500 text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2">
                    <KeenIcon icon="lock" className="text-[10px]" />
                    Módulo Bloqueado
                </div>
                <div className="text-[12px] leading-relaxed font-semibold opacity-80">
                    {tooltip}
                </div>
                <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent" 
                    style={{ borderTopColor: tk.brd }} 
                />
                <div 
                    className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 border-[6px] border-transparent" 
                    style={{ borderTopColor: tk.surf }} 
                />
            </div>
        )}
    </div>
);

export const DatosGeneralesForm = ({
    formData,
    logoPreview,
    portadaPreview,
    handleChange,
    handleFileChange,
    handleSubmit,
    activeTab,
    tk,
    setShowBannerEditor,
    setTempBannerUrl,
    productCount,
    catalogCount,
    serviceCount,
    teamCount
}: {
    formData: EmpresaFormData;
    logoPreview: string;
    portadaPreview: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, isPortada: boolean) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    activeTab: string;
    tk: any;
    setShowBannerEditor: (show: boolean) => void;
    setTempBannerUrl: (url: string) => void;
    productCount?: number;
    catalogCount?: number;
    serviceCount?: number;
    teamCount?: number;
}) => {

    const [isDragging, setIsDragging] = useState(false);

    const SectionHeader = ({ title, icon, desc }: { title: string; icon: string; desc: string }) => (
        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-8">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 shrink-0">
                <KeenIcon icon={icon} className="text-xl md:text-2xl" />
            </div>
            <div>
                <h4 className="text-lg md:text-xl font-bold tracking-tight leading-tight" style={{ color: tk.txt }}>{title}</h4>
                <p className="text-[10px] md:text-xs mt-0.5" style={{ color: tk.txt2 }}>{desc}</p>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 pb-10">
            {/* TAB PERFIL */}
            {activeTab === 'perfil' && (
                <div className="nx-in overflow-hidden rounded-3xl md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd }}>
                    <div className="p-4 md:p-8 lg:p-12">
                        <SectionHeader 
                            title="Datos Institucionales" 
                            icon="briefcase" 
                            desc="Información legal y de contacto de la empresa"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <InputField tk={tk} label="Razón Social" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
                            <InputField tk={tk} label="Email Corporativo" name="email" value={formData.email} onChange={handleChange} type="email" />

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: tk.txt3 }}>Identificación (NIT)</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            name="nit"
                                            className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm font-medium transition-all duration-200 border rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            style={{ background: tk.surf2, borderColor: tk.brd, color: tk.txt }}
                                            value={formData.nit || ''}
                                            onChange={handleChange}
                                            readOnly={true}
                                        />
                                    </div>
                                    <div className="w-16 md:w-20">
                                        <input
                                            type="text"
                                            name="digitoVerificacion"
                                            className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm font-bold text-center transition-all duration-200 border rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                                            style={{ background: tk.surf2, borderColor: tk.brd, color: tk.txt }}
                                            value={formData.digitoVerificacion || ''}
                                            onChange={handleChange}
                                            readOnly={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <InputField tk={tk} label="Teléfono de Contacto" name="telefono" value={formData.telefono} onChange={handleChange} />
                            
                            <div className="md:col-span-2">
                                <InputField tk={tk} label="Dirección Física" name="direccion" value={formData.direccion} onChange={handleChange} />
                            </div>

                            <InputField tk={tk} label="Representante Legal" name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} />
                            <InputField tk={tk} label="Slogan / Frase corta" name="slogan" value={formData.slogan} onChange={handleChange} maxLength={100} />
                            
                            <InputField tk={tk} label="Nuestra Misión" name="mision" value={formData.mision} onChange={handleChange} isTextArea={true} maxLength={90} />
                            <InputField tk={tk} label="Nuestra Visión" name="vision" value={formData.vision} onChange={handleChange} isTextArea={true} maxLength={90} />
                        </div>

                        <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t" style={{ borderColor: tk.brd }}>
                            <SectionHeader 
                                title="Configuración Fiscal" 
                                icon="bill" 
                                desc="Impuestos y políticas de garantías"
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                <div className="space-y-4">
                                    <CheckboxField tk={tk} label="Responsable de IVA" name="responsableIva" checked={formData.responsableIva} onChange={handleChange} />
                                    <CheckboxField tk={tk} label="Aplica Retenciones" name="retenciones" checked={formData.retenciones} onChange={handleChange} />
                                    <CheckboxField tk={tk} label="Facturación Electrónica Activa" name="facturacionElectronica" checked={formData.facturacionElectronica} onChange={handleChange} />
                                </div>
                                <div className="space-y-6">
                                    <InputField tk={tk} label="Valor IVA (%)" name="valorIva" value={formData.valorIva} onChange={handleChange} type="number" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField tk={tk} label="Días Devolución" name="devolucion" value={formData.devolucion} onChange={handleChange} type="number" />
                                        <InputField tk={tk} label="Días Garantía" name="garantia" value={formData.garantia} onChange={handleChange} type="number" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB IDENTIDAD */}
            {activeTab === 'identidad' && (
                <div className="nx-in overflow-hidden rounded-3xl md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd }}>
                    <div className="p-4 md:p-8 lg:p-12">
                        <SectionHeader 
                            title="Identidad de Marca" 
                            icon="color-filter" 
                            desc="Personaliza la apariencia de tu portal público"
                        />

                        <div className="space-y-10">
                            {/* FILA SUPERIOR: LOGO Y BANNER */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                {/* COLUMNA LOGO */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: tk.txt3 }}>Logo Empresa</label>
                                    <div className="group relative h-48 md:h-56 rounded-[2rem] border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all hover:bg-blue-50/50 hover:border-blue-400" style={{ borderColor: tk.brd, background: tk.surf2 }}>
                                        {logoPreview ? (
                                            <div className="relative w-full h-full p-6 flex items-center justify-center">
                                                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <KeenIcon icon="cloud-change" className="text-2xl text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <KeenIcon icon="picture" className="text-3xl" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">Subir Logo</span>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, false)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                {/* COLUMNA PORTADA / BANNER */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: tk.txt3 }}>Banner Superior</label>
                                    <div className="group relative h-48 md:h-56 rounded-[2rem] border overflow-hidden flex flex-col justify-between transition-all" style={{ background: tk.surf2, borderColor: tk.brd }}>
                                        <input 
                                            type="file" 
                                            id="portada-upload-hidden"
                                            accept="image/*" 
                                            onChange={(e) => handleFileChange(e, true)} 
                                            className="hidden" 
                                        />

                                        {formData.tipoBanner === 'image' && (
                                            <div 
                                                className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all cursor-pointer"
                                                onClick={() => document.getElementById('portada-upload-hidden')?.click()}
                                            >
                                                {!portadaPreview && (
                                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                                        <KeenIcon icon="cloud-add" className="text-3xl" />
                                                        <span className="text-[10px] font-bold uppercase">Subir Portada</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
                                            <select 
                                                name="tipoBanner" 
                                                value={formData.tipoBanner} 
                                                onChange={handleChange}
                                                className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border-0 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                                style={{ color: tk.txt }}
                                            >
                                                <option value="image">Imagen</option>
                                                <option value="color">Color</option>
                                            </select>
                                        </div>

                                        <div className="absolute top-4 right-4 z-20">
                                            {formData.tipoBanner === 'image' && portadaPreview && (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTempBannerUrl(portadaPreview); setShowBannerEditor(true); }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg shadow-lg text-[10px] font-bold transition-all hover:bg-blue-500 hover:scale-105"
                                                >
                                                    <KeenIcon icon="pointers" className="text-sm" />
                                                    Ajustar
                                                </button>
                                            )}
                                        </div>

                                        <div className="w-full h-full">
                                            {formData.tipoBanner === 'color' ? (
                                                <div className="w-full h-full flex items-center justify-center cursor-pointer" style={{ background: formData.colorBanner }} onClick={() => document.getElementById('color-picker-input')?.click()}>
                                                    <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center gap-3 shadow-xl z-20">
                                                        <input type="color" id="color-picker-input" name="colorBanner" value={formData.colorBanner} onChange={handleChange} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                                        <span className="font-mono text-[10px] text-white font-bold">{formData.colorBanner}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    {portadaPreview ? (
                                                        <img src={portadaPreview} alt="Banner" className="w-full h-full object-cover" style={{ objectPosition: `center ${formData.bannerYOffset}%` }} />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center w-full h-full opacity-20"><KeenIcon icon="picture" className="text-4xl" /></div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FILA COLORES: ALINEADA AL CENTRO (50/50) */}
                            <div className="pt-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest px-1 mb-2 block" style={{ color: tk.txt3 }}>Paleta de Colores</label>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Color Primario (1/2) */}
                                    <div 
                                        className="p-4 rounded-2xl border flex items-center justify-between group transition-all hover:shadow-md cursor-pointer" 
                                        style={{ background: tk.surf2, borderColor: tk.brd }}
                                        onClick={() => document.getElementById('colorPrimaryInput')?.click()}
                                    >
                                        <div className="flex items-center gap-3 pointer-events-none">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: formData.colorPrimary }}>
                                                <KeenIcon icon="paintbucket" className="text-lg" />
                                            </div>
                                            <div>
                                                <h6 className="font-bold text-xs" style={{ color: tk.txt }}>Primario</h6>
                                                <p className="text-[9px]" style={{ color: tk.txt2 }}>Branding principal</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md border pointer-events-none" style={{ background: tk.surf, borderColor: tk.brd, color: tk.txt }}>{formData.colorPrimary}</span>
                                            <input 
                                                id="colorPrimaryInput" 
                                                type="color" 
                                                name="colorPrimary" 
                                                value={formData.colorPrimary} 
                                                onChange={handleChange} 
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" 
                                            />
                                        </div>
                                    </div>

                                    {/* Color Secundario (1/2) */}
                                    <div 
                                        className="p-4 rounded-2xl border flex items-center justify-between group transition-all hover:shadow-md cursor-pointer" 
                                        style={{ background: tk.surf2, borderColor: tk.brd }}
                                        onClick={() => document.getElementById('colorSecondaryInput')?.click()}
                                    >
                                        <div className="flex items-center gap-3 pointer-events-none">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: formData.colorSecondary }}>
                                                <KeenIcon icon="colors-square" className="text-lg" />
                                            </div>
                                            <div>
                                                <h6 className="font-bold text-xs" style={{ color: tk.txt }}>Secundario</h6>
                                                <p className="text-[9px]" style={{ color: tk.txt2 }}>Contrastes del portal</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-md border pointer-events-none" style={{ background: tk.surf, borderColor: tk.brd, color: tk.txt }}>{formData.colorSecondary}</span>
                                            <input 
                                                id="colorSecondaryInput" 
                                                type="color" 
                                                name="colorSecondary" 
                                                value={formData.colorSecondary} 
                                                onChange={handleChange} 
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB REDES */}
            {activeTab === 'redes' && (
                <div className="nx-in overflow-hidden rounded-3xl md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd }}>
                    <div className="p-4 md:p-8 lg:p-12">
                        <SectionHeader 
                            title="Presencia Digital" 
                            icon="share" 
                            desc="Conecta tus redes sociales para mostrarlas en el portal"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            {[
                                { n: 'facebookUrl', l: 'Facebook', i: 'facebook', p: 'https://facebook.com/tu-empresa', h: 'Link completo o nombre de usuario' },
                                { n: 'instagramUrl', l: 'Instagram', i: 'instagram', p: '@tu_empresa', h: 'Puedes usar @usuario o el link completo' },
                                { n: 'tiktokUrl', l: 'TikTok', i: 'tiktok', p: '@tu_empresa', h: 'Puedes usar @usuario o el link completo' },
                                { n: 'youtubeUrl', l: 'YouTube', i: 'youtube', p: 'URL de tu canal', h: 'Link completo de tu canal' },
                                { n: 'whatsappNumber', l: 'WhatsApp Business', i: 'whatsapp', p: '300 000 0000', h: 'Solo el número con código de país' },
                            ].map(soc => (
                                <div key={soc.n} className="flex gap-4 p-4 rounded-3xl border" style={{ background: tk.surf2, borderColor: tk.brd }}>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border shrink-0" style={{ borderColor: tk.brd }}>
                                        <KeenIcon icon={soc.i} className="text-xl text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <InputField tk={tk} label={soc.l} name={soc.n} value={(formData as any)[soc.n]} onChange={handleChange} placeholder={soc.p} helperText={soc.h} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB MODULOS */}
            {activeTab === 'modulos' && (
                <div className="nx-in overflow-hidden rounded-3xl md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd }}>
                    <div className="p-4 md:p-8 lg:p-12">
                        <SectionHeader 
                            title="Módulos del Sistema" 
                            icon="setting-2" 
                            desc="Activa o desactiva las funcionalidades de tu plataforma"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <CheckboxField 
                                tk={tk} 
                                label="Módulo de Servicios" 
                                name="servicios" 
                                checked={formData.servicios} 
                                onChange={handleChange} 
                                disabled={serviceCount === 0}
                                tooltip="Debes crear al menos un servicio para activar este módulo."
                            />
                            <CheckboxField 
                                tk={tk} 
                                label="Módulo de Profesionales" 
                                name="mostrarEquipo" 
                                checked={formData.mostrarEquipo} 
                                onChange={handleChange} 
                                disabled={teamCount === 0}
                                tooltip="Debes registrar al menos un profesional en tu equipo para activar este módulo."
                            />
                            <CheckboxField 
                                tk={tk} 
                                label="Catálogo Digital" 
                                name="catalogo" 
                                checked={formData.catalogo} 
                                onChange={handleChange} 
                                disabled={catalogCount === 0}
                                tooltip="Debes crear al menos un producto en el catálogo para activar este módulo."
                            />
                            <CheckboxField 
                                tk={tk} 
                                label="Inventario de Productos" 
                                name="productos" 
                                checked={formData.productos} 
                                onChange={handleChange} 
                                disabled={productCount === 0}
                                tooltip="Debes tener productos en tu inventario para activar este módulo."
                            />
                        </div>

                        <div className="mt-8 md:mt-12 p-4 md:p-8 rounded-2xl md:rounded-[2rem] border flex flex-col lg:flex-row items-center gap-6 md:gap-8" style={{ background: `linear-gradient(135deg, ${tk.surf2} 0%, ${tk.surf} 100%)`, borderColor: tk.brd }}>
                            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl md:rounded-[2rem] bg-blue-500 text-white shadow-xl shadow-blue-500/30 shrink-0">
                                <KeenIcon icon="delivery" className="text-3xl md:text-4xl" />
                            </div>
                            <div className="flex-1 text-center lg:text-left">
                                <h5 className="text-lg md:text-xl font-bold mb-2" style={{ color: tk.txt }}>¿Gestionar Servicios?</h5>
                                <p className="text-sm mb-6 max-w-lg opacity-80" style={{ color: tk.txt2 }}>Para configurar precios, categorías y descripciones detalladas de tus servicios, visita el administrador de servicios.</p>
                                <a href="/configuracion/gestion-servicios" className="inline-flex items-center justify-center w-full sm:w-auto gap-2 px-6 py-3.5 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                    <KeenIcon icon="setting-4" />
                                    Ir a Gestión de Servicios
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t" style={{ borderColor: tk.brd }}>
                            <SectionHeader title="Reservas y Pagos" icon="calendar" desc="Define políticas de anticipos para las citas" />
                            <div className="max-w-xl space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-wider px-1" style={{ color: tk.txt3 }}>Política de Pago</label>
                                        <CheckboxField tk={tk} label="Exigir Anticipo" name="cobrarPorcentajeReserva" checked={formData.cobrarPorcentajeReserva} onChange={handleChange} />
                                    </div>
                                    <InputField tk={tk} label="Porcentaje (%)" name="porcentajeReserva" value={formData.porcentajeReserva} onChange={handleChange} type="number" placeholder="10" readOnly={formData.cobrarPorcentajeReserva !== 1} />
                                </div>
                                {formData.cobrarPorcentajeReserva === 1 && (
                                    <div className="p-4 md:p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <KeenIcon icon="check-circle" className="text-blue-500" />
                                        </div>
                                        <p className="text-xs md:text-sm text-blue-500/90 font-medium leading-relaxed">
                                            Anticipo activo: Los clientes deberán pagar el <strong className="text-blue-600">{formData.porcentajeReserva || 0}%</strong> de la reserva para confirmar la cita.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </form>
    );
};