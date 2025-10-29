import React from 'react';

interface FormActionsProps {
  isEdit: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ isEdit, onCancel }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-gray-200">
      <button 
        type="button" 
        onClick={onCancel}
        className="btn btn-lg px-6 py-2.5 border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200 font-medium shadow-light hover:shadow-default"
      >
        Cancelar
      </button>
      <button 
        type="submit"
        className="btn btn-lg px-6 py-2.5 bg-gradient-to-r from-primary to-primary-active hover:from-primary-active hover:to-primary text-white rounded-lg transition-all duration-200 font-medium shadow-primary hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <svg className="w-4 h-4 inline-block mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {isEdit ? 'Actualizar Historia' : 'Guardar Historia'}
      </button>
    </div>
  );
};