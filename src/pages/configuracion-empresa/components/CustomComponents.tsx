
import React from 'react';

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
            {/* Modal Content - dark:bg-gray-900 para el fondo del modal */}
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

export { NgxSpinner, CustomModal };