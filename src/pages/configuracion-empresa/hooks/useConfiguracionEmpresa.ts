import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { enqueueSnackbar } from 'notistack';
import { useAuthContext } from '@/auth';

import { EmpresaFormData, WompiKeysData, BannerCompanyModel, WompiAPIResponse } from '../types';

const INITIAL_FORM_DATA: EmpresaFormData = {
  razonSocial: '',
  nit: '',
  digitoVerificacion: '',
  email: '',
  direccion: '',
  telefono: '',
  representanteLegal: '',
  devolucion: '',
  garantia: '',
  valorIva: '',
  responsableIva: 0,
  retenciones: 0,
  facturacionElectronica: 0,
  facebookUrl: '',
  instagramUrl: '',
  whatsappNumber: '',
  tiktokUrl: '',
  acercaDeNosotros: '',
  slogan: '',
  servicios: 0,
  catalogo: 0,
  productos: 0,
  cobrarPorcentajeReserva: 0,
  porcentajeReserva: '',
  idCategoriaEmpresa: 0,
  colorPrimary: '#3b82f6', // default blue
  colorSecondary: '#1d4ed8', 
  youtubeUrl: '',
  reelsUrls: []
};

export const useConfiguracionEmpresa = () => {
  const { empresa } = useAuthContext();
  const [pageLoading, setPageLoading] = useState(false);

  // --- ESTADOS ---
  const [formData, setFormData] = useState<EmpresaFormData>(INITIAL_FORM_DATA);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState('');
  const [portadaFile, setPortadaFile] = useState<File | null>(null);

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<BannerCompanyModel | null>(null);
  const [showFacturacionModal, setShowFacturacionModal] = useState(false);
  const [pendingFacturacionValue, setPendingFacturacionValue] = useState<number>(0);

  const queryClient = useQueryClient();
  const isEmpresaLoaded = !!empresa;

  // --- LÓGICA DE WOMPI (FETCH CON REACT QUERY) ---
  const { data: configData, isLoading: isLoadingWompi } = useQuery(
    ['wompiConfig', empresa?.id],
    async () => {
      const response = await axios.get<WompiAPIResponse>(`get_configuration_by_id_company`);
      return response.data;
    },
    {
      enabled: !!empresa?.id,
      staleTime: 600000, // 10 minutos de caché
      onError: () => {
        // En lugar de snackbar, solo reseteamos si falla
      }
    }
  );

  const [wompiKeys, setWompiKeys] = useState<WompiKeysData>({
    publicKeyProd: '',
    privateKeyProd: '',
    prodEvents: '',
    prodIntegrity: ''
  });

  // Sincronizar llaves de Wompi cuando cargan
  useEffect(() => {
    if (configData) {
      setWompiKeys({
        publicKeyProd: configData.publicKeyProd || '',
        privateKeyProd: configData.privateKeyProd || '',
        prodEvents: configData.prodEvents || '',
        prodIntegrity: configData.prodIntegrity || ''
      });
    }
  }, [configData]);

  // --- LÓGICA DE BANNERS (FETCH CON REACT QUERY) ---
  const { data: banners = [], isLoading: isLoadingBanners, refetch: refetchBanners } = useQuery(
    ['banners', empresa?.id],
    async () => {
      const response = await axios.get<BannerCompanyModel[]>(`banners_company`);
      return response.data;
    },
    {
      enabled: !!empresa?.id,
      staleTime: 300000 // 5 minutos de caché
    }
  );

  // --- LÓGICA DE WOMPI (SUBMIT) ---
  const handleWompiKeysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa?.id) {
      enqueueSnackbar('ID de empresa no disponible.', { variant: 'error' });
      return;
    }
    setPageLoading(true);
    try {
      await axios.post('update_or_create_credentials_wompi_by_id', {
        company_id: empresa.id,
        ...wompiKeys
      });
      enqueueSnackbar('Llaves de Wompi actualizadas correctamente.', { variant: 'success' });
      queryClient.invalidateQueries(['wompiConfig', empresa?.id]);
    } catch (error) {
      enqueueSnackbar('Error de conexión con el servidor.', { variant: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  // --- HANDLERS Y LÓGICA DE FACTURACIÓN ELECTRÓNICA ---
  const updateFacturacionElectronica = useCallback(async (newValue: number) => {
    // ... Lógica de updateFacturacionElectronica
    setPageLoading(true);
    const booleanValue = newValue === 1;
    try {
      await axios.post('update_electronic_invoice', { facturaElectronica: booleanValue });
      setFormData((prev) => ({ ...prev, facturacionElectronica: newValue }));
      enqueueSnackbar('Estado de Facturación Electrónica actualizado.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al actualizar Facturación Electrónica.', { variant: 'error' });
    } finally {
      setPageLoading(false);
    }
  }, []);

  const confirmFacturacionChange = async (confirm: boolean) => {
    // ... Lógica de confirmFacturacionChange
    setShowFacturacionModal(false);
    if (confirm) {
      await updateFacturacionElectronica(pendingFacturacionValue);
    } else {
      setFormData((prev) => ({ ...prev, facturacionElectronica: prev.facturacionElectronica }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    // ... Lógica de handleChange
    const { name, value, type } = e.target;
    const checkedValue = (e.target as HTMLInputElement).checked ? 1 : 0;
    const newValue = type === 'checkbox' ? checkedValue : value;

    if (type === 'checkbox' && name === 'facturacionElectronica') {
      if (checkedValue !== formData.facturacionElectronica) {
        setPendingFacturacionValue(checkedValue);
        setShowFacturacionModal(true);

        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleWompiKeysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... Lógica de handleWompiKeysChange
    const { name, value } = e.target;
    setWompiKeys((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS Y LÓGICA DE BANNERS ---
  const openModalBanner = (banner: BannerCompanyModel | null = null) => {
    setBannerToEdit(banner);
    setShowBannerModal(true);
  };

  const resetBannerModal = () => {
    setShowBannerModal(false);
    setBannerToEdit(null);
  };

  const guardarBanner = useCallback(
    (data: { bannerData: BannerCompanyModel; file: File | null }) => {
      // ... Lógica de guardarBanner
      const { bannerData, file } = data;

      (async () => {
        setPageLoading(true);
        const isNew = !bannerData.id;

        if (isNew && !file) {
          enqueueSnackbar('Debe seleccionar una imagen para un banner nuevo.', {
            variant: 'warning'
          });
          setPageLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('descripcion', bannerData.descripcion);
        let endpoint = isNew ? `store_banner` : `update_banner/${bannerData.id}`;
        if (file) {
          formData.append('rutaBannerFile', file, file.name);
        }
        try {
          await axios.post(endpoint, formData);
          await refetchBanners();
          enqueueSnackbar(`Banner ${isNew ? 'creado' : 'actualizado'} con éxito.`, {
            variant: 'success'
          });
          resetBannerModal();
        } catch (error) {
          console.error('Error al guardar banner:', error);
          enqueueSnackbar(
            `Error al guardar: ${axios.isAxiosError(error) ? error.message : (error as Error).message}`,
            { variant: 'error' }
          );
        } finally {
          setPageLoading(false);
        }
      })();
    },
    [refetchBanners]
  );

  const eliminarBanner = async (id: number | null) => {
    // ... Lógica de eliminarBanner
    if (!id) return;
    setPageLoading(true);
    try {
      await axios.delete(`delete_banner/${id}`);
      await refetchBanners();
      enqueueSnackbar('Banner eliminado con éxito.', { variant: 'success' });
    } catch (error) {
      console.error('Error al eliminar banner:', error);
      enqueueSnackbar('Error al eliminar el banner.', { variant: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isPortada: boolean = false) => {
    // ... Lógica de handleFileChange
    const file = e.target.files?.[0] || null;
    if (isPortada) {
      setPortadaFile(file);
      if (file) {
        setPortadaPreview(URL.createObjectURL(file));
      }
    } else {
      setLogoFile(file);
      if (file) {
        setLogoPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // ... Lógica de handleSubmit
    e.preventDefault();
    setPageLoading(true);
    try {
      const dataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== 'servicios' &&
          key !== 'catalogo' &&
          key !== 'productos' &&
          key !== 'facturacionElectronica'
        ) {
          dataToSend.append(key, value !== null && value !== undefined ? String(value) : '');
        }
      });

      const itemsEmpresaArray: string[] = [];
      if (formData.servicios === 1) itemsEmpresaArray.push('servicios');
      if (formData.catalogo === 1) itemsEmpresaArray.push('catalogo');
      if (formData.productos === 1) itemsEmpresaArray.push('productos');
      dataToSend.append('itemsEmpresa', JSON.stringify(itemsEmpresaArray));

      if (formData.reelsUrls && Array.isArray(formData.reelsUrls)) {
        dataToSend.append('reelsUrls', JSON.stringify(formData.reelsUrls));
      } else if (typeof formData.reelsUrls === 'string') {
        // If it was edited as a comma separated string
        dataToSend.append('reelsUrls', JSON.stringify((formData.reelsUrls as string).split(',').map(u => u.trim()).filter(u => u)));
      }

      if (logoFile) {
        dataToSend.append('rutaLogoFile', logoFile);
      }
      if (portadaFile) {
        dataToSend.append('rutaPortadaFile', portadaFile);
      }

      await axios.post(`company_update`, dataToSend);
      enqueueSnackbar('Datos actualizados correctamente', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al actualizar la empresa', { variant: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  // --- EFECTO DE MONTAJE: CARGA DE DATOS ---
  useEffect(() => {
    if (empresa) {
      setFormData({
        razonSocial: empresa.razonSocial || '',
        nit: empresa.nit || '',
        digitoVerificacion: empresa.digitoVerificacion || '',
        email: empresa.email || '',
        direccion: empresa.direccion || '',
        telefono: empresa.telefono || '',
        representanteLegal: empresa.representanteLegal || '',
        devolucion: empresa.devolucion || '',
        garantia: empresa.garantia || '',
        valorIva: empresa.valorIva || '',
        responsableIva: empresa.responsableIva || 0,
        retenciones: empresa.retenciones || 0,
        facturacionElectronica: Number(empresa.facturaElectronica) || 0,
        facebookUrl: empresa.facebookUrl || '',
        instagramUrl: empresa.instagramUrl || '',
        whatsappNumber: empresa.whatsappNumber || '',
        tiktokUrl: empresa.tiktokUrl || '',
        acercaDeNosotros: empresa.acercaDeNosotros || '',
        slogan: empresa.slogan || '',
        servicios: Number(empresa.servicios) || 0,
        catalogo: Number(empresa.catalogo) || 0,
        productos: Number(empresa.productos) || 0,
        cobrarPorcentajeReserva: Number(empresa.cobrarPorcentajeReserva) || 0,
        porcentajeReserva: empresa.porcentajeReserva || '',
        idCategoriaEmpresa: empresa.idCategoriaEmpresa || 0,
        colorPrimary: empresa.colorPrimary || '#3b82f6',
        colorSecondary: empresa.colorSecondary || '#1d4ed8',
        youtubeUrl: empresa.youtubeUrl || '',
        reelsUrls: Array.isArray(empresa.reelsUrls) ? empresa.reelsUrls : []
      });

      setLogoPreview(empresa.rutaLogoUrl || '');
      setPortadaPreview(empresa.rutaPortadaUrl || '');
    }
  }, [empresa?.id]);

  return {
    // Estados
    pageLoading,
    formData,
    logoPreview,
    portadaPreview,
    wompiKeys,
    banners,
    showBannerModal,
    bannerToEdit,
    showFacturacionModal,
    pendingFacturacionValue,
    isEmpresaLoaded,
    empresa,

    // Setters
    setPageLoading,
    setFormData,
    setLogoPreview,
    setPortadaPreview,
    setLogoFile,
    setPortadaFile,
    setWompiKeys,
    setShowBannerModal,
    setBannerToEdit,
    setShowFacturacionModal,

    // Handlers y funciones de lógica
    handleWompiKeysSubmit,
    updateFacturacionElectronica,
    confirmFacturacionChange,
    handleChange,
    handleWompiKeysChange,
    refetchBanners,
    openModalBanner,
    resetBannerModal,
    isLoadingWompi,
    isLoadingBanners,
    guardarBanner,
    eliminarBanner,
    handleFileChange,
    handleSubmit
  };
};
