
import React, { useEffect, useState } from 'react';
import { KeenIcon } from '@/components';

const NgxSpinner: React.FC<{ loading: boolean }> = ({ loading }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (loading) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    if (!show) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300 backdrop-blur-sm bg-black/40 ${loading ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl scale-in-center">
                <div className="relative flex items-center justify-center w-20 h-20">
                    <div className="absolute inset-0 border-4 rounded-full border-blue-500/20" />
                    <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
                    <KeenIcon icon="setting-3" className="text-3xl text-white animate-pulse" />
                </div>
                <span className="text-sm font-bold tracking-widest text-white uppercase animate-pulse">Nexi Loading...</span>
            </div>
            <style>{`
                @keyframes scale-in-center { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .scale-in-center { animation: scale-in-center 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
            `}</style>
        </div>
    );
};

const CustomModal: React.FC<{ title?: string; show: boolean; children: React.ReactNode; onClose: () => void; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ title, show, children, onClose, size = 'lg' }) => {
    const [render, setRender] = useState(false);

    useEffect(() => {
        if (show) {
            setRender(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setRender(false);
                document.body.style.overflow = '';
            }, 300);
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = '';
            };
        }
    }, [show]);

    if (!render) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl'
    };

    return (
        <div 
            className={`fixed inset-0 z-[90] flex items-center justify-center p-4 transition-all duration-300 backdrop-blur-md bg-black/60 ${show ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div 
                className={`w-full ${sizeClasses[size]} overflow-hidden transition-all duration-300 scale-in-center rounded-[2.5rem] border shadow-2xl bg-white dark:bg-[#111113] dark:border-white/5 ${show ? 'scale-100' : 'scale-95'}`}
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between p-8 pb-0">
                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
                        <button 
                            onClick={onClose} 
                            className="flex items-center justify-center w-10 h-10 transition-all rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 dark:text-gray-400"
                        >
                            <KeenIcon icon="cross" className="text-xl" />
                        </button>
                    </div>
                )}
                <div className="relative">
                    {children}
                </div>
            </div>
        </div>
    );
};

export { NgxSpinner, CustomModal };