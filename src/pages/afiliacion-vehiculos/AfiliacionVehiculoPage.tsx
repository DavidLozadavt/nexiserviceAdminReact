import { Container, KeenIcon } from '@/components';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from '@/partials/toolbar';
import { useLayout } from '@/providers';
import axios from 'axios';

import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import { toAbsoluteUrl } from '@/utils';
import { MarcaInterface } from './models/MarcaInterface';
import { ModeloInterface } from './models/ModeloInterface';
import { TipoVehiculoInterface } from './models/TipoVehiculoInterface';
import { TipoAfiliacionInterface } from './models/TipoAfiliacionInterface';
import {
  AsignacionProcesoDocumentoInterface,
  PagoConfiguracion
} from './models/DocumentosAfiliacionInterface';
import { validateFieldVehiculo } from './utils/validateFieldVehiculo';
import { CommonAvatar } from '@/partials/common';
import { ModalCreatePropietario } from './ModalCreatePropietario';
import { ModalCreateConductor } from './ModalCreateConductor';
import { ModalMarcaVehiculo } from './ModalMarcaVehiculo';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import { ModalModeloVehiculo } from './ModalModeloVehiculo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TipoPagoInterface } from '../registrar-compra/models/TipoPagoInterface';
import { MedioPagoInterface } from '../medios-pago/model/MedioPagoInterface';
import { NumericFormat } from 'react-number-format';
import Spinner from '@/components/loaders/Spinner';
import { ModalClaseVehiculo } from './ModalClaseVehiculo';
import { ClaseVehiculosInterface } from './models/ClaseVehiculosInterface';
import { ModalTipoVehiculo } from './ModalTipoVehiculo';
import { ModalTipoAfiliacion } from './ModalTipoAfiliacion';

interface FormErrors {
  [key: string]: string;
}

const defaultImage = toAbsoluteUrl('/media/app/auto.png');

const AfiliacionVehiculoPage = () => {
  const { currentLayout } = useLayout();
  const { enqueueSnackbar } = useSnackbar();

  interface FormDataVehiculo {
    fechaAfiliacion: string;
    numeroOrdenServicio: string;
    placa: string;
    chasis: string;
    tipoV: string;
    idClaseVehiculo: string;
    tipoAfiliacion: string;
    tipoCombustible: string;
    modelo: string;
    marca: string;
    numPuestos: string;
    numeroContratoCoperativa: string;
    numeroContratoRadio: string;
    restricciones: string;
    observaciones: string;
    motor: string;
  }

  const [formDataVehiculo, setFormDataVehiculo] = useState<FormDataVehiculo>(() => {
    const saved = localStorage.getItem('formDataVehiculo');
    return saved
      ? JSON.parse(saved)
      : {
          fechaAfiliacion: '',
          numeroOrdenServicio: '',
          placa: '',
          chasis: '',
          tipoV: '',
          idClaseVehiculo: '',
          tipoAfiliacion: '',
          tipoCombustible: '',
          modelo: '',
          marca: '',
          numPuestos: '',
          numeroContratoCoperativa: '',
          numeroContratoRadio: '',
          restricciones: '',
          observaciones: '',
          motor: ''
        };
  });

  useEffect(() => {
    localStorage.setItem('formDataVehiculo', JSON.stringify(formDataVehiculo));
  }, [formDataVehiculo]);

  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const [modalPropietario, setModalPropietario] = useState<boolean>(false);
  const [modalConductor, setModalConductor] = useState<boolean>(false);
  const [modalMarca, setModalMarca] = useState<boolean>(false);
  const [modalModelo, setModalModelo] = useState<boolean>(false);
  const [modalTipoVehiculo, setModalTipoVehiculo] = useState<boolean>(false);
  const [modalClaseVehiculo, setModalClaseVehiculo] = useState<boolean>(false);
  const [modalTipoAfiliacion, setModalTipoAfiliacion] = useState<boolean>(false);
  const [marcas, setMarcas] = useState<MarcaInterface[]>([]);
  const [modelos, setModelos] = useState<ModeloInterface[]>([]);
  const [tipoVehiculos, setTipoVehiculos] = useState<TipoVehiculoInterface[]>([]);
  const [claseVehiculos, setClaseVehiculo] = useState<ClaseVehiculosInterface[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<TipoPagoInterface[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<MedioPagoInterface[]>([]);
  const [documentosVehiculo, setDocumentosVehiculo] = useState<
    AsignacionProcesoDocumentoInterface[]
  >([]);

  const [pagosVinculacion, setPagosVinculacion] = useState<PagoConfiguracion[]>([]);

  const [tipoAfiliaciones, setTipoAfiliaciones] = useState<TipoAfiliacionInterface[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(defaultImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fecha, setFecha] = useState('');

  const steps = [
    { id: 1, title: 'Paso 1', subtitle: 'Información del Vehículo ' },
    { id: 2, title: 'Paso 2', subtitle: 'Información de los Propietarios' },
    { id: 3, title: 'Paso 3', subtitle: 'Información de los Conductores' },
    { id: 4, title: 'Paso 4', subtitle: 'Pago de Afiliación' }
  ];

  const [errors, setErrors] = useState<FormErrors>({});

  const fetchMarcas = async () => {
    try {
      const response = await axios.get('marcas');
      setMarcas(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModelos = async () => {
    try {
      const response = await axios.get('modelos');
      setModelos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipoVehiculos = async () => {
    try {
      const response = await axios.get('tipo_vehiculos');
      setTipoVehiculos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaseVehiculos = async () => {
    try {
      const response = await axios.get('clase_vehiculos');
      setClaseVehiculo(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipoAfiliacion = async () => {
    try {
      const response = await axios.get('tipo_afiliaciones');
      setTipoAfiliaciones(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  //documentos vehiculo
  const [selectedFilesVehiculo, setSelectedFilesVehiculo] = useState<
    Record<number, { file: File | null; fechaExpedicion: string }>
  >({});

  const [fileErrorsVehiculo, setFileErrorsVehiculo] = useState<
    Record<number, { file?: string; fechaExpedicion?: string }>
  >({});

  const handleFileChangeVehiculo = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentoId: number
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFilesVehiculo((prevFiles) => ({
        ...prevFiles,
        [documentoId]: { file, fechaExpedicion: prevFiles[documentoId]?.fechaExpedicion || '' }
      }));

      setFileErrorsVehiculo((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[documentoId];
        return newErrors;
      });
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>, documentoId: number) => {
    const nuevaFecha = event.target.value;

    setSelectedFilesVehiculo((prevFiles) => ({
      ...prevFiles,
      [documentoId]: {
        file: prevFiles[documentoId]?.file || null,
        fechaExpedicion: nuevaFecha
      }
    }));

    setFileErrorsVehiculo((prevErrors) => {
      if (prevErrors[documentoId]?.fechaExpedicion) {
        const newErrors = { ...prevErrors };
        delete newErrors[documentoId].fechaExpedicion;

        if (Object.keys(newErrors[documentoId]).length === 0) {
          delete newErrors[documentoId];
        }

        return newErrors;
      }
      return prevErrors;
    });
  };

  const handleFileDeleteVehiculo = (documentoId: number) => {
    setSelectedFilesVehiculo((prevFiles) => {
      const updatedFiles = { ...prevFiles };
      delete updatedFiles[documentoId];
      return updatedFiles;
    });
  };

  //fin documentos vehiculo

  //propietario

  const [propietario, setPropietario] = useState<any | undefined>(undefined);
  const [propietarios, setPropietarios] = useState<any[]>([]);
  const [totalPorcentaje, setTotalPorcentaje] = useState<number>(0);
  const [selectedPropietarioId, setSelectedPropietarioId] = useState<number | null>(null);

  useEffect(() => {
    const savedPropietarios = localStorage.getItem('propietarios');
    if (savedPropietarios) {
      const parsed = JSON.parse(savedPropietarios);
      setPropietarios(parsed);

      const nuevaSuma = parsed.reduce(
        (sum: number, p: any) => sum + (Number(p.porcentaje) || 0),
        0
      );
      setTotalPorcentaje(nuevaSuma);

      const admin = parsed.find((p: any) => p.propietarioAdmin === 'Si');
      if (admin) setSelectedPropietarioId(admin.id);
    }
  }, []);

  useEffect(() => {
    if (propietarios.length > 0) {
      const sanitized = propietarios.map(({ documentos, foto, ...rest }) => rest);

      localStorage.setItem('propietarios', JSON.stringify(sanitized));
    } else {
      localStorage.removeItem('propietarios');
    }
  }, [propietarios]);

  const handleSwitchChange = (id: number) => {
    setSelectedPropietarioId(id);
    setPropietarios((prev) =>
      prev.map((propietario) =>
        propietario.id === id
          ? { ...propietario, propietarioAdmin: 'Si' }
          : { ...propietario, propietarioAdmin: 'No' }
      )
    );
  };

  const handleAfterSavePropietario = (nuevaPersona: any) => {
    setPropietarios((prev) => {
      let updatedPropietarios;

      if (!nuevaPersona.id) {
        const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
        updatedPropietarios = [
          ...prev,
          {
            ...nuevaPersona,
            id: newId,
            propietarioAdmin: prev.length === 0 ? 'Si' : 'No'
          }
        ];
      } else {
        const index = prev.findIndex((p) => p.id === nuevaPersona.id);
        if (index !== -1) {
          updatedPropietarios = [...prev];
          updatedPropietarios[index] = {
            ...nuevaPersona,
            propietarioAdmin: prev[index].propietarioAdmin
          };
        } else {
          updatedPropietarios = [
            ...prev,
            {
              ...nuevaPersona,
              propietarioAdmin: prev.length === 0 ? 'Si' : 'No'
            }
          ];
        }
      }

      const nuevaSuma = updatedPropietarios.reduce(
        (sum, p) => sum + (Number(p.porcentaje) || 0),
        0
      );
      setTotalPorcentaje(nuevaSuma);

      if (updatedPropietarios.length === 1) {
        setSelectedPropietarioId(updatedPropietarios[0].id);
      }

      return updatedPropietarios;
    });

    setPropietario(undefined);
  };

  const handleDeletePropietario = (indexToRemove: number) => {
    setPropietarios((prev) => {
      const propietarioEliminado = prev[indexToRemove];
      const nuevoPorcentajeTotal = totalPorcentaje - (Number(propietarioEliminado.porcentaje) || 0);

      const updatedPropietarios = prev.filter((_, index) => index !== indexToRemove);

      if (propietarioEliminado.propietarioAdmin === 'Si' && updatedPropietarios.length > 0) {
        updatedPropietarios[0] = {
          ...updatedPropietarios[0],
          propietarioAdmin: 'Si'
        };
        setSelectedPropietarioId(updatedPropietarios[0].id);
      }

      setTotalPorcentaje(nuevoPorcentajeTotal);
      return updatedPropietarios;
    });
  };

  //end propietario

  //conductor
  const [conductor, setConductor] = useState<any | undefined>(undefined);
  const [conductores, setConductores] = useState<any[]>([]);

  useEffect(() => {
    const savedConductores = localStorage.getItem('conductores');
    if (savedConductores) {
      try {
        setConductores(JSON.parse(savedConductores));
      } catch (err) {
        console.error('Error al parsear conductores desde localStorage', err);
      }
    }
  }, []);

  useEffect(() => {
    if (conductores.length > 0) {
      const conductoresLimpios = conductores.map((c) => {
        const { foto, documentos, ...resto } = c;
        return resto;
      });

      localStorage.setItem('conductores', JSON.stringify(conductoresLimpios));
    } else {
      localStorage.removeItem('conductores');
    }
  }, [conductores]);

  const handleAfterSaveConductor = (nuevaPersona: any) => {
    setConductores((prev) => {
      if (!nuevaPersona.id) {
        const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
        return [...prev, { ...nuevaPersona, id: newId }];
      }

      const index = prev.findIndex((p) => p.id === nuevaPersona.id);
      if (index !== -1) {
        const updatedConductor = [...prev];
        updatedConductor[index] = nuevaPersona;
        return updatedConductor;
      } else {
        return [...prev, nuevaPersona];
      }
    });
    setConductor(undefined);
  };

  const handleDeleteConductor = (indexToRemove: number) => {
    setConductores((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  //end conductor

  const handleChangeFormVehiculo = (e: any) => {
    let { name, value } = e.target;

    value = value.replace(/[^A-Za-z0-9]/g, '');

    if (name === 'placa') {
      if (value.length > 3) {
        value = value.slice(0, 3) + '-' + value.slice(3);
      }
      value = value.toUpperCase();
    }

    const error = validateFieldVehiculo(name, value);

    setFormDataVehiculo((prevData) => ({
      ...prevData,
      [name]: value
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error || undefined
    }));
  };

  const fetchPlacaExist = async () => {
    if (!formDataVehiculo.placa.trim()) return;

    try {
      const response = await axios.get(`exist_placa/${formDataVehiculo.placa}`);

      if (Object.keys(response.data).length === 0) return;

      enqueueSnackbar('La placa ya existe', { variant: 'error' });

      setFormDataVehiculo({
        fechaAfiliacion: '',
        numeroOrdenServicio: '',
        placa: '',
        chasis: '',
        tipoV: '',
        idClaseVehiculo: '',
        tipoAfiliacion: '',
        tipoCombustible: '',
        modelo: '',
        marca: '',
        numPuestos: '',
        numeroContratoCoperativa: '',
        numeroContratoRadio: '',
        restricciones: '',
        observaciones: '',
        motor: ''
      });
    } catch (error) {
      setError('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const fetchNumeroAfiliacion = async () => {
    if (!formDataVehiculo.numeroOrdenServicio.trim()) return;

    try {
      const response = await axios.get(`exist_afiliacion/${formDataVehiculo.numeroOrdenServicio}`);

      if (Object.keys(response.data).length === 0) return;

      enqueueSnackbar('El número de orden ya existe', { variant: 'error' });

      setFormDataVehiculo({
        fechaAfiliacion: '',
        numeroOrdenServicio: '',
        placa: '',
        chasis: '',
        tipoV: '',
        tipoAfiliacion: '',
        idClaseVehiculo: '',
        tipoCombustible: '',
        modelo: '',
        marca: '',
        numPuestos: '',
        numeroContratoCoperativa: '',
        numeroContratoRadio: '',
        restricciones: '',
        observaciones: '',
        motor: ''
      });
    } catch (error) {
      setError('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const validateVehiculo = () => {
    const newErrors: Partial<FormDataVehiculo> = {};

    if (!formDataVehiculo.numeroOrdenServicio) {
      newErrors.numeroOrdenServicio = 'El número de orden de servicio es requerido';
    }

    if (!formDataVehiculo.placa) {
      newErrors.placa = 'La placa es requerida';
    } else if (!/^[A-Za-z]{3}-\d{3}$/.test(formDataVehiculo.placa)) {
      newErrors.placa =
        'La placa debe tener el formato AAA-123 (tres letras, un guion y tres números)';
    }

    if (!formDataVehiculo.chasis) {
      newErrors.chasis = 'El chasis es requerido';
    }

    if (!formDataVehiculo.motor) {
      newErrors.motor = 'El número de motor es requerido';
    }

    if (!formDataVehiculo.tipoV) {
      newErrors.tipoV = 'El tipo de vehículo es requerido';
    }
    if (!formDataVehiculo.idClaseVehiculo) {
      newErrors.idClaseVehiculo = 'La clase de vehículo es requerida';
    }

    if (!formDataVehiculo.tipoCombustible) {
      newErrors.tipoCombustible = 'El tipo de combustible es requrido';
    }

    if (!formDataVehiculo.tipoAfiliacion) {
      newErrors.tipoAfiliacion = 'El tipo de afiliación es requerido';
    }

    if (!formDataVehiculo.modelo) {
      newErrors.modelo = 'El modelo es requerido';
    }

    if (!formDataVehiculo.marca) {
      newErrors.marca = 'La marca es requerida';
    }

    if (!formDataVehiculo.numPuestos) {
      newErrors.numPuestos = 'El número de puestos es requerido';
    } else if (!/^\d+$/.test(formDataVehiculo.numPuestos)) {
      newErrors.numPuestos = 'El número de puestos solo debe contener números';
    }

    return newErrors;
  };

  const handleNext = () => {
    let validationErrors: Partial<any> = validateVehiculo();
    let documentErrors: Record<number, { file?: string; fechaExpedicion?: string }> = {};

    if (currentStep === 1) {
      documentosVehiculo.forEach((documento) => {
        const selectedFile = selectedFilesVehiculo[documento.idTipoDocumento];

        if (!selectedFile?.file) {
          documentErrors[documento.idTipoDocumento] = {
            ...documentErrors[documento.idTipoDocumento],
            file: 'Este documento es requerido.'
          };
        }

        if (!selectedFile?.fechaExpedicion) {
          documentErrors[documento.idTipoDocumento] = {
            ...documentErrors[documento.idTipoDocumento],
            fechaExpedicion: 'La fecha de vigencia es requerida.'
          };
        }
      });

      if (!file) {
        validationErrors['foto'] = 'Por favor, seleccione una foto.';
      }
    }

    if (currentStep === 2) {
      if (propietarios.length === 0) {
        validationErrors['propietarios'] = 'Debe haber al menos un propietario.';
        enqueueSnackbar('Debe haber al menos un propietario.', {
          variant: 'warning'
        });
      } else {
        propietarios.forEach((propietario, idx) => {
          if (!propietario.documentos || Object.keys(propietario.documentos).length === 0) {
            const msg = `El propietario ${propietario.nombre1 || idx + 1} no tiene documentos.`;
            validationErrors[`propietario_${idx}_documentos`] = msg;
            enqueueSnackbar(msg, { variant: 'warning' });
          }
        });
      }
    }

    if (currentStep === 3) {
      if (conductores.length === 1) {
        const conductor = conductores[0];
        if (!conductor.documentos || Object.keys(conductor.documentos).length === 0) {
          const msg = `El conductor ${conductor.nombre1 || ''} no tiene documentos.`;
          validationErrors['conductor_documentos'] = msg;
          enqueueSnackbar(msg, { variant: 'warning' });
        }
      }
    }

    const allErrors = {
      ...validationErrors,
      ...documentErrors
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (Object.keys(documentErrors).length > 0) {
        setFileErrorsVehiculo(documentErrors);
      }
    } else {
      setErrors({});
      setFileErrorsVehiculo({});
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewSrc(defaultImage);
    }
  }, [file]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);

      setErrors((prevErrors) => ({
        ...prevErrors,
        foto: ''
      }));
    }
  };

  const handleFileDelete = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      foto: 'Por favor, seleccione una foto.'
    }));
  };

  const handleAfterSaveModelo = () => {
    fetchModelos();
  };

  const handleAfterSaveMarca = () => {
    fetchMarcas();
  };

  const handleAfterSaveClaseVehiculo = () => {
    fetchClaseVehiculos();
  };

  const handleAfterSaveTipoVehiculo = () => {
    fetchTipoVehiculos();
  };

  const handleAfterSaveTipoAfiliacion = () => {
    fetchTipoAfiliacion();
  };

  const fetchDocumentosVehiculo = useCallback(async () => {
    try {
      const afiliacion = tipoAfiliaciones.find(
        (af) => af.id?.toString() === formDataVehiculo.tipoAfiliacion
      );

      const response = await axios.get(`documents_by_proceso_nombre/${afiliacion?.tipoAfiliacion}`);
      setDocumentosVehiculo(response.data);
    } catch (error) {
      console.log('Error al obtener documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [tipoAfiliaciones, formDataVehiculo.tipoAfiliacion]);

  const fetchPagosVinculacion = useCallback(async () => {
    try {
      const afiliacion = tipoAfiliaciones.find(
        (af) => af.id?.toString() === formDataVehiculo.tipoAfiliacion
      );
      const response = await axios.get(`pagos_by_proceso_nombre/${afiliacion?.tipoAfiliacion}`);
      setPagosVinculacion(response.data);
    } catch (error) {
      console.log('Error al obtener documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [tipoAfiliaciones, formDataVehiculo.tipoAfiliacion]);

  useEffect(() => {
    if (formDataVehiculo.tipoAfiliacion) {
      fetchDocumentosVehiculo();
      fetchPagosVinculacion();
    }
  }, [formDataVehiculo.tipoAfiliacion, fetchDocumentosVehiculo, fetchPagosVinculacion]);

  //forma de pago form validations

  interface FormDataMedioPago {
    medioPago: string;
    tipoPago: string;
    entidadFinanciera: string;
    comprobante: File | null;
    opcionAbono: string;
    valorAbono?: string;
  }

  interface ErrorsMedioPago {
    medioPago?: string;
    tipoPago?: string;
    entidadFinanciera?: string;
    valorAbono?: string;
  }

  const [formDataMedioPago, setFormDataMedioPago] = useState<FormDataMedioPago>({
    medioPago: '',
    tipoPago: '',
    entidadFinanciera: '',
    comprobante: null,
    opcionAbono: 'no',
    valorAbono: ''
  });

  const [errorsMedioPago, setErrorsMedioPago] = useState<ErrorsMedioPago>({});

  const validateFieldMedioPago = (name: keyof ErrorsMedioPago, value: string) => {
    let error = '';
    if (!value) error = 'Este campo es obligatorio';
    setErrorsMedioPago((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleChangeMedioPago = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormDataMedioPago((prev) => ({
        ...prev,
        opcionAbono: value,
        valorAbono: value === 'si' ? prev.valorAbono : ''
      }));
    } else {
      setFormDataMedioPago((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'tipoPago' && value !== '1' ? { opcionAbono: 'no', valorAbono: '' } : {})
      }));
    }

    validateFieldMedioPago(name as keyof ErrorsMedioPago, value);
  };

  const handleFileChangeMedioPago = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormDataMedioPago({ ...formDataMedioPago, [name]: files[0] });
    }
  };

  const validateFormMedioPago = () => {
    let newErrors: ErrorsMedioPago = {};

    if (!formDataMedioPago.medioPago) newErrors.medioPago = 'Este campo es obligatorio';
    if (!formDataMedioPago.tipoPago) newErrors.tipoPago = 'Este campo es obligatorio';
    if (!formDataMedioPago.entidadFinanciera)
      newErrors.entidadFinanciera = 'Este campo es obligatorio';
    if (
      formDataMedioPago.tipoPago === '1' &&
      formDataMedioPago.opcionAbono === 'si' &&
      !formDataMedioPago.valorAbono
    ) {
      newErrors.valorAbono = 'El valor del abono es obligatorio';
    }

    setErrorsMedioPago(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const entidadesFinancieras = [{ id: 14, nombre: 'BANCOLOMBIA S.A' }];

  const fetchPaymentTypes = async () => {
    try {
      const response = await axios.get('tipo_pagos');
      setPaymentTypes(response.data);
    } catch (err) {
      setError(`Error al cargar`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await axios.get('medio_pagos');
      setPaymentMethods(response.data);
    } catch (error) {
      setError('Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  const [seleccionados, setSeleccionados] = useState<PagoConfiguracion[]>([]);
  const [sumaTotal, setSumaTotal] = useState<number>(0);

  const handleCheckboxChange = (pago: PagoConfiguracion) => {
    setSeleccionados((prevSeleccionados) => {
      const yaSeleccionado = prevSeleccionados.some((p) => p.id === pago.id);
      let nuevaSuma = sumaTotal;

      if (yaSeleccionado) {
        const nuevosSeleccionados = prevSeleccionados.filter((p) => p.id !== pago.id);
        nuevaSuma -= pago.configuracion_pago.valor;
        setSumaTotal(nuevaSuma);
        return nuevosSeleccionados;
      } else {
        nuevaSuma += pago.configuracion_pago.valor;
        setSumaTotal(nuevaSuma);
        return [...prevSeleccionados, pago];
      }
    });
  };

  //end validation medio pagos

  const handleSubmit = async () => {
    if (!validateFormMedioPago()) {
      enqueueSnackbar('Validación fallida. Corrige los errores antes de enviar.', {
        variant: 'warning'
      });
      return;
    }

    const data = new FormData();

    Object.entries(formDataVehiculo).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (file) {
      data.append('fileVehiculo', file);
    } else {
      data.append('fileVehiculo', '');
    }

    Object.entries(selectedFilesVehiculo).forEach(([index, { file, fechaExpedicion }]) => {
      if (file) {
        data.append(`vehiculoFiles[${index}]`, file);
        data.append(`vehiculoFilesFechaExpedicion[${index}]`, fechaExpedicion);
      }
    });

    setLoading(true);
    try {
      const response = await axios.post('store_afiliacion', data);
      handleSubmitPropietarios(response.data.idVehiculo, response.data.idAfiliacion);

      if (conductores.length >= 1) {
        handleSubmitConductores(response.data.idVehiculo, response.data.idAfiliacion);
      }
    } catch (error) {
      enqueueSnackbar('Error al guardar el vehiculo.', {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPropietarios = async (idVehiculo: number, idAfiliacion: number) => {
    const data = new FormData();

    propietarios.forEach((propietario, index) => {
      Object.entries(propietario).forEach(([key, value]) => {
        if (key !== 'documentos' && key !== 'foto') {
          data.append(`propietarios[${index}][${key}]`, value as string);
        }
      });

      if (propietario.foto) {
        data.append(`propietarios[${index}][foto]`, propietario.foto);
      }

      Object.entries(
        propietario['documentos'] as Record<number, { file: File; fechaExpedicion: string }>
      ).forEach(([idTipoDocumento, documento]) => {
        if (documento.file) {
          data.append(
            `propietarios[${index}][documentos][${idTipoDocumento}][file]`,
            documento.file
          );
          data.append(
            `propietarios[${index}][documentos][${idTipoDocumento}][fechaExpedicion]`,
            documento.fechaExpedicion
          );
        }
      });
    });

    try {
      const response = await axios.post(
        `store_afiliacion_propietarios/${idVehiculo}/${idAfiliacion}`,
        data
      );
      setLoading(false);

      if (conductores.length === 0) {
        enqueueSnackbar('Vinculación creada correctamente.', {
          variant: 'success'
        });
        setLoading(false);
        reset();
      }
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error al guardar el propietario.', {
        variant: 'error'
      });
    }
  };

  const handleSubmitConductores = async (idVehiculo: number, idAfiliacion: number) => {
    const data = new FormData();

    conductores.forEach((conductor, index) => {
      Object.entries(conductor).forEach(([key, value]) => {
        if (key !== 'documentos' && key !== 'foto') {
          data.append(`conductores[${index}][${key}]`, value as string);
        }
      });

      if (conductor.foto) {
        data.append(`conductores[${index}][foto]`, conductor.foto);
      }

      Object.entries(
        conductor['documentos'] as Record<number, { file: File; fechaExpedicion: string }>
      ).forEach(([idTipoDocumento, documento]) => {
        if (documento.file) {
          data.append(
            `conductores[${index}][documentos][${idTipoDocumento}][file]`,
            documento.file
          );
          data.append(
            `conductores[${index}][documentos][${idTipoDocumento}][fechaExpedicion]`,
            documento.fechaExpedicion
          );
        }
      });
    });

    try {
      setLoading(true);
      const response = await axios.post(
        `store_afiliacion_conductores/${idVehiculo}/${idAfiliacion}`,
        data
      );
      enqueueSnackbar('Vinculación creada correctamente.', {
        variant: 'success'
      });
      setLoading(false);
      reset();
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error al guardar el conductor.', {
        variant: 'error'
      });
    }
  };

  const reset = () => {
    setDocumentosVehiculo([]);
    setFile(null);
    setPreviewSrc(defaultImage);
    setSumaTotal(0);
    setSeleccionados([]);
    setFormDataMedioPago({
      medioPago: '',
      tipoPago: '',
      entidadFinanciera: '',
      comprobante: null,
      opcionAbono: 'no',
      valorAbono: ''
    });
    setErrorsMedioPago({});
    setConductor(undefined);
    setConductores([]);
    setPropietario(undefined);
    setPropietarios([]);
    setTotalPorcentaje(0);
    setSelectedPropietarioId(null);
    setSelectedFilesVehiculo({});
    setFileErrorsVehiculo({});
    setCurrentStep(1);
    setFormDataVehiculo({
      fechaAfiliacion: '',
      numeroOrdenServicio: '',
      placa: '',
      chasis: '',
      tipoV: '',
      idClaseVehiculo: '',
      tipoAfiliacion: '',
      tipoCombustible: '',
      modelo: '',
      marca: '',
      numPuestos: '',
      numeroContratoCoperativa: '',
      numeroContratoRadio: '',
      restricciones: '',
      observaciones: '',
      motor: ''
    });
    localStorage.removeItem('formDataVehiculo');
    localStorage.removeItem('propietarios');
    localStorage.removeItem('conductores');
  };

  useEffect(() => {
    const hoy = new Date().toISOString().split('T')[0];
    setFecha(hoy);
    fetchModelos();
    fetchMarcas();
    fetchTipoAfiliacion();
    fetchClaseVehiculos();
    fetchTipoVehiculos();
    fetchPaymentMethods();
    fetchPaymentTypes();
  }, []);

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Crea vinculaciones en el sistema</ToolbarDescription>
            </ToolbarHeading>
                     <ToolbarActions>
                          <button
                           
                            className="btn btn-sm btn-light"
                          >
                            <KeenIcon icon="information-1" />
                            Consultar Runt
                          </button>
            
                        
                        </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        {loading && <Spinner />}
        <div data-stepper="true">
          <div className="card">
            <div className="card-header flex justify-between items-center gap-4 py-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex gap-2.5 items-center ${currentStep === step.id ? 'active' : ''}`}
                >
                  <div
                    className={`rounded-full size-10 flex items-center justify-center text-md font-semibold ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-inverse'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <i className="ki-outline ki-check text-xl"></i>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4
                      className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-600'}`}
                    >
                      {step.title}
                    </h4>
                    <span
                      className={`text-2sm ${currentStep >= step.id ? 'text-gray-700' : 'text-gray-400'}`}
                    >
                      {step.subtitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-body py-2">
              {currentStep === 1 && (
                <div>
                  <div>
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                      <div className="flex-1 basis-[68%]">
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-6 mb-2">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Fecha de Vinculación
                            </label>
                            <input
                              type="date"
                              name="fechaAfiliacion"
                              disabled
                              value={fecha}
                              className="input w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Número orden *</label>
                            <input
                              type="text"
                              name="numeroOrdenServicio"
                              placeholder="Ingrese el número de orden "
                              className={`input w-full ${errors.numeroOrdenServicio ? 'border-red-500' : ''}`}
                              value={formDataVehiculo.numeroOrdenServicio}
                              onBlur={fetchNumeroAfiliacion}
                              onChange={handleChangeFormVehiculo}
                            />
                            {errors.numeroOrdenServicio && (
                              <p className="text-red-500 text-sm">{errors.numeroOrdenServicio}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-6 mb-2">
                          <div>
                            <label className="block text-sm font-medium mb-2">Placa *</label>
                            <input
                              type="text"
                              name="placa"
                              placeholder="Ingrese la placa"
                              className={`input w-full ${errors.placa ? 'border-red-500' : ''}`}
                              onChange={handleChangeFormVehiculo}
                              onBlur={fetchPlacaExist}
                              value={formDataVehiculo.placa}
                            />
                            {errors.placa && <p className="text-red-500 text-sm">{errors.placa}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Marca *</label>
                            <div className="flex items-center gap-2">
                              <select
                                name="marca"
                                className={`select w-full ${errors.marca ? 'border-red-500' : ''}`}
                                onChange={handleChangeFormVehiculo}
                                value={formDataVehiculo.marca}
                              >
                                <option value="">Seleccione una opción</option>
                                {marcas.map((marca) => (
                                  <option key={marca.id} value={marca.id}>
                                    {marca.marca}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setModalMarca(true)}
                                className="w-10 h-10 btn btn-sm btn-light"
                              >
                                <KeenIcon icon="plus" />
                              </button>
                            </div>
                            {errors.marca && <p className="text-red-500 text-sm">{errors.marca}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-6 mb-2">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Clase de Vehículo *
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                name="idClaseVehiculo"
                                className={`select ${errors.idClaseVehiculo ? 'border-red-500' : ''}`}
                                onChange={handleChangeFormVehiculo}
                                value={formDataVehiculo.idClaseVehiculo}
                              >
                                <option value="">Seleccione una opción</option>
                                {claseVehiculos.map((res) => (
                                  <option key={res.id} value={res.id}>
                                    {res.nombre}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setModalClaseVehiculo(true)}
                                className="w-10 h-10 btn btn-sm btn-light"
                              >
                                <KeenIcon icon="plus" />
                              </button>
                            </div>
                            {errors.idClaseVehiculo && (
                              <p className="text-red-500 text-sm">{errors.idClaseVehiculo}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Modalidad *</label>
                            <div className="flex items-center gap-2">
                              <select
                                name="tipoAfiliacion"
                                className={`select ${errors.tipoAfiliacion ? 'border-red-500' : ''}`}
                                onChange={handleChangeFormVehiculo}
                                value={formDataVehiculo.tipoAfiliacion}
                              >
                                <option value="">Seleccione una opción</option>
                                {tipoAfiliaciones.map((tipoA) => (
                                  <option key={tipoA.id} value={tipoA.id}>
                                    {tipoA.tipoAfiliacion}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setModalTipoAfiliacion(true)}
                                className="w-10 h-10 btn btn-sm btn-light"
                              >
                                <KeenIcon icon="plus" />
                              </button>
                            </div>
                            {errors.tipoAfiliacion && (
                              <p className="text-red-500 text-sm">{errors.tipoAfiliacion}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-2 gap-6 mb-2">
                          <div>
                            <label className="block text-sm font-medium mb-2">Modelo *</label>
                            <div className="flex items-center gap-2">
                              <select
                                name="modelo"
                                className={`select w-full ${errors.modelo ? 'border-red-500' : ''}`}
                                onChange={handleChangeFormVehiculo}
                                value={formDataVehiculo.modelo}
                              >
                                <option value="">Seleccione una opción</option>
                                {modelos.map((modelo) => (
                                  <option key={modelo.id} value={modelo.id}>
                                    {modelo.modelo}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => setModalModelo(true)}
                                className="w-10 h-10 btn btn-sm btn-light"
                              >
                                <KeenIcon icon="plus" />
                              </button>
                            </div>
                            {errors.modelo && (
                              <p className="text-red-500 text-sm">{errors.modelo}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Número de Motor *
                            </label>
                            <input
                              type="text"
                              name="motor"
                              placeholder="Ingrese el número de motor"
                              className={`input w-full ${errors.motor ? 'border-red-500' : ''}`}
                              onChange={handleChangeFormVehiculo}
                              value={formDataVehiculo.motor}
                            />
                            {errors.motor && <p className="text-red-500 text-sm">{errors.motor}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="basis-[35%] flex items-center justify-center">
                        <div className="w-48 h-48 border rounded-lg overflow-hidden shadow">
                          <img
                            src={previewSrc}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Chasis *</label>
                        <input
                          type="text"
                          name="chasis"
                          placeholder="Ingrese el chasis"
                          className={`input w-full ${errors.chasis ? 'border-red-500' : ''}`}
                          onChange={handleChangeFormVehiculo}
                          value={formDataVehiculo.chasis}
                        />
                        {errors.chasis && <p className="text-red-500 text-sm">{errors.chasis}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo de Vehículo *</label>
                        <div className="flex items-center gap-2">
                          <select
                            name="tipoV"
                            className={`select ${errors.tipoV ? 'border-red-500' : ''}`}
                            onChange={handleChangeFormVehiculo}
                            value={formDataVehiculo.tipoV}
                          >
                            <option value="">Seleccione una opción</option>
                            {tipoVehiculos.map((tipoV) => (
                              <option key={tipoV.id} value={tipoV.id}>
                                {tipoV.tipo}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setModalTipoVehiculo(true)}
                            className="w-10 h-10 btn btn-sm btn-light"
                          >
                            <KeenIcon icon="plus" />
                          </button>
                        </div>
                        {errors.tipoV && <p className="text-red-500 text-sm">{errors.tipoV}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Foto *</label>
                        {!file && (
                          <input
                            type="file"
                            name="foto"
                            ref={fileInputRef}
                            className="file-input"
                            accept="image/*"
                            required
                            onChange={handleImageChange}
                          />
                        )}

                        {file && (
                          <div className="flex items-center mt-2">
                            <p className="text-sm input flex justify-between w-full items-center">
                              {file.name}
                              <span onClick={handleFileDelete} className="ml-auto cursor-pointer">
                                <KeenIcon icon="trash" />
                              </span>
                            </p>
                          </div>
                        )}
                        {errors.foto && <p className="text-red-500 text-sm">{errors.foto}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Numero de Pasajeros *{' '}
                        </label>
                        <input
                          type="text"
                          name="numPuestos"
                          placeholder="Ingrese el numero de pasajeros"
                          className={`input w-full ${errors.numPuestos ? 'border-red-500' : ''}`}
                          onChange={handleChangeFormVehiculo}
                          value={formDataVehiculo.numPuestos}
                        />
                        {errors.numPuestos && (
                          <p className="text-red-500 text-sm">{errors.numPuestos}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo Combustible *</label>
                        <select
                          name="tipoCombustible"
                          className={`select ${errors.tipoCombustible ? 'border-red-500' : ''}`}
                          onChange={handleChangeFormVehiculo}
                          value={formDataVehiculo.tipoCombustible}
                        >
                          <option value="">Seleccione una opción</option>
                          <option value="GASOLINA">GASOLINA</option>
                          <option value="ACPM">ACPM</option>
                          <option value="GAS">GAS</option>
                          <option value="ELECTRICO">ELECTRICO</option>
                        </select>
                        {errors.tipoCombustible && (
                          <p className="text-red-500 text-sm">{errors.tipoCombustible}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número Contrato Vinculación
                        </label>
                        <input
                          type="text"
                          name="numeroContratoCoperativa"
                          placeholder="Ingrese el número de contrato de la cooperativa"
                          className={`input w-full ${errors.numeroContratoCoperativa ? 'border-red-500' : ''}`}
                          onChange={handleChangeFormVehiculo}
                          value={formDataVehiculo.numeroContratoCoperativa}
                        />
                        {errors.numeroContratoCoperativa && (
                          <p className="text-red-500 text-sm">{errors.numeroContratoCoperativa}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Número Contrato Teletaxi
                        </label>
                        <input
                          type="text"
                          name="numeroContratoRadio"
                          placeholder="Ingrese el número de contrato de radio"
                          className={`input w-full ${errors.numeroContratoRadio ? 'border-red-500' : ''}`}
                          onChange={handleChangeFormVehiculo}
                          value={formDataVehiculo.numeroContratoRadio}
                        />
                        {errors.numeroContratoRadio && (
                          <p className="text-red-500 text-sm">{errors.numeroContratoRadio}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Observaciones</label>
                        <textarea
                          name="observaciones"
                          placeholder="Ingrese las observaciones"
                          className={`textarea w-full ${errors.observaciones ? 'border-red-500' : ''}`}
                          onChange={handleChangeFormVehiculo}
                          value={formDataVehiculo.observaciones}
                        />
                        {errors.observaciones && (
                          <p className="text-red-500 text-sm">{errors.observaciones}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2 mt-2">
                    {documentosVehiculo.map((documento) => (
                      <div key={documento.idTipoDocumento} className="mb-1">
                        <label className="block text-sm font-medium mb-1">
                          {documento.tipoDocumento.tituloDocumento} *
                        </label>
                        {!selectedFilesVehiculo[documento.idTipoDocumento]?.file ? (
                          <>
                            <input
                              type="file"
                              name={`file-${documento.idTipoDocumento}`}
                              onChange={(e) =>
                                handleFileChangeVehiculo(e, documento.idTipoDocumento)
                              }
                              className="file-input"
                            />
                            {fileErrorsVehiculo[documento.idTipoDocumento]?.file && (
                              <p className="text-red-500 text-sm mt-1">
                                {fileErrorsVehiculo[documento.idTipoDocumento].file}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                              <p className="text-sm input flex justify-between w-full items-center">
                                {selectedFilesVehiculo[documento.idTipoDocumento]?.file?.name}
                                <span
                                  onClick={() =>
                                    handleFileDeleteVehiculo(documento.idTipoDocumento)
                                  }
                                  className="ml-auto cursor-pointer"
                                >
                                  <KeenIcon icon="trash" />
                                </span>
                              </p>
                            </div>

                            <label className="block text-sm font-medium">
                              Vigencia - {documento.tipoDocumento.tituloDocumento} *
                            </label>
                            <input
                              type="date"
                              value={
                                selectedFilesVehiculo[documento.idTipoDocumento]?.fechaExpedicion ||
                                ''
                              }
                              onChange={(e) => handleDateChange(e, documento.idTipoDocumento)}
                              className="input border rounded px-2 py-1 w-full"
                            />
                            {fileErrorsVehiculo[documento.idTipoDocumento]?.fechaExpedicion && (
                              <p className="text-red-500 text-sm mt-1">
                                {fileErrorsVehiculo[documento.idTipoDocumento].fechaExpedicion}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div>
                  <div>
                    {propietarios.length > 1 && (
                      <span className="badge text-sm mb-3 badge-outline badge-info">
                        <KeenIcon icon="information-2" className="mr-2" />
                        La persona marcada con este ícono{' '}
                        <FontAwesomeIcon className="mr-2 ml-2" icon={faToggleOn} />
                        activo será el propietario administrador
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7.5">
                    {propietarios.map((propietario, index) => {
                      const imagenSrc =
                        propietario.foto instanceof File
                          ? URL.createObjectURL(propietario.foto)
                          : propietario.imagen || '/media/avatars/300-35.png';

                      return (
                        <div key={index} className="card h-full flex flex-col">
                          <div className="card-body flex flex-col items-center lg:pt-10 flex-grow">
                            <div className="mb-3">
                              <CommonAvatar
                                className="relative"
                                image={imagenSrc}
                                imageClass="rounded-full w-20 h-20"
                                badgeClass="flex size-2.5 absolute bottom-0.5 left-16 transform -translate-y-1/2"
                              />
                            </div>

                            <div className="flex items-center justify-center gap-1.5 mb-3 mt-2">
                              <p className="hover:text-primary-active text-base leading-5 font-medium text-gray-900">
                                {propietario.nombre1} {propietario.apellido1}
                              </p>
                            </div>

                            <span className="text-gray-700 text-sm m2-4">
                              {propietario.identificacion}
                            </span>
                          </div>

                          <div className="card-footer flex justify-center gap-2 mt-auto items-center">
                            <label className="flex items-center cursor-pointer ">
                              <input
                                type="checkbox"
                                className="hidden switch"
                                checked={selectedPropietarioId === propietario.id}
                                onChange={() => handleSwitchChange(propietario.id)}
                              />

                              <div
                                className={`w-12 h-6 rounded-full p-0.5 transition-colors ${selectedPropietarioId === propietario.id ? 'bg-blue-500' : 'bg-gray-300'}`}
                              >
                                <div
                                  className={`w-5 h-5 bg-white rounded-full transition-transform ${selectedPropietarioId === propietario.id ? 'translate-x-5.5' : 'translate-x-1.5'}`}
                                ></div>
                              </div>
                            </label>

                            <a
                              className="btn btn-light btn-sm"
                              onClick={() => {
                                setModalPropietario(true);
                                setPropietario(propietario);
                              }}
                            >
                              <KeenIcon icon="pencil" />
                            </a>

                            <a
                              className="btn btn-light btn-sm"
                              onClick={() => handleDeletePropietario(index)}
                            >
                              <KeenIcon icon="trash" />
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    <div
                      className="card h-full min-h-[280px] flex flex-col justify-center items-center cursor-pointer p-4 rounded-lg border border-gray-300 shadow-md hover:bg-gray-100 active:scale-95 transition duration-200"
                      onClick={() => setModalPropietario(true)}
                    >
                      <button
                        title="Add New"
                        className="group cursor-pointer outline-none transform transition-transform duration-300 hover:rotate-90"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="50px"
                          height="50px"
                          viewBox="0 0 24 24"
                          className="stroke-green-400 fill-none group-hover:fill-green-800 group-active:stroke-green-200 group-active:fill-green-600 group-active:duration-0 duration-300"
                        >
                          <path
                            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                            strokeWidth="1.5"
                          ></path>
                          <path d="M8 12H16" strokeWidth="1.5"></path>
                          <path d="M12 16V8" strokeWidth="1.5"></path>
                        </svg>
                      </button>

                      <p className="mt-2">Añadir Propietario</p>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7.5">
                    {conductores.map((conductor, index) => {
                      const imagenSrc =
                        conductor.foto instanceof File
                          ? URL.createObjectURL(conductor.foto)
                          : conductor.rutaFotoUrl || '/media/avatars/300-35.png';

                      return (
                        <div key={index} className="card h-full flex flex-col">
                          <div className="card-body flex flex-col items-center lg:pt-10 flex-grow">
                            <div className="mb-3">
                              <CommonAvatar
                                className={'relative'}
                                image={imagenSrc}
                                imageClass={'rounded-full w-20 h-20'}
                                badgeClass={
                                  'flex size-2.5 absolute bottom-0.5 left-16 transform -translate-y-1/2'
                                }
                              />
                            </div>

                            <div className="flex items-center justify-center gap-1.5 mb-3 mt-2">
                              <p className="hover:text-primary-active text-base leading-5 font-medium text-gray-900">
                                {conductor.nombre1} {conductor.apellido1}
                              </p>
                            </div>

                            <span className="text-gray-700 text-sm m2-4">
                              {conductor.identificacion}
                            </span>
                          </div>

                          <div className="card-footer justify-center gap-2 mt-auto">
                            <a
                              className="btn btn-light btn-sm"
                              onClick={() => {
                                setModalConductor(true);
                                setConductor(conductor);
                              }}
                            >
                              <KeenIcon icon="pencil" />
                            </a>

                            <a
                              className="btn btn-light btn-sm"
                              onClick={() => handleDeleteConductor(index)}
                            >
                              <KeenIcon icon="trash" />
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    <div
                      className="card h-full min-h-[280px] flex flex-col justify-center items-center cursor-pointer p-4 rounded-lg border border-gray-300 shadow-md hover:bg-gray-100 active:scale-95 transition duration-200"
                      onClick={() => setModalConductor(true)}
                    >
                      <button
                        title="Add New"
                        className="group cursor-pointer outline-none transform transition-transform duration-300 hover:rotate-90"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="50px"
                          height="50px"
                          viewBox="0 0 24 24"
                          className="stroke-green-400 fill-none group-hover:fill-green-800 group-active:stroke-green-200 group-active:fill-green-600 group-active:duration-0 duration-300"
                        >
                          <path
                            d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                            strokeWidth="1.5"
                          ></path>
                          <path d="M8 12H16" strokeWidth="1.5"></path>
                          <path d="M12 16V8" strokeWidth="1.5"></path>
                        </svg>
                      </button>

                      <p className="mt-2">Añadir Conductor</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {currentStep === 4 && (
              <div className="p-8">
                <div className="card min-w-full mb-2">
                  <div className="card-table">
                    <table className="table table-border align-middle text-gray-700 font-medium text-sm">
                      <thead>
                        <tr>
                          <th className="py-2 w-20">Código</th>
                          <th className="py-2">Pago</th>
                          <th className="py-2">Valor</th>
                          <th className="py-2 text-center w-10">Seleccionar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagosVinculacion.map((pago, index) => (
                          <tr key={index}>
                            <td className="py-2">{pago.id}</td>
                            <td className="py-2">{pago.configuracion_pago.titulo}</td>
                            <td className="py-2">
                              {new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: 'COP'
                              }).format(pago.configuracion_pago.valor)}
                            </td>

                            <td className="text-center">
                              <input
                                className="checkbox"
                                name="check"
                                type="checkbox"
                                value={pago.id}
                                onChange={() => handleCheckboxChange(pago)}
                                checked={seleccionados.some((p) => p.id === pago.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={2} className="py-2 font-bold">
                            Iva:
                          </td>
                          <td className="py-2 font-bold">0</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="py-2 font-bold">
                            Total:
                          </td>
                          <td className="py-2 font-bold">
                            {' '}
                            {new Intl.NumberFormat('es-ES', {
                              style: 'currency',
                              currency: 'COP'
                            }).format(sumaTotal)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                <div className="flex items-center mt-10 my-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-4 text-gray-500">Forma de pago</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <form className="mb-8">
                  <div className="grid grid-cols-1 mb-4 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Medios de Pago *</label>
                      <select
                        name="medioPago"
                        className="input"
                        value={formDataMedioPago.medioPago}
                        onChange={handleChangeMedioPago}
                      >
                        <option value="">Seleccione una opción</option>
                        {paymentMethods.map((medio) => (
                          <option key={medio.id} value={medio.id}>
                            {medio.detalleMedioPago}
                          </option>
                        ))}
                      </select>
                      {errorsMedioPago.medioPago && (
                        <p className="text-red-500 text-sm mt-1">{errorsMedioPago.medioPago}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Pago *</label>
                      <select
                        name="tipoPago"
                        className="input"
                        value={formDataMedioPago.tipoPago}
                        onChange={handleChangeMedioPago}
                      >
                        <option value="">Seleccione una opción</option>
                        {paymentTypes.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.detalleTipoPago}
                          </option>
                        ))}
                      </select>
                      {errorsMedioPago.tipoPago && (
                        <p className="text-red-500 text-sm mt-1">{errorsMedioPago.tipoPago}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Entidad Financiera *</label>
                      <select
                        name="entidadFinanciera"
                        className="input"
                        value={formDataMedioPago.entidadFinanciera}
                        onChange={handleChangeMedioPago}
                      >
                        <option value="">Seleccione una opción</option>
                        {entidadesFinancieras.map((entidad) => (
                          <option key={entidad.id} value={entidad.id}>
                            {entidad.nombre}
                          </option>
                        ))}
                      </select>
                      {errorsMedioPago.entidadFinanciera && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsMedioPago.entidadFinanciera}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Comprobante de Pago (Opcional)
                      </label>
                      <input
                        type="file"
                        name="comprobante"
                        className="file-input"
                        onChange={handleFileChangeMedioPago}
                      />
                    </div>
                  </div>

                  {formDataMedioPago.tipoPago === '1' && (
                    <>
                      {/* ¿Vas a realizar un abono? */}
                      <div className="grid grid-cols-1 mb-4 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            ¿Vas a realizar un abono?
                          </label>
                          <div className="flex gap-4">
                            <label>
                              <input
                                type="checkbox"
                                name="opcionAbono"
                                className="mr-2"
                                value="si"
                                checked={formDataMedioPago.opcionAbono === 'si'}
                                onChange={handleChangeMedioPago}
                              />
                              Sí
                            </label>
                            <label>
                              <input
                                type="checkbox"
                                name="opcionAbono"
                                className="mr-2"
                                value="no"
                                checked={formDataMedioPago.opcionAbono === 'no'}
                                onChange={handleChangeMedioPago}
                              />
                              No
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Valor del Abono (Si eligió Sí) */}
                      {formDataMedioPago.opcionAbono === 'si' && (
                        <div className="grid grid-cols-1 mb-4 mt-4 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Valor del Abono *
                            </label>
                            <div>
                              <NumericFormat
                                className="input"
                                prefix={'$'}
                                name="valorAbono"
                                decimalScale={3}
                                thousandsGroupStyle="thousand"
                                thousandSeparator=","
                                placeholder="Ingrese el Valor del Abono"
                                value={formDataMedioPago.valorAbono}
                                onValueChange={(values) =>
                                  setFormDataMedioPago((prev) => ({
                                    ...prev,
                                    valorAbono: values.value
                                  }))
                                }
                              />
                              {errorsMedioPago.valorAbono && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errorsMedioPago.valorAbono}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </form>
              </div>
            )}

            <div className="card-footer py-4 flex justify-between">
              <button
                className={`btn btn-light ${currentStep === 1 ? 'hidden' : ''}`}
                onClick={handleBack}
              >
                Anterior
              </button>
              {currentStep < steps.length ? (
                <button className="btn btn-light" onClick={handleNext}>
                  Siguiente
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>

      <ModalCreatePropietario
        open={modalPropietario}
        onClose={() => {
          setModalPropietario(false);
          setPropietario(undefined);
        }}
        data={propietario}
        totalPorcentaje={totalPorcentaje}
        onSave={handleAfterSavePropietario}
      />

      <ModalCreateConductor
        open={modalConductor}
        onClose={() => {
          setModalConductor(false);
          setConductor(undefined);
        }}
        data={conductor}
        onSave={handleAfterSaveConductor}
      />

      <ModalMarcaVehiculo
        open={modalMarca}
        onClose={() => {
          setModalMarca(false);
        }}
        onSave={handleAfterSaveMarca}
      />

      <ModalModeloVehiculo
        open={modalModelo}
        onClose={() => {
          setModalModelo(false);
        }}
        onSave={handleAfterSaveModelo}
      />

      <ModalModeloVehiculo
        open={modalModelo}
        onClose={() => {
          setModalModelo(false);
        }}
        onSave={handleAfterSaveModelo}
      />

      <ModalClaseVehiculo
        open={modalClaseVehiculo}
        onClose={() => {
          setModalClaseVehiculo(false);
        }}
        onSave={handleAfterSaveClaseVehiculo}
      />

      <ModalTipoVehiculo
        open={modalTipoVehiculo}
        onClose={() => {
          setModalTipoVehiculo(false);
        }}
        onSave={handleAfterSaveTipoVehiculo}
      />

      <ModalTipoAfiliacion
        open={modalTipoAfiliacion}
        onClose={() => {
          setModalTipoAfiliacion(false);
        }}
        onSave={handleAfterSaveTipoAfiliacion}
      />
    </Fragment>
  );
};

export { AfiliacionVehiculoPage };
