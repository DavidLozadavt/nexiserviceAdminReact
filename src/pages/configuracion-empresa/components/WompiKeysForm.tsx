// WompiKeysForm.tsx
import React from 'react';
// Asegúrate de que la ruta a types sea correcta
import { InputFieldProps, WompiKeysData } from '../types'; 

// 1. Definimos la interfaz LocalInputFieldProps correctamente
interface LocalInputFieldProps extends Omit<InputFieldProps, 'isTextArea' | 'onChange'> {
    // Sobrescribimos 'onChange' para restringirlo solo a HTMLInputElement.
    // Esto es válido para los campos de Wompi.
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Helper Component para evitar redefiniciones
const InputField: React.FC<LocalInputFieldProps> = ({ 
    label, name, value, onChange, type = 'text', readOnly = false, placeholder = '' 
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 form-label dark:text-gray-300">{label}</label>
        <input
            type={type}
            name={name}
            className="w-full p-2 border border-gray-300 rounded-md input form-control focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            value={value || ''}
            // TypeScript ahora sabe que onChange solo acepta ChangeEvent<HTMLInputElement>
            onChange={onChange} 
            readOnly={readOnly}
            placeholder={placeholder}
        />
    </div>
);


interface WompiKeysFormProps {
    wompiKeys: WompiKeysData;
    // La función que viene del padre debe coincidir con el handler general
    handleWompiKeysChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    handleWompiKeysSubmit: (e: React.FormEvent) => Promise<void>;
}

export const WompiKeysForm: React.FC<WompiKeysFormProps> = ({
    wompiKeys,
    handleWompiKeysChange,
    handleWompiKeysSubmit,
}) => {
    return (
        <div className="p-5 border border-gray-200 rounded-lg shadow-sm card dark:border-gray-700 dark:bg-gray-800">
            {/* ... Resto del componente WompiKeysForm ... */}
            <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
                <h4 className="text-xl font-semibold dark:text-white">Asignar llaves secretas de Wompi</h4>
            </div>
            
            <form onSubmit={handleWompiKeysSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <InputField 
                        label="Llave pública (publicKeyProd)" 
                        name="publicKeyProd" 
                        value={wompiKeys.publicKeyProd} 
                        onChange={handleWompiKeysChange}
                        placeholder="Escribe la llave pública" 
                    />
                    {/* ... otros InputField ... */}
                    <InputField 
                        label="Llave privada (privateKeyProd)" 
                        name="privateKeyProd" 
                        value={wompiKeys.privateKeyProd} 
                        onChange={handleWompiKeysChange}
                        placeholder="Escribe la llave privada" 
                    />
                    <InputField 
                        label="Llave de eventos (prodEvents)" 
                        name="prodEvents" 
                        value={wompiKeys.prodEvents} 
                        onChange={handleWompiKeysChange}
                        placeholder="Escribe la llave de eventos" 
                    />
                    <InputField 
                        label="Llave de integridad (prodIntegrity)" 
                        name="prodIntegrity" 
                        value={wompiKeys.prodIntegrity} 
                        onChange={handleWompiKeysChange}
                        placeholder="Escribe la llave de integridad" 
                    />
                </div>
                
                <div className="flex justify-center pt-4">
                     <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg btn btn-primary hover:bg-blue-700">
                         Guardar Llaves
                    </button>
                </div>
            </form>
        </div>
    );
};