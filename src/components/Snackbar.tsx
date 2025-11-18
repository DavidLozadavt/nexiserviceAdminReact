import React from 'react';

interface SnackbarProps {
  message: string;
  type?: 'error' | 'success' | 'info' | 'warning';
  onClose: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({ message, type = 'info', onClose }) => {
  const color = {
    error: 'bg-red-600',
    success: 'bg-green-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-500',
  }[type];

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 ${color}`}
         role="alert">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white font-bold">&times;</button>
    </div>
  );
};
