import React from 'react';
import { KeenIcon } from '../keenicons';
import { useSettings } from '@/providers';

interface FloatingSaveBarProps {
  show: boolean;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  label?: string;
  description?: string;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

const FloatingSaveBar: React.FC<FloatingSaveBarProps> = ({
  show,
  onSave,
  onCancel,
  label = 'Tienes cambios sin guardar',
  description = 'Presiona guardar para aplicar los cambios',
  saveLabel = 'Guardar Cambios',
  cancelLabel = 'Descartar',
  isLoading = false
}) => {
  const { getThemeMode } = useSettings();
  const isDarkMode = getThemeMode() === 'dark';

  // Estilos dinámicos basados en el modo oscuro
  const styles = {
    container: isDarkMode 
      ? 'bg-[#111113]/90 border-[rgba(255,255,255,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]' 
      : 'bg-white/90 border-[rgba(0,0,0,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.15)]',
    text: isDarkMode ? 'text-[#e4e4e7]' : 'text-[#18181b]',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    divider: isDarkMode ? 'bg-white/10' : 'bg-gray-200',
  };

  return (
    <div 
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${
        show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div 
        className={`flex items-center gap-6 px-6 py-4 rounded-[2rem] border backdrop-blur-xl transition-colors duration-300 ${styles.container}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <KeenIcon icon="disk" className="text-xl" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-sm leading-none mb-1 ${styles.text}`}>
              {label}
            </span>
            <span className={`text-[10px] ${styles.textSecondary}`}>
              {description}
            </span>
          </div>
        </div>

        <div className={`h-10 w-[1px] ${styles.divider}`} />

        <div className="flex gap-2">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 disabled:opacity-50 ${styles.textSecondary}`}
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onSave}
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export { FloatingSaveBar };
