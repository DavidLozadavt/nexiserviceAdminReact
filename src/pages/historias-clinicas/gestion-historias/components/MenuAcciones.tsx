import React, { useState } from 'react';

interface MenuAccionesProps {
  historiaId: string;
  onEditar: () => void;
  onAdjuntar: (file: File) => void;
  onRegistrarEvolucion: () => void;
  onExportar: () => void;
}

const MenuAcciones: React.FC<MenuAccionesProps & { onExportarTratamiento?: () => void }> = ({ historiaId, onEditar, onAdjuntar, onRegistrarEvolucion, onExportar, onExportarTratamiento }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleToggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleMenu}
        className="flex items-center px-4 py-2 font-medium transition-all duration-200 rounded-lg btn btn-sm bg-primary hover:bg-primary-active text-primary-inverse text-2xs"
      >
        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Acciones
        <svg className={`w-4 h-4 ml-1.5 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`absolute right-0 mt-2 w-56 bg-light dark:bg-coal-600 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 ${menuAbierto ? 'block' : 'hidden'}`}>
        <button
          onClick={() => {
            if (onExportarTratamiento) onExportarTratamiento();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-success hover:bg-light-active dark:hover:bg-coal-500 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tratamiento PDF
        </button>
        <button
          onClick={() => {
            onExportar();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-light-active dark:hover:bg-coal-500 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Exportar PDF
        </button>
        <button
          onClick={() => {
            onEditar();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-light-active dark:hover:bg-coal-500 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar Historia
        </button>

        <button
          onClick={() => {
            fileInputRef.current?.click();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-light-active dark:hover:bg-coal-500 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          Adjuntar Archivo
        </button>

        <button
          onClick={() => {
            onRegistrarEvolucion();
            setMenuAbierto(false);
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-light-active dark:hover:bg-coal-500 flex items-center transition-colors"
        >
          <svg className="w-4 h-4 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Registrar Evolución
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onAdjuntar(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default MenuAcciones;