import React from 'react';

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  required?: boolean;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3
}) => {
  return (
    <div>
      <label className="text-2sm font-semibold text-gray-900 mb-2.5 flex items-center gap-2">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input input-lg w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary-clarity transition-all duration-200 min-h-24 resize-none text-2sm placeholder:text-gray-400"
        rows={rows}
        required={required}
      />
    </div>
  );
};