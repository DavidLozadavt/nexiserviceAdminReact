// types.ts (o dentro del componente principal si no tienes un archivo de tipos)

import React from 'react';

// Tipos base para componentes reutilizables
export interface InputFieldProps {
    label: string; 
    name: string; 
    value: string | number; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string; 
    readOnly?: boolean; 
    placeholder?: string; 
    isTextArea?: boolean; // Nuevo para manejar textarea
}

export interface CheckboxFieldProps {
    label: string; 
    name: string; 
    checked: number; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Tipos Wompi
export interface WompiAPIResponse { // <<< ¡Asegúrate de que 'export' esté aquí!
    id: number;
    company_id: number;
    publicKeyProd: string;
    privateKeyProd: string;
    prodEvents: string;
    prodIntegrity: string;
}
export interface WompiKeysData {
    publicKeyProd: string;
    privateKeyProd: string;
    prodEvents: string;
    prodIntegrity: string;
}

// Tipos Empresa
export interface EmpresaData {
    // ... todas tus propiedades de empresa
    razonSocial: string; nit: string; digitoVerificacion: string | number; email: string; direccion: string; telefono: string;
    representanteLegal: string; devolucion: string | number; garantia: string | number; valorIva: string | number;
    responsableIva: number; retenciones: number; facturacionElectronica: number; rutaLogoUrl: string; rutaPortadaUrl: string;
    facebookUrl: string; instagramUrl: string; whatsappNumber: string; tiktokUrl: string; acercaDeNosotros: string; slogan: string;
    servicios: number; catalogo: number; productos: number;
}
export type EmpresaFormData = Omit<EmpresaData, 'rutaLogoUrl' | 'rutaPortadaUrl'> & { [key: string]: any };

// Tipo Banner
export interface BannerCompanyModel {
    id: number | null;
    descripcion: string;
    rutaBannerUrl?: string;
    urlBannerUrl?: string | null;
}