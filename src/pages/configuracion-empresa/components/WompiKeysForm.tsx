import React from 'react';
import { InputFieldProps, WompiKeysData } from '../types';

interface LocalInputFieldProps extends Omit<InputFieldProps, 'isTextArea' | 'onChange'> {
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
            className="w-full p-2 text-gray-800 border border-gray-200 rounded-md input form-control bg-light-DEFAULT focus:border-blue-500 dark:bg-dark-DEFAULT dark:text-gray-700 dark:border-dark-DEFAULT"
            value={value || ''}
            onChange={onChange}
            readOnly={readOnly}
            placeholder={placeholder}
        />
    </div>
);


interface WompiKeysFormProps {
    wompiKeys: WompiKeysData;
    handleWompiKeysChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleWompiKeysSubmit: (e: React.FormEvent) => Promise<void>;
}

export const WompiKeysForm: React.FC<WompiKeysFormProps> = ({
    wompiKeys,
    handleWompiKeysChange,
    handleWompiKeysSubmit,
}) => {
    return (
        <div className="p-6 space-y-6 border border-gray-200 rounded-lg card shadow-default bg-light-DEFAULT dark:bg-dark-DEFAULT dark:border-dark-DEFAULT">
            <div className="pb-4 mb-4 border-b card-header dark:border-gray-700">
                <h4 className="w-screen -ml-6 text-xl font-semibold text-gray-800 bg-blue-200 md:text-1xl dark:text-gray-900 dark:bg-transparent">
                    🔑 Asignar llaves secretas de Wompi
                </h4>
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

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <button type="submit" className="p-3 font-semibold text-white transition-colors bg-blue-400 rounded-lg btn btn-primary hover:bg-blue-700">
                        Guardar Llaves
                    </button>
                </div>
            </form>
        </div>
    );
};