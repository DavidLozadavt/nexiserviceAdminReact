import React from 'react';
import { WompiKeysData } from '../types';
import { KeenIcon } from '@/components';

interface WompiKeysFormProps {
    wompiKeys: WompiKeysData;
    handleWompiKeysChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleWompiKeysSubmit: (e: React.FormEvent) => Promise<void>;
    tk: any;
}

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tk: any; placeholder?: string }> = ({
    label, name, value, onChange, tk, placeholder = ''
}) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: tk.txt3 }}>{label}</label>
        <input
            type="text"
            name={name}
            className="w-full px-3 py-2.5 md:px-4 md:py-3 text-sm font-medium rounded-xl md:rounded-2xl border transition-all focus:ring-2 focus:ring-blue-500/20"
            style={{ background: tk.surf2, borderColor: tk.brd, color: tk.txt }}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
        />
    </div>
);

export const WompiKeysForm: React.FC<WompiKeysFormProps> = ({
    wompiKeys,
    handleWompiKeysChange,
    handleWompiKeysSubmit,
    tk
}) => {
    return (
        <div className="nx-in overflow-hidden rounded-3xl md:rounded-[2.5rem] border" style={{ background: tk.surf, borderColor: tk.brd, animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 md:gap-4 p-4 md:p-8 pb-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <KeenIcon icon="wallet" className="text-xl md:text-2xl" />
                </div>
                <div>
                    <h4 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: tk.txt }}>Pasarela Wompi</h4>
                    <p className="text-xs md:text-sm" style={{ color: tk.txt2 }}>Configura tus llaves de producción para recibir pagos</p>
                </div>
            </div>

            <form onSubmit={handleWompiKeysSubmit} className="p-4 md:p-8 space-y-4 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <InputField
                        label="Llave pública"
                        name="publicKeyProd"
                        value={wompiKeys.publicKeyProd}
                        onChange={handleWompiKeysChange}
                        tk={tk}
                        placeholder="Escribe la llave pública..."
                    />
                    <InputField
                        label="Llave privada"
                        name="privateKeyProd"
                        value={wompiKeys.privateKeyProd}
                        onChange={handleWompiKeysChange}
                        tk={tk}
                        placeholder="Escribe la llave privada..."
                    />
                    <InputField
                        label="Llave de eventos"
                        name="prodEvents"
                        value={wompiKeys.prodEvents}
                        onChange={handleWompiKeysChange}
                        tk={tk}
                        placeholder="Escribe la llave de eventos..."
                    />
                    <InputField
                        label="Llave de integridad"
                        name="prodIntegrity"
                        value={wompiKeys.prodIntegrity}
                        onChange={handleWompiKeysChange}
                        tk={tk}
                        placeholder="Escribe la llave de integridad..."
                    />
                </div>
            </form>

            <div className="mx-4 md:mx-8 mb-4 md:mb-8 p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <KeenIcon icon="information-2" className="text-xl text-blue-500" />
                </div>
                <div>
                    <h5 className="font-bold text-blue-500 mb-1">¿Dónde encuentro estas llaves?</h5>
                    <p className="text-xs md:text-sm text-blue-500/80 leading-relaxed">
                        Puedes encontrar estas credenciales en tu panel de Wompi, sección **Configuración &gt; Llaves de la cuenta**. 
                        Asegúrate de copiar las llaves de **Producción** para que los pagos funcionen correctamente.
                    </p>
                </div>
            </div>
        </div>
    );
};