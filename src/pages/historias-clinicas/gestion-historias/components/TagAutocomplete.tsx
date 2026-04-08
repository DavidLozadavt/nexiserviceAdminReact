import React, { useState, useRef, useEffect } from 'react';

interface TagAutocompleteProps {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: { codigo: string; nombre: string }[];
  placeholder?: string;
  required?: boolean;
  colorScheme?: 'primary' | 'success' | 'info' | 'warning';
  // Nuevas props para modo multi-input
  multiInputMode?: boolean;
  inputFields?: Array<{
    name: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    columns?: number; // Columnas en el grid (de 12)
  }>;
  onAddMultiInput?: () => void;
}

export const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  label,
  name,
  value,
  onChange,
  suggestions = [],
  placeholder,
  required = false,
  colorScheme = 'primary',
  multiInputMode = false,
  inputFields = [],
  onAddMultiInput
}) => {
  const [input, setInput] = useState('');
  const [filtered, setFiltered] = useState<{ codigo: string; nombre: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.length > 0 && suggestions.length > 0) {
      setFiltered(
        suggestions.filter(
          s =>
            s.codigo.toLowerCase().includes(val.toLowerCase()) ||
            s.nombre.toLowerCase().includes(val.toLowerCase())
        )
      );
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  const handleAdd = (item: string) => {
    if (item && !value.includes(item)) {
      onChange([...value, item]);
    }
    setInput('');
    setFiltered([]);
    setShowDropdown(false);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      handleAdd(input.trim());
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      handleRemove(value.length - 1);
    }
  };

  const allFieldsFilled = multiInputMode 
    ? inputFields.every(field => field.value && field.value.trim() !== '')
    : false;

  const getColorClasses = () => {
    const schemes = {
      primary: {
        tag: 'bg-white border border-primary-light text-primary',
        tagIcon: 'text-primary',
        dropdown: 'hover:bg-primary-light',
        code: 'text-primary'
      },
      success: {
        tag: 'bg-white border border-success-light text-success',
        tagIcon: 'text-success',
        dropdown: 'hover:bg-success-light',
        code: 'text-success'
      },
      info: {
        tag: 'bg-white border border-info-light text-info',
        tagIcon: 'text-info',
        dropdown: 'hover:bg-info-light',
        code: 'text-info'
      },
      warning: {
        tag: 'bg-white border border-warning-light text-warning',
        tagIcon: 'text-warning',
        dropdown: 'hover:bg-warning-light',
        code: 'text-warning'
      }
    };
    return schemes[colorScheme];
  };

  const colors = getColorClasses();

  return (
    <div className="space-y-3">
      <label className="block text-2sm font-semibold text-gray-900">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, idx) => (
            <span 
              key={idx} 
              className={`inline-flex items-center gap-1.5 ${colors.tag} rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow transition-shadow`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3.5 w-3.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-800">{tag}</span>
              <button
                type="button"
                className="ml-1 text-gray-500 hover:text-danger transition-colors"
                onClick={() => handleRemove(idx)}
                title="Eliminar"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3.5 w-3.5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {multiInputMode ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {inputFields.map((field, idx) => (
              <input
                key={field.name}
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className={`input md:col-span-${field.columns || 4} border border-gray-300 rounded-lg px-3.5 py-2.5 text-2sm placeholder:text-gray-500 bg-white focus:border-primary focus:ring-1 focus:ring-primary-clarity transition-colors hover:border-gray-400`}
              />
            ))}
            <button
              type="button"
              className={`btn md:col-span-1 bg-${colorScheme} hover:bg-${colorScheme}-active text-white rounded-lg flex items-center justify-center px-2 py-2.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Agregar"
              onClick={onAddMultiInput}
              disabled={!allFieldsFilled}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Completa todos los campos y presiona el botón <span className={`text-${colorScheme} font-semibold`}>+</span> para agregar
          </p>
        </div>
      ) : (
        <div>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              name={name}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => input.length > 0 && setShowDropdown(true)}
              placeholder={placeholder}
              className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
            />
            
            {showDropdown && filtered.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto"
              >
                {filtered.map((s, idx) => (
                  <div
                    key={s.codigo + idx}
                    className={`px-4 py-2.5 cursor-pointer text-2sm transition-colors ${colors.dropdown} border-b border-gray-100 last:border-b-0`}
                    onClick={() => handleAdd(`${s.codigo} - ${s.nombre}`)}
                  >
                    <span className={`font-mono font-semibold ${colors.code}`}>{s.codigo}</span>
                    <span className="text-gray-600"> - {s.nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};