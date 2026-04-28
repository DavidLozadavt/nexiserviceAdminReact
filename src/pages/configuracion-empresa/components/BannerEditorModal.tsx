/**
 * @file BannerEditorModal.tsx
 * @description Modal para ajustar la posición vertical del banner de una empresa.
 * Permite al usuario arrastrar la imagen para definir el encuadre ideal (objectPosition Y).
 *
 * @usage
 * <BannerEditorModal
 *   show={isOpen}
 *   onClose={handleClose}
 *   onSave={(offset) => saveOffset(offset)}
 *   image={bannerUrl}
 *   logo={logoUrl}
 *   formData={empresaForm}
 *   tk={translations}
 * />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KeenIcon } from '@/components';
import { EmpresaFormData } from '../types';

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export interface BannerEditorModalProps {
    show: boolean;
    onClose: () => void;
    /** Callback que recibe el offset Y (0–100) confirmado por el usuario */
    onSave: (offset: number) => void;
    image: string;
    logo: string;
    formData: EmpresaFormData;
    tk: any; // TODO: tipar con el shape real del objeto de traducciones
}

interface StepItem {
    icon: string;
    title: string;
    description: string;
}

interface SidebarItem {
    id: string;
    icon: string;
    label: string;
}

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

/** Pasos de instrucción que se muestran arriba del preview */
const STEPS: StepItem[] = [
    {
        icon: 'mouse',
        title: '1. Arrastra',
        description: 'Manten presionado el clic sobre la imagen y desliza para mover.',
    },
    {
        icon: 'eye',
        title: '2. Previsualiza',
        description: 'Verifica que el encuadre sea el ideal para tus clientes.',
    },
    {
        icon: 'cloud-change',
        title: '3. Confirma',
        description: 'Usa el botón inferior para aplicar los cambios permanentemente.',
    },
];

/** Sensibilidad del drag: px de movimiento real → 1% de offset */
const DRAG_SENSITIVITY = 2.5;

/** Offset Y por defecto cuando no hay valor guardado */
const DEFAULT_OFFSET = 50;

// ─────────────────────────────────────────────
// HOOK: useBannerDrag
// ─────────────────────────────────────────────

interface UseBannerDragReturn {
    offset: number;
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: () => void;
    syncOffset: (v: number) => void;
}

/**
 * Encapsula toda la lógica de arrastre para ajustar el objectPosition Y del banner.
 *
 * @param initialOffset - Valor inicial del offset (0–100). Default: 50.
 * @returns offset actual, estado isDragging y handler para onMouseDown.
 */
function useBannerDrag(initialOffset: number): UseBannerDragReturn {
    const [offset, setOffset]       = useState(initialOffset);
    const [isDragging, setIsDragging] = useState(false);

    // Ref para evitar closures stale dentro de los event listeners globales
    const dragRef = useRef({ startY: 0, startOffset: 0 });

    /** Sincroniza el offset cuando cambia el valor externo (ej. al abrir el modal) */
    const syncOffset = useCallback((value: number) => {
        setOffset(value);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        // Solo reaccionar al botón primario
        if (e.button !== 0) return;

        // Prevenir el drag nativo del navegador sobre imágenes
        e.preventDefault();

        setIsDragging(true);
        dragRef.current = { startY: e.clientY, startOffset: offset };

        const onMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (moveEvent: MouseEvent) => {
            // Fix: If mouse button is not held down, end dragging (solves the bug where it gets stuck dragging)
            if (moveEvent.buttons !== 1) {
                onMouseUp();
                return;
            }
            const deltaY   = (moveEvent.clientY - dragRef.current.startY) / DRAG_SENSITIVITY;
            const newOffset = Math.max(0, Math.min(100, dragRef.current.startOffset - deltaY));
            setOffset(newOffset);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [offset]);

    /** Handlers para dispositivos táctiles */
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        dragRef.current = { startY: touch.clientY, startOffset: offset };
    }, [offset]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const deltaY = (touch.clientY - dragRef.current.startY) / DRAG_SENSITIVITY;
        const newOffset = Math.max(0, Math.min(100, dragRef.current.startOffset - deltaY));
        setOffset(newOffset);
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    return { 
        offset, 
        isDragging, 
        handleMouseDown, 
        handleTouchStart, 
        handleTouchMove, 
        handleTouchEnd, 
        syncOffset 
    };
}

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────

/**
 * Renderiza las estrellas de calificación de una empresa.
 * Redondea el rating al entero más cercano para determinar estrellas llenas.
 */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
            <KeenIcon
                key={star}
                icon="star"
                className={`text-[10px] ${star <= Math.round(rating) ? 'fill-amber-400' : 'opacity-25'}`}
            />
        ))}
    </div>
);

/**
 * Una tarjeta de instrucción paso-a-paso del editor.
 */
const StepCard: React.FC<StepItem> = ({ icon, title, description }) => (
    <div className="flex items-center gap-4 dark:bg-white/[0.03] bg-white backdrop-blur-3xl p-5 rounded-3xl border dark:border-white/10 border-gray-200 group hover:dark:bg-white/[0.06] hover:bg-gray-50 transition-all shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
            <KeenIcon icon={icon} className="text-sm" />
        </div>
        <div>
            <p className="dark:text-white text-gray-900 font-black text-[10px] uppercase tracking-widest mb-0.5">
                {title}
            </p>
            <p className="dark:text-gray-400 text-gray-500 text-[11px] leading-tight font-medium">
                {description}
            </p>
        </div>
    </div>
);

/**
 * Tarjeta de información (ubicación, contacto, rating) en el pie del banner.
 */
const InfoCard: React.FC<{ icon: string; label: string; children: React.ReactNode }> = ({
    icon,
    label,
    children,
}) => (
    <div className="flex items-center gap-4 bg-gradient-to-b from-white/[0.12] to-white/[0.06] backdrop-blur-3xl rounded-[2rem] p-4 sm:p-5 border border-white/15 shadow-2xl">
        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-[inset_0_2px_rgba(255,255,255,0.2)]">
            <KeenIcon icon={icon} className="text-lg lg:text-xl" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[10px] font-black text-violet-300 uppercase tracking-widest mb-1">
                {label}
            </p>
            {children}
        </div>
    </div>
);

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

/**
 * Modal de edición del banner empresarial.
 *
 * Permite al usuario arrastrar la imagen del banner verticalmente para
 * seleccionar el encuadre ideal antes de guardarlo. Incluye una previsualización
 * fiel al perfil público de la empresa.
 *
 * @param show      - Controla la visibilidad del modal.
 * @param onClose   - Callback al cerrar sin guardar.
 * @param onSave    - Callback al confirmar; recibe el offset Y (0–100).
 * @param image     - URL de la imagen del banner.
 * @param logo      - URL del logo de la empresa.
 * @param formData  - Datos actuales del formulario de empresa.
 * @param tk        - Objeto de traducciones (pendiente de tipar).
 */
export const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
    show,
    onClose,
    onSave,
    image,
    logo,
    formData,
}) => {
    // Derivar el offset inicial desde formData con fallback seguro
    const resolvedInitialOffset =
        formData.bannerYOffset != null ? Number(formData.bannerYOffset) : DEFAULT_OFFSET;

    const { 
        offset, 
        isDragging, 
        handleMouseDown, 
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        syncOffset 
    } = useBannerDrag(resolvedInitialOffset);

    // Re-sincronizar el offset cada vez que el modal se abre o cambia el valor guardado
    useEffect(() => {
        if (show) {
            const value = formData.bannerYOffset != null
                ? Number(formData.bannerYOffset)
                : DEFAULT_OFFSET;
            syncOffset(value);
        }
    }, [show, formData.bannerYOffset, syncOffset]);

    // Montar condicionalmente DESPUÉS de los hooks (regla de hooks)
    if (!show) return null;

    const isColorBanner = formData.tipoBanner === 'color';
    const RATING        = 4.2; // TODO: obtener desde formData cuando esté disponible

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-start sm:items-center justify-center dark:bg-black/90 bg-black/40 backdrop-blur-sm p-2 sm:p-6 overflow-y-auto ${isDragging ? 'select-none' : ''}`}
        >
            {/* ── CONTENEDOR PRINCIPAL ── */}
            <div className="relative w-full max-w-[1450px] dark:bg-neutral-950 bg-[#F9F9FA] rounded-[2rem] sm:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border dark:border-white/5 border-gray-200 p-4 sm:p-8 lg:p-10 my-2 sm:my-auto">
                
                {/* ── HEADER ── */}
                <ModalHeader onClose={onClose} />

                {/* ── GUÍA DE PASOS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
                    {STEPS.map((step, idx) => (
                        <div key={step.title} className={idx === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}>
                            <StepCard {...step} />
                        </div>
                    ))}
                </div>

                {/* ── PREVIEW DEL BANNER ── */}
                <div className="w-full relative z-10">
                    <BannerPreview
                        image={image}
                        logo={logo}
                        formData={formData}
                        offset={offset}
                        isDragging={isDragging}
                        isColorBanner={isColorBanner}
                        rating={RATING}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                </div>

                {/* ── FOOTER DE ACCIONES ── */}
                <ModalFooter
                    onClose={onClose}
                    onSave={() => onSave(offset)}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// SUB-COMPONENTES INTERNOS DEL MODAL
// ─────────────────────────────────────────────

/** Cabecera del modal con título y botón de cierre */
const ModalHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 dark:bg-white/5 bg-white backdrop-blur-3xl p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border dark:border-white/10 border-gray-200 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-5 w-full md:w-auto">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
                <KeenIcon icon="picture" className="text-xl sm:text-3xl text-white" />
            </div>
            <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black dark:text-white text-gray-900 tracking-tight uppercase truncate">
                    Ajustar Vista
                </h2>
                <p className="dark:text-gray-400 text-gray-500 text-[8px] sm:text-[10px] font-black tracking-widest uppercase truncate">
                    Posición vertical del banner
                </p>
            </div>
        </div>

        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 sm:gap-4">
            <div className="bg-amber-500/10 border border-amber-500/30 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-2xl flex items-center gap-2 sm:gap-3">
                <KeenIcon icon="arrow-up-down" className="text-amber-500 animate-bounce text-xs sm:text-base" />
                <p className="dark:text-white text-gray-800 text-[8px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                    Modo Edición
                </p>
            </div>

            <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-2xl dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500 hover:bg-red-500/20 hover:text-red-500 transition-all border dark:border-white/5 border-gray-200 shrink-0"
            >
                <KeenIcon icon="cross" className="text-lg sm:text-2xl" />
            </button>
        </div>
    </div>
);

/** Pie de página con acciones Cancelar / Confirmar */
const ModalFooter: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => (
    <div className="flex flex-row items-center justify-end gap-3 mt-6 sm:mt-8">
        <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg dark:text-gray-400 text-gray-500 font-bold uppercase tracking-wider hover:dark:bg-white/10 hover:bg-gray-100 transition-all text-[10px]"
        >
            Cancelar
        </button>
        <button
            onClick={onSave}
            className="group px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-[10px]"
        >
            <KeenIcon icon="check" className="text-[10px] group-hover:scale-110 transition-transform" />
            Confirmar Ajuste
        </button>
    </div>
);

// ─────────────────────────────────────────────
// PREVIEW DEL BANNER
// ─────────────────────────────────────────────

interface BannerPreviewProps {
    image: string;
    logo: string;
    formData: EmpresaFormData;
    offset: number;
    isDragging: boolean;
    isColorBanner: boolean;
    rating: number;
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
}

/**
 * Sección de previsualización fiel al perfil empresarial público.
 * Contiene la imagen/color de fondo draggable y los datos de la empresa.
 */
const BannerPreview: React.FC<BannerPreviewProps> = ({
    image,
    logo,
    formData,
    offset,
    isDragging,
    isColorBanner,
    rating,
    onMouseDown,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
}) => {
    const dragCursorClass = isDragging
        ? 'cursor-grabbing brightness-110 scale-[1.01] transition-all'
        : 'cursor-grab hover:brightness-105 transition-all';

    return (
        <div className="relative rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden bg-neutral-900 border border-white/10 shadow-[0_30px_80px_rgba(107,63,228,0.25)] z-10">

            {/* ── IMAGEN / COLOR DRAGGABLE ── */}
            <div
                className={`relative w-full aspect-[4/3] sm:aspect-[16/6] lg:aspect-[16/5] overflow-hidden select-none touch-none ${dragCursorClass}`}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {isColorBanner ? (
                    <div
                        className="w-full h-full"
                        style={{ backgroundColor: formData.colorBanner || '#8b5cf6' }}
                    />
                ) : (
                    <img
                        src={image}
                        alt="Banner de la empresa"
                        draggable={false}
                        className="object-cover w-full h-full"
                        style={{ objectPosition: `center ${offset}%` }}
                    />
                )}

                {/* Overlays de gradiente */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E0F7C]/75 via-[#1E0F7C]/35 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-900/95 pointer-events-none" />

                {/* Tooltip de ayuda: solo visible en hover cuando NO se está arrastrando */}
                {!isDragging && !isColorBanner && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 animate-pulse shadow-2xl">
                            <KeenIcon icon="mouse" className="text-white text-xl" />
                            <span className="text-white font-black text-[10px] uppercase tracking-widest">
                                Manten presionado para mover
                            </span>
                        </div>
                    </div>
                )}

                {/* Información de la empresa sobre el banner */}
                <BannerOverlayContent logo={logo} formData={formData} rating={rating} />
            </div>

            {/* ── SECCIÓN DE DATOS ── */}
            <BannerInfoSection formData={formData} rating={rating} />
        </div>
    );
};

/** Contenido superpuesto sobre la imagen: logo, nombre, rating, badge */
const BannerOverlayContent: React.FC<{
    logo: string;
    formData: EmpresaFormData;
    rating: number;
}> = ({ logo, formData, rating }) => (
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 pointer-events-none">
        <div className="flex items-end gap-3 sm:gap-6">
            {/* Logo */}
            <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl sm:rounded-3xl bg-violet-600/30 backdrop-blur-3xl p-1 sm:p-1.5 border-2 border-white/40 shadow-2xl overflow-hidden">
                <img
                    src={logo}
                    alt="Logo de la empresa"
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                />
            </div>

            {/* Nombre + badges */}
            <div className="flex-1 min-w-0 pb-1 sm:pb-0">
                <div className="inline-flex items-center gap-2 py-1 px-2.5 sm:px-3.5 rounded-full bg-violet-500/30 border border-violet-400/30 backdrop-blur-md text-violet-200 font-bold text-[8px] sm:text-[10px] tracking-widest uppercase mb-1 sm:mb-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-400 animate-pulse shrink-0" />
                    Perfil Empresarial
                </div>

                <h1 className="text-xl sm:text-4xl lg:text-6xl font-black text-white leading-tight tracking-tight line-clamp-2">
                    {formData.razonSocial || 'Tu Empresa'}
                </h1>

                <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <div className="flex items-center gap-2">
                        <StarRating rating={rating} />
                        <span className="text-[10px] sm:text-xs font-black text-white/90">{rating}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-[8px] sm:text-[9px] font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-xl shadow-violet-600/20">
                        <KeenIcon icon="verify" className="text-[8px] sm:text-[10px]" />
                        Verificado
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/** Sección debajo de la imagen: categoría, slogan y tarjetas de info */
const BannerInfoSection: React.FC<{ formData: EmpresaFormData; rating: number }> = ({
    formData,
    rating,
}) => (
    <div className="px-5 sm:px-8 lg:px-12 py-6 sm:py-10 pointer-events-none">
        {/* Categoría */}
        <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-6">
            <span className="text-[9px] sm:text-[11px] font-black text-white bg-violet-600/40 backdrop-blur-3xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/20 uppercase tracking-widest whitespace-nowrap shadow-lg">
                <KeenIcon icon="category" className="mr-2 text-[9px] sm:text-[10px]" />
                Tecnología y Electrónica
            </span>
        </div>

        {/* Slogan */}
        <p className="text-xs sm:text-lg text-white/75 italic mb-6 sm:mb-8 leading-relaxed line-clamp-2 max-w-4xl">
            "{formData.slogan || 'Plataforma integral de gestión empresarial.'}"
        </p>

        {/* Tarjetas de información */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <InfoCard icon="geolocation" label="Ubicación">
                <p className="text-sm font-bold text-white leading-tight truncate">
                    {formData.direccion || 'La Paz Calle #72'}
                </p>
            </InfoCard>

            <InfoCard icon="paper-plane" label="Contacto">
                <p className="text-sm font-black text-white leading-tight truncate">
                    {formData.telefono || '7453405'}
                </p>
            </InfoCard>

            <InfoCard icon="star" label="Rating">
                <div className="flex items-center gap-2.5">
                    <span className="text-xl lg:text-2xl font-black text-white leading-none">
                        {rating}
                    </span>
                    <StarRating rating={rating} />
                </div>
            </InfoCard>
        </div>
    </div>
);