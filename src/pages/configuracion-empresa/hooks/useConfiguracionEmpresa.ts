import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  mision: '',
  vision: '',
  servicios: 0,
  catalogo: 0,
  productos: 0,
  mostrarEquipo: 0,
  cobrarPorcentajeReserva: 0,
  porcentajeReserva: '',
  idCategoriaEmpresa: 0,
  colorPrimary: '#3b82f6', // default blue
  colorSecondary: '#1d4ed8', 
  youtubeUrl: '',
  reelsUrls: [],
  tipoBanner: 'image',
  colorBanner: '#8b5cf6',
  bannerYOffset: 50
};

export const useConfiguracionEmpresa = () => {
  const { empresa, getUserAuthenticated } = useAuthContext();
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
  
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [tempBannerUrl, setTempBannerUrl] = useState('');

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

  // --- LÓGICA DE CONTEO DE PRODUCTOS Y CATÁLOGO ---
  const { data: productCount = 0 } = useQuery(
    ['productCount', empresa?.id],
    async () => {
      const response = await axios.get(`/get_all_productos_companys`, { 
        params: { per_page: 1, page: 1 } 
      });
      return response.data.total || 0;
    },
    { enabled: !!empresa?.id, staleTime: 300000 }
  );

  const { data: catalogCount = 0 } = useQuery(
    ['catalogCount', empresa?.id],
    async () => {
      const response = await axios.get('/products_catalogo_menu', { 
        params: { per_page: 1, page: 1 } 
      });
      return response.data.total || 0;
    },
    { enabled: !!empresa?.id, staleTime: 300000 }
  );

  const { data: serviceCount = 0 } = useQuery(
    ['serviceCount', empresa?.id],
    async () => {
      const response = await axios.get('/servicios');
      return response.data?.length || 0;
    },
    { enabled: !!empresa?.id, staleTime: 300000 }
  );

  const { data: teamCount = 0 } = useQuery(
    ['teamCount', empresa?.id],
    async () => {
      const response = await axios.get('/responsable_servicios');
      return response.data?.length || 0;
    },
    { enabled: !!empresa?.id, staleTime: 300000 }
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
      await getUserAuthenticated(true);
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
          // Invalida la query para forzar el refetch inmediato y actualización en tiempo real
          await queryClient.invalidateQueries(['banners', empresa?.id]);
          
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
      await queryClient.invalidateQueries(['banners', empresa?.id]);
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
        const url = URL.createObjectURL(file);
        setPortadaPreview(url);
        setTempBannerUrl(url);
        setShowBannerEditor(true);
      }
    } else {
      setLogoFile(file);
      if (file) {
        setLogoPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent, manualData?: Partial<EmpresaFormData>) => {
    if (e) e.preventDefault();
    setPageLoading(true);
    try {
      const dataToSend = new FormData();
      // Usamos el formData actual o el manualData si se provee (para evitar cierres obsoletos)
      const currentData = manualData ? { ...formData, ...manualData } : formData;

      Object.entries(currentData).forEach(([key, value]) => {
        if (
          key !== 'servicios' &&
          key !== 'catalogo' &&
          key !== 'productos' &&
          key !== 'mostrarEquipo' &&
          key !== 'facturacionElectronica' &&
          key !== 'reelsUrls'
        ) {
          dataToSend.append(key, value !== null && value !== undefined ? String(value) : '');
        }
      });

      const itemsEmpresaArray: string[] = [];
      if (currentData.servicios === 1) itemsEmpresaArray.push('servicios');
      if (currentData.catalogo === 1) itemsEmpresaArray.push('catalogo');
      if (currentData.productos === 1) itemsEmpresaArray.push('productos');
      if (currentData.mostrarEquipo === 1) itemsEmpresaArray.push('profesionales');
      dataToSend.append('itemsEmpresa', JSON.stringify(itemsEmpresaArray));

      if (currentData.reelsUrls && Array.isArray(currentData.reelsUrls)) {
        dataToSend.append('reelsUrls', JSON.stringify(currentData.reelsUrls));
      } else if (typeof currentData.reelsUrls === 'string') {
        dataToSend.append('reelsUrls', JSON.stringify((currentData.reelsUrls as string).split(',').map(u => u.trim()).filter(u => u)));
      }

      if (logoFile) {
        dataToSend.append('rutaLogoFile', logoFile);
      }
      if (portadaFile) {
        dataToSend.append('rutaPortadaFile', portadaFile);
      }

      await axios.post(`company_update`, dataToSend);
      
      // Actualizamos el contexto de forma forzada para obtener los nuevos datos
      await getUserAuthenticated(true);
      
      // Sincronizamos localmente para evitar cualquier "reversión" visual inmediata
      // mientras el contexto se propaga
      setFormData(currentData);
      
      enqueueSnackbar('Datos actualizados correctamente', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Error al actualizar la empresa', { variant: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  // --- DIRTY STATE (Detectar cambios) ---
  const isDirty = useMemo(() => {
    if (!empresa) return false;
    if (logoFile || portadaFile) return true;

    return Object.keys(formData).some(key => {
      const k = key as keyof EmpresaFormData;
      const val1 = formData[k];
      const val2 = empresa[k as keyof typeof empresa];

      // 1. Reels (Arrays)
      if (k === 'reelsUrls') {
        const arr1 = Array.isArray(val1) ? val1 : [];
        let arr2 = val2;
        if (typeof val2 === 'string') {
          try { arr2 = JSON.parse(val2); } catch { arr2 = []; }
        }
        if (!Array.isArray(arr2)) arr2 = [];
        return JSON.stringify(arr1) !== JSON.stringify(arr2);
      }

      // 2. Numéricos (Normalizar a Number)
      const numericFields = [
        'servicios', 'catalogo', 'productos', 'mostrarEquipo', 'cobrarPorcentajeReserva', 
        'responsableIva', 'retenciones', 'idCategoriaEmpresa', 'facturacionElectronica',
        'bannerYOffset'
      ];
      
      if (numericFields.includes(k as string)) {
        let v2 = val2;
        if (k === 'facturacionElectronica') v2 = empresa.facturaElectronica;
        
        // Usar los mismos defaults que en INITIAL_FORM_DATA y resetFormData
        let d1 = 0;
        if (k === 'bannerYOffset') d1 = 50;
        
        return Number(val1 ?? d1) !== Number(v2 ?? d1);
      }

      // 3. Colores y Enums con defaults específicos
      if (k === 'colorPrimary') return String(val1 ?? '#3b82f6') !== String(val2 ?? '#3b82f6');
      if (k === 'colorSecondary') return String(val1 ?? '#1d4ed8') !== String(val2 ?? '#1d4ed8');
      if (k === 'colorBanner') return String(val1 ?? '#8b5cf6') !== String(val2 ?? '#8b5cf6');
      if (k === 'tipoBanner') return String(val1 ?? 'image') !== String(val2 ?? 'image');

      // 4. Strings (Normalizar null/undefined a '')
      return String(val1 ?? '').trim() !== String(val2 ?? '').trim();
    });
  }, [formData, empresa, logoFile, portadaFile]);

  const isWompiDirty = useMemo(() => {
    if (!configData || isLoadingWompi) return false;
    
    const pk = configData.publicKeyProd || '';
    const prk = configData.privateKeyProd || '';
    const ev = configData.prodEvents || '';
    const ig = configData.prodIntegrity || '';

    // Si wompiKeys aún está vacío pero configData tiene datos, 
    // significa que el useEffect de inicialización aún no ha corrido.
    // Evitamos marcar como dirty en ese mini-lapso.
    if (!wompiKeys.publicKeyProd && !wompiKeys.privateKeyProd && (pk || prk)) return false;

    return (
      wompiKeys.publicKeyProd !== pk ||
      wompiKeys.privateKeyProd !== prk ||
      wompiKeys.prodEvents !== ev ||
      wompiKeys.prodIntegrity !== ig
    );
  }, [wompiKeys, configData, isLoadingWompi]);

  const resetFormData = useCallback(() => {
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
        mision: empresa.mision || '',
        vision: empresa.vision || '',
        servicios: Number(empresa.servicios) || 0,
        catalogo: Number(empresa.catalogo) || 0,
        productos: Number(empresa.productos) || 0,
        mostrarEquipo: Number(empresa.mostrarEquipo) || 0,
        cobrarPorcentajeReserva: Number(empresa.cobrarPorcentajeReserva) || 0,
        porcentajeReserva: empresa.porcentajeReserva || '',
        idCategoriaEmpresa: empresa.idCategoriaEmpresa || 0,
        colorPrimary: empresa.colorPrimary || '#3b82f6',
        colorSecondary: empresa.colorSecondary || '#1d4ed8',
        youtubeUrl: empresa.youtubeUrl || '',
        reelsUrls: (() => {
          if (Array.isArray(empresa.reelsUrls)) return empresa.reelsUrls;
          if (typeof empresa.reelsUrls === 'string') {
            try { return JSON.parse(empresa.reelsUrls); } catch { return []; }
          }
          return [];
        })(),
        tipoBanner: empresa.tipoBanner || 'image',
        colorBanner: empresa.colorBanner || '#8b5cf6',
        bannerYOffset: (empresa.bannerYOffset !== null && empresa.bannerYOffset !== undefined) ? Number(empresa.bannerYOffset) : 50
      });
      setLogoFile(null);
      setPortadaFile(null);
      setLogoPreview(empresa.rutaLogoUrl || '');
      setPortadaPreview(empresa.rutaPortadaUrl || '');
    }

    if (configData) {
      setWompiKeys({
        publicKeyProd: configData.publicKeyProd || '',
        privateKeyProd: configData.privateKeyProd || '',
        prodEvents: configData.prodEvents || '',
        prodIntegrity: configData.prodIntegrity || ''
      });
    }
  }, [empresa, configData]);

  // --- EFECTO DE MONTAJE: CARGA DE DATOS ---
  useEffect(() => {
    resetFormData();
  }, [empresa, configData]);

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
    isDirty,
    isWompiDirty,

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
    handleSubmit,
    resetFormData,
    showBannerEditor,
    setShowBannerEditor,
    tempBannerUrl,
    setTempBannerUrl,
    productCount,
    catalogCount,
    serviceCount,
    teamCount
  };
};
