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

import React, { Fragment, useEffect, useState } from 'react';
import { PersonaInterface } from './model/PersonaInterface';
import { ContratoInterface } from './model/ContratoInterface';
import { validateFieldPersona } from './utils/validationPersona';
import { validateUbicacionField } from './utils/validationUbicacion';
import { validateContratoField } from './utils/validationContrato';
import { TipoContratoModal } from './ModalTipoContrato';
import { RolModal } from './RolModal';
import { useSnackbar } from 'notistack';
import { TipoDocumentoInterface } from './model/TipoDocumentoInterface';
import Spinner from '@/components/loaders/Spinner';
import { ModalLinksAntecedentes } from '../contratos/ModalLinksAntecedentes';
import { ModalInfoDocumentos } from '../contratos/ModalInfoDocumentos';
import { BancoModal } from './BancoModal';

interface FormErrors {
  [key: string]: string;
}

const tiposCuentaBancaria = ['CUENTA DE AHORROS', 'CUENTA CORRIENTE'];

const tiposCotizante = [
  'COTIZANTE DEPENDIENTE',
  'COTIZANTE INDEPENDIENTE',
  'COTIZANTE INDEPENDIENTE CON CONTRATO DE PRESTACIÓN DE SERVICIOS',
  'COTIZANTE PENSIONADO',
  'COTIZANTE ESTUDIANTE',
  'COTIZANTE VOLUNTARIO',
  'COTIZANTE SERVICIO DOMÉSTICO',
  'COTIZANTE TRABAJADOR AGRÍCOLA / RURAL',
  'COTIZANTE MADRES COMUNITARIAS Y SUSTITUTAS'
];

const ContratacionPage = () => {
  const { currentLayout } = useLayout();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState<boolean>(true);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [ciudades, setCiudades] = useState<any[]>([]);
  const [ciudadesUbicacion, setCiudadesUbicacion] = useState<any[]>([]);
  const [tipoIdentificaciones, setTipoIdentificacion] = useState<TipoDocumentoInterface[]>([]);
  const [tipoContratos, setTipoContratos] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [documentosContratos, setDocumentosContratos] = useState<any[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [errorsContrato, setErrorsContrato] = useState<Partial<ContratoInterface>>({});
  const [selectedFilePersona, setSelectedFilePersona] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [isFieldDisabled, setIsFieldDisabled] = useState(false);
  const [isSueldoDisabled, setIsSueldoDisabled] = useState(true);
  const [isValorTotalDisabled, setIsValorTotalDisabled] = useState(true);
  const [rolModal, setRolModal] = useState(false);
  const [bancoModal, setBancoModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [tipoContratoModal, setTipoContratoModal] = useState(false);
  const [fileErrors, setFileErrors] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [bancos, setBancos] = useState<any[]>([]);

  const [modalLinkAntecedentes, setModalLinkAntecedentes] = useState(false);
  const [modalInfoDocuemntos, setModalInfoDocumentos] = useState(false);

  const [entidadesArl, setEntidadesArl] = useState<any[]>([]);
  const [entidadesEPS, setEntidadeEPS] = useState<any[]>([]);
  const [entidadesPension, setEntidadesPension] = useState<any[]>([]);
  const [entidadesCesantias, setEntidadesCesantias] = useState<any[]>([]);
  const [entidadesCajaCompensacion, setEntidadesCajaCompensacion] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [formDataUbicacion, setFormDataUbicacion] = useState<PersonaInterface>({
    departamentoU: '',
    ciudadU: '',
    email: '',
    direccion: '',
    celular: '',
    telefonoFijo: ''
  });

  const [formDataPersona, setFormDataPersona] = useState<PersonaInterface>({
    nombre1: '',
    apellido1: '',
    nombre2: '',
    idtipoIdentificacion: '',
    identificacion: '',
    rh: '',
    sexo: '',
    fechaNac: '',
    idciudadNac: '',
    departamento: '',
    apellido2: ''
  });

  const [formDataContrato, setFormDataContrato] = useState<ContratoInterface>({
    salario_id: '',
    fechaContratacion: '',
    perfilProfesional: '',
    otrosi: '',
    periodoPago: '',
    idtipoContrato: '',
    fechaSistema: '',
    observacion: '',
    fechaFinalContrato: '',
    valorTotalContrato: '',
    objetoContrato: '',
    sueldo: '',
    rol: '',
    idPension: '',
    idSalud: '',
    idArl: '',
    idCajaCompensacion: '',
    idCesantias: '',
    tipoCuentaBancaria: '',
    idBanco: '',
    numeroCuentaBancaria: '',
    observacionPreocupacional: '',
    idArea: '',
    tipoCotizante: '',
    tipoComisiones: ''
  });

  const steps = [
    { id: 1, title: 'Paso 1', subtitle: 'Información Personal' },
    { id: 2, title: 'Paso 2', subtitle: 'Información de Ubicación' },
    { id: 3, title: 'Paso 3', subtitle: 'Información de Contrato' },
    { id: 4, title: 'Paso 4', subtitle: 'Documentos del Contrato' }
  ];

  const handleChangeFormUbicacion = (e: any) => {
    const { name, value } = e.target;
    const error = validateUbicacionField(name, value);
    setFormDataUbicacion((prevData) => ({
      ...prevData,
      [name]: value
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error || undefined
    }));

    if (name === 'departamentoU') {
      fetchCiudadesUbicacion(value);
    }
  };

  const handleChangeFormPerson = (e: any) => {
    const { name, value } = e.target;
    const error = validateFieldPersona(name, value);

    setFormDataPersona((prevData) => ({
      ...prevData,
      [name]: value
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error || undefined
    }));

    if (name === 'departamento') {
      fetchCiudades(value);
    }
  };

  const handleChangeFormContrato = (e: any) => {
    const { name, value } = e.target;

    setFormDataContrato((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'idtipoContrato' && parseInt(value) === 6
        ? { fechaFinalContrato: '', valorTotalContrato: '' }
        : {})
    }));

    const error = validateContratoField(name, value);
    setErrorsContrato((prevErrors) => ({
      ...prevErrors,
      [name]: error || undefined
    }));

    if (name === 'idtipoContrato') {
      setIsSueldoDisabled(true);
    }

    if (name === 'idtipoContrato' && parseInt(value) === 6) {
      setIsFieldDisabled(true);
      setIsSueldoDisabled(false);
    } else if (name === 'idtipoContrato') {
      setIsFieldDisabled(false);
    }

    if (name === 'idtipoContrato' && parseInt(value) === 8) {
      setIsSueldoDisabled(false);
      setIsValorTotalDisabled(false);
    } else if (name === 'idtipoContrato') {
      setIsValorTotalDisabled(true);
    }

    const selectedTipoContrato = tipoContratos.find(
      (tipoContrato) => tipoContrato.id === parseInt(value)
    );
    if (name === 'idtipoContrato') {
      const selectedTipoContrato = tipoContratos.find(
        (tipoContrato) => tipoContrato.id === parseInt(value)
      );

      if (selectedTipoContrato) {
        fetchDocumentosContrato(selectedTipoContrato.nombreTipoContrato);
      }
    }

    if (name === 'rol') {
      const selectedRol = roles.find((rol) => rol.id === parseInt(value));
      let salarioMensual = selectedRol?.salario?.valor || 0;
      let idSalario = selectedRol?.salario?.id || null;

      if (formDataContrato.fechaContratacion && formDataContrato.fechaFinalContrato) {
        const fechaInicio = new Date(formDataContrato.fechaContratacion);
        const fechaFin = new Date(formDataContrato.fechaFinalContrato);

        if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
          let diffMonths =
            (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
            (fechaFin.getMonth() - fechaInicio.getMonth());

          if (fechaFin.getDate() >= fechaInicio.getDate()) {
            diffMonths += 1;
          }

          setFormDataContrato((prevState) => ({
            ...prevState,
            sueldo: salarioMensual.toString(),
            valorTotalContrato: (salarioMensual * diffMonths).toString(),
            salario_id: idSalario
          }));
        }
      }
    }
  };

  const currencyFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  });

  const parseCurrency = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  const handleCurrencyChange = (e: any) => {
    const { name, value } = e.target;
    const numericValue = parseCurrency(value);
    setFormDataContrato((prev) => ({
      ...prev,
      [name]: numericValue
    }));
  };

  const validateContrato = () => {
    const newErrors: Partial<ContratoInterface> = {};

    if (!formDataContrato.fechaContratacion) {
      newErrors.fechaContratacion = 'La fecha de inicio de contrato es requerida';
    }

    if (formDataContrato.idtipoContrato !== '6' && !formDataContrato.fechaFinalContrato) {
      newErrors.fechaFinalContrato = 'La fecha de fin de contrato es requerida';
    }

    if (!formDataContrato.idtipoContrato) {
      newErrors.idtipoContrato = 'El tipo de contrato es requerido';
    }

    if (!formDataContrato.rol) {
      newErrors.rol = 'El cargo es requerido';
    }

    if (!formDataContrato.sueldo) {
      newErrors.sueldo = 'El sueldo es requerido';
    }

    if (formDataContrato.idtipoContrato !== '6' && !formDataContrato.valorTotalContrato) {
      newErrors.valorTotalContrato = 'El valor total del contrato es requerido';
    }

    if (!formDataContrato.periodoPago) {
      newErrors.periodoPago = 'El período de pago es requerido';
    }

    if (!formDataContrato.objetoContrato) {
      newErrors.objetoContrato = 'El objeto de contrato es requerido';
    }

    if (
      formDataContrato.numeroCuentaBancaria &&
      !/^\d+$/.test(formDataContrato.numeroCuentaBancaria)
    ) {
      newErrors.numeroCuentaBancaria = 'El número de cuenta bancaria solo debe contener números';
    }

    return newErrors;
  };

  const handleSaveContrato = () => {
    const missingFiles: Record<string, boolean> = {};

    documentosContratos.forEach((documento) => {
      if (!selectedFiles[documento.id]) {
        missingFiles[documento.id] = true;
      }
    });

    if (Object.keys(missingFiles).length > 0) {
      setFileErrors(missingFiles);
      return;
    }
    setLoading(true);
    const data = new FormData();

    data.append('fechaNac', formDataPersona.fechaNac + '');
    data.append('idtipoIdentificacion', formDataPersona?.idtipoIdentificacion + '');
    data.append('identificacion', formDataPersona.identificacion + '');
    data.append('nombre1', formDataPersona.nombre1?.toUpperCase() + '');
    if (formDataPersona.nombre2) {
      data.append('nombre2', formDataPersona.nombre2.toUpperCase() + '');
    }
    data.append('apellido1', formDataPersona.apellido1?.toUpperCase() + '');
    if (formDataPersona.apellido2) {
      data.append('apellido2', formDataPersona.apellido2.toUpperCase() + '');
    }
    data.append('idciudadNac', formDataPersona.idciudadNac + '');
    data.append('sexo', formDataPersona.sexo + '');
    data.append('rh', formDataPersona.rh + '');

    data.append('celular', formDataUbicacion.celular + '');
    data.append('email', formDataUbicacion.email + '');
    data.append('direccion', formDataUbicacion.direccion?.toUpperCase() + '');
    data.append('idciudadUbicacion', formDataUbicacion.idciudadUbicacion + '');
    data.append('telefonoFijo', formDataUbicacion.telefonoFijo + '');

    if (selectedFilePersona) {
      data.append('rutaFotoFile', selectedFilePersona);
    }

    axios
      .post('contrato-persona', data)
      .then((response) => {
        const contratoData = {
          ...formDataContrato,
          fechaContratacion:
            formDataContrato.fechaContratacion['jsdate'] || formDataContrato.fechaContratacion,
          fechaFinalContrato:
            formDataContrato.fechaFinalContrato['jsdate'] || formDataContrato.fechaFinalContrato,
          idtipoContrato: formDataContrato.idtipoContrato,
          idPersona: response.data.id,
          valorTotalContrato: formDataContrato.valorTotalContrato,
          periodoPago: formDataContrato.periodoPago,
          objetoContrato: formDataContrato.objetoContrato,
          observacion: formDataContrato.observacion,
          rol: formDataContrato.rol,
          salario_id: formDataContrato.salario_id,
          idPension: formDataContrato.idPension,
          idArl: formDataContrato.idArl,
          idSalud: formDataContrato.idSalud,
          idCajaCompensacion: formDataContrato.idCajaCompensacion,
          idCesantias: formDataContrato.idCesantias,
          tipoCuentaBancaria: formDataContrato.tipoCuentaBancaria,
          idBanco: formDataContrato.idBanco,
          numeroCuentaBancaria: formDataContrato.numeroCuentaBancaria,
          observacionPreocupacional: formDataContrato.observacionPreocupacional,
          idCaja: formDataContrato.idArea,
          tipoCotizante: formDataContrato.tipoCotizante,
          tipoComisiones: formDataContrato.tipoComisiones
        };

        axios
          .post('contrato', { ...contratoData })
          .then((response) => {
            const idContrato = response.data.id;
            const tipoDocumentos = Object.keys(selectedFiles);
            let successCount = 0;
            let errorOccurred = false;

            const documentRequests = tipoDocumentos.map((tipoId) => {
              const documentoData = new FormData();
              const file = selectedFiles[tipoId];
              if (file) {
                documentoData.append('rutaFile', file);
                documentoData.append('idContrato', idContrato + '');
                documentoData.append('idAsignacionTipoDocumentoProceso', tipoId);

                return axios
                  .post('contrato-documento', documentoData)
                  .then(() => {
                    successCount++;
                  })
                  .catch((error) => {
                    errorOccurred = true;
                    console.error(`Error al guardar el documento ${tipoId}:`, error);
                  });
              }
              return null;
            });

            Promise.all(documentRequests)
              .then(() => {
                if (errorOccurred) {
                  enqueueSnackbar('Hubo un error al guardar algunos documentos.', {
                    variant: 'error'
                  });
                  setLoading(false);
                } else {
                  enqueueSnackbar('Contrato guardado con éxito.', {
                    variant: 'success'
                  });
                }
                setLoading(false);
                resetFormAndGoToStep1();
              })
              .catch(() => {
                setLoading(false);
                enqueueSnackbar('Hubo un error inesperado al guardar los documentos.', {
                  variant: 'error'
                });
              });
          })
          .catch((error) => {
            setLoading(false);
            enqueueSnackbar('Error al guardar el contrato.', {
              variant: 'error'
            });
          });
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error al guardar la persona.', {
          variant: 'error'
        });
      });
  };

  const resetFormAndGoToStep1 = () => {
    setFormDataPersona({
      nombre1: '',
      apellido1: '',
      nombre2: '',
      idtipoIdentificacion: '',
      identificacion: '',
      rh: '',
      sexo: '',
      fechaNac: '',
      idciudadNac: '',
      departamento: '',
      apellido2: ''
    });

    setFormDataUbicacion({
      departamentoU: '',
      ciudadU: '',
      email: '',
      direccion: '',
      celular: '',
      telefonoFijo: ''
    });

    setFormDataContrato({
      salario_id: '',
      fechaContratacion: '',
      perfilProfesional: '',
      otrosi: '',
      periodoPago: '',
      idtipoContrato: '',
      fechaSistema: '',
      observacion: '',
      fechaFinalContrato: '',
      valorTotalContrato: '',
      objetoContrato: '',
      sueldo: '',
      rol: '',
      idSalud: '',
      idArl: '',
      idPension: '',
      idCajaCompensacion: '',
      idCesantias: '',
      tipoCuentaBancaria: '',
      idBanco: '',
      numeroCuentaBancaria: '',
      observacionPreocupacional: '',
      idArea: '',
      tipoCotizante: '',
      tipoComisiones: ''
    });
    setFotoUrl('');
    setSelectedFiles({});
    setSelectedFilePersona(null);
    setCurrentStep(1);
  };

  const handleFilePersonaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setSelectedFilePersona(file);

    if (file) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors['rutaFoto'];
        return newErrors;
      });
    }
  };

  const handleFilePersonaDelete = () => {
    setFotoUrl('');
    setSelectedFilePersona(null);
  };

  const validatePerson = () => {
    const newErrors: Partial<PersonaInterface> = {};
    if (!formDataPersona.nombre1) {
      newErrors.nombre1 = 'El primer nombre es requerido';
    } else if (
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(formDataPersona.nombre1) ||
      formDataPersona.nombre1.length <= 2
    ) {
      newErrors.nombre1 = 'El primer nombre debe contener solo letras y ser mayor a 2 caracteres';
    }

    if (!formDataPersona.apellido1) {
      newErrors.apellido1 = 'El primer apellido es requerido';
    } else if (
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(formDataPersona.apellido1) ||
      formDataPersona.apellido1.length <= 2
    ) {
      newErrors.apellido1 =
        'El primer apellido debe contener solo letras y ser mayor a 2 caracteres';
    }

    if (!formDataPersona.idtipoIdentificacion) {
      newErrors.idtipoIdentificacion = 'El tipo de identificación es requerido';
    }

    if (!formDataPersona.identificacion) {
      newErrors.identificacion = 'La identificación es requerida';
    } else if (!/^\d{5,}$/.test(formDataPersona.identificacion)) {
      newErrors.identificacion = 'La identificación debe ser un número con más de 4 cifras';
    }

    if (!formDataPersona.rh) {
      newErrors.rh = 'El tipo de sangre es requerido';
    }

    if (!formDataPersona.sexo) {
      newErrors.sexo = 'El sexo es requerido';
    }

    if (!formDataPersona.fechaNac) {
      newErrors.fechaNac = 'La fecha de nacimiento es requerida';
    }

    if (!formDataPersona.idciudadNac) {
      newErrors.idciudadNac = 'La ciudad de nacimiento es requerida';
    }
    if (!formDataPersona.departamento) {
      newErrors.departamento = 'El departamento de nacimiento es requerido';
    }

    return newErrors;
  };

  const validateUbicacion = () => {
    const newErrors: Partial<PersonaInterface> = {};

    if (!formDataUbicacion.departamentoU)
      newErrors.departamentoU = 'El departamento de ubicación es requerido';
    if (!formDataUbicacion.idciudadUbicacion)
      newErrors.idciudadUbicacion = 'La ciudad de ubicación es requerida';
    if (!formDataUbicacion.email) newErrors.email = 'El correo electrónico es requerido';
    else if (!/\S+@\S+\.\S+/.test(formDataUbicacion.email))
      newErrors.email = 'El correo electrónico es inválido';
    if (!formDataUbicacion.direccion) newErrors.direccion = 'La dirección es requerida';
    if (!formDataUbicacion.celular) newErrors.celular = 'El celular es requerido';
    else if (!/^\d{10}$/.test(formDataUbicacion.celular))
      newErrors.celular = 'El celular debe tener 10 dígitos';

    return newErrors;
  };

  const handleNext = () => {
    let validationErrors: Partial<any> = {};
    let validationErrorsContrato: Partial<any> = {};

    if (currentStep === 1) {
      validationErrors = validatePerson();

      if (!selectedFilePersona && !fotoUrl) {
        validationErrors['rutaFoto'] = 'Por favor, seleccione una foto.';
      }
    } else if (currentStep === 2) {
      validationErrors = validateUbicacion();
    } else if (currentStep === 3) {
      validationErrorsContrato = validateContrato();
    }

    const allErrors = {
      ...validationErrors,
      ...validationErrorsContrato
    };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setErrorsContrato(validationErrorsContrato);
    } else {
      setErrors({});
      setErrorsContrato({});
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleTipoContratoModalOpen = () => {
    setTipoContratoModal(true);
  };

  const handleTipoContratoModalClose = () => {
    setTipoContratoModal(false);
  };

  const handleRolModalOpen = () => {
    setRolModal(true);
  };

  const handleRolModalClose = () => {
    setRolModal(false);
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get('departamentos');
      setDepartamentos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipoIdentificacion = async () => {
    try {
      const response = await axios.get('contrato-tipos-identificacion');
      setTipoIdentificacion(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipoContratos = async () => {
    try {
      const response = await axios.get('contrato-tipos-contrato');
      setTipoContratos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get('contrato-roles');
      setRoles(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidadesArl = async () => {
    try {
      const response = await axios.get('entidades/arl');
      setEntidadesArl(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidadesEPS = async () => {
    try {
      const response = await axios.get('entidades/eps');
      setEntidadeEPS(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidadesPension = async () => {
    try {
      const response = await axios.get('entidades/pensiones');
      setEntidadesPension(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidadesCajaCompensacion = async () => {
    try {
      const response = await axios.get('entidades/caja_compensacion');
      setEntidadesCajaCompensacion(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntidadesCesantias = async () => {
    try {
      const response = await axios.get('entidades/cesantias');
      setEntidadesCesantias(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBancos = async () => {
    try {
      const response = await axios.get('bancos');
      setBancos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentosContrato = async (nombreProceso: string) => {
    try {
      const response = await axios.get(`contrato-tipo-documento?nombreProceso=${nombreProceso}`);
      setDocumentosContratos(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCiudades = async (idDepartamento: number) => {
    try {
      const response = await axios.get(`ciudades/departamento/${idDepartamento}`);
      setCiudades(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCiudadesUbicacion = async (idDepartamento: number) => {
    try {
      const response = await axios.get(`ciudades/departamento/${idDepartamento}`);
      setCiudadesUbicacion(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`all_areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0] || null;
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [id]: file
    }));

    setFileErrors((prevErrors) => ({
      ...prevErrors,
      [id]: false
    }));
  };

  const handleFileDelete = (id: string) => {
    setSelectedFiles((prevFiles) => ({
      ...prevFiles,
      [id]: null
    }));
  };

  const fetchContrato = async (identificacion: any) => {
    if (!identificacion) return;

    setLoading(true);

    try {
      const response = await axios.get(`contrato-persona/${identificacion}`);
      const data = response.data;

      if (data && Object.keys(data).length > 0) {
        const idDepartamentoNac = data.ciudad_nac?.departamento?.id || '';
        const idCiudadNac = data.idCiudadNac || '';
        const idDepartamentoU = data.ciudad_ubicacion?.departamento?.id || '';
        const idCiudadU = data.idCiudadUbicacion || '';

        setFormDataPersona((prev) => ({
          ...prev,
          nombre1: data.nombre1 || '',
          nombre2: data.nombre2 || '',
          apellido1: data.apellido1 || '',
          apellido2: data.apellido2 || '',
          fechaNac: data.fechaNac || '',
          idtipoIdentificacion: data.idTipoIdentificacion || '',
          rh: data.rh || '',
          sexo: data.sexo || '',
          departamento: idDepartamentoNac
        }));

        setFormDataUbicacion((prev) => ({
          ...prev,
          direccion: data.direccion || '',
          email: data.email || '',
          celular: data.celular || '',
          telefonoFijo: data.telefonoFijo || '',
          departamentoU: idDepartamentoU
        }));

        setFotoUrl(data.rutaFotoUrl || '');

        if (idDepartamentoNac) {
          await fetchCiudades(idDepartamentoNac);
          setFormDataPersona((prev) => ({
            ...prev,
            idciudadNac: idCiudadNac
          }));
        }

        if (idDepartamentoU) {
          await fetchCiudades(idDepartamentoU);
          setFormDataUbicacion((prev) => ({
            ...prev,
            idciudadUbicacion: idCiudadU
          }));
        }
      } else {
        enqueueSnackbar('No se encontraron datos de contrato para esta identificación.', {
          variant: 'info'
        });
      }
    } catch (error: any) {
      const mensajeError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        'Error desconocido al consultar contrato.';

      enqueueSnackbar(mensajeError, {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipoIdentificacion();
    fetchDepartamentos();
    fetchTipoContratos();
    fetchRoles();
    fetchEntidadesArl();
    fetchEntidadesEPS();
    fetchEntidadesPension();
    fetchEntidadesCajaCompensacion();
    fetchEntidadesCesantias();
    fetchBancos();
    fetchAreas();
  }, []);

  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>Crea contratos en el sistema</ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <button
                onClick={() => setModalLinkAntecedentes(true)}
                className="btn btn-sm btn-light"
              >
                <KeenIcon icon="information-1" />
                Consultar antecedentes
              </button>

              <button onClick={() => setModalInfoDocumentos(true)} className="btn btn-sm btn-light">
                <KeenIcon icon="information-1" />
                Consultar documentos necesarios
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

            <div className="card-body py-8">
              {currentStep === 1 && (
                <div>
                  <form>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tipo Identificación *
                        </label>
                        <select
                          name="idtipoIdentificacion"
                          value={formDataPersona.idtipoIdentificacion}
                          onChange={handleChangeFormPerson}
                          className="select"
                        >
                          <option value="">Seleccione una Opción</option>
                          {tipoIdentificaciones.map((tipoIdentificacion) => (
                            <option key={tipoIdentificacion.id} value={tipoIdentificacion.id}>
                              {tipoIdentificacion.codigo}
                            </option>
                          ))}
                        </select>
                        {errors.idtipoIdentificacion && (
                          <p className="text-red-500 text-sm mt-1">{errors.idtipoIdentificacion}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Identificación *</label>
                        <input
                          type="text"
                          name="identificacion"
                          placeholder="Ingrese su identificación"
                          value={formDataPersona.identificacion}
                          onChange={handleChangeFormPerson}
                          onBlur={() => fetchContrato(formDataPersona.identificacion)}
                          className={`input ${errors.identificacion ? 'border-red-500' : ''}`}
                        />
                        {errors.identificacion && (
                          <p className="text-red-500 text-sm mt-1">{errors.identificacion}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Primer Nombre *</label>
                        <input
                          type="text"
                          name="nombre1"
                          placeholder="Ingrese su primer nombre"
                          value={formDataPersona.nombre1}
                          onChange={handleChangeFormPerson}
                          className={`input ${errors.nombre1 ? 'border-red-500' : ''}`}
                        />
                        {errors.nombre1 && (
                          <p className="text-red-500 text-sm mt-1">{errors.nombre1}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Segundo Nombre</label>
                        <input
                          type="text"
                          placeholder="Ingrese su segundo nombre"
                          name="nombre2"
                          value={formDataPersona.nombre2}
                          onChange={handleChangeFormPerson}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Primer Apellido *</label>
                        <input
                          type="text"
                          name="apellido1"
                          placeholder="Ingrese su primer apellido"
                          value={formDataPersona.apellido1}
                          onChange={handleChangeFormPerson}
                          className="input"
                        />{' '}
                        {errors.apellido1 && (
                          <p className="text-red-500 text-sm mt-1">{errors.apellido1}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Segundo Apellido</label>
                        <input
                          type="text"
                          name="apellido2"
                          placeholder="Ingrese su segundo apellido"
                          value={formDataPersona.apellido2}
                          onChange={handleChangeFormPerson}
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Sexo *</label>
                        <select
                          name="sexo"
                          value={formDataPersona.sexo}
                          onChange={handleChangeFormPerson}
                          className="select"
                        >
                          <option value="">Seleccione una Opción</option>

                          <option value="F">FEMENINO</option>
                          <option value="M">MASCULINO</option>
                          <option value="O">OTRO</option>
                        </select>
                        {errors.sexo && <p className="text-red-500 text-sm mt-1">{errors.sexo}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Rh *</label>
                        <select
                          name="rh"
                          value={formDataPersona.rh}
                          onChange={handleChangeFormPerson}
                          className="select"
                        >
                          <option value="">Seleccione una Opción</option>

                          <option value="A+">A POSITIVO</option>
                          <option value="A-">A NEGATIVO</option>
                          <option value="AB+">AB POSTITIVO</option>
                          <option value="AB-">AB NEGATIVO</option>
                          <option value="B+">B POSITIVO</option>
                          <option value="B-">B NEGATIVO</option>
                          <option value="O+">O POSITIVO</option>
                          <option value="O-">O NEGATIVO</option>
                        </select>
                        {errors.rh && <p className="text-red-500 text-sm mt-1">{errors.rh}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Departamento de Nacimiento *
                        </label>
                        <select
                          name="departamento"
                          value={formDataPersona.departamento}
                          onChange={handleChangeFormPerson}
                          className="select"
                        >
                          <option value="">Seleccione un departamento</option>
                          {departamentos.map((departamento) => (
                            <option key={departamento.id} value={departamento.id}>
                              {departamento.descripcion}
                            </option>
                          ))}
                        </select>
                        {errors.departamento && (
                          <p className="text-red-500 text-sm mt-1">{errors.departamento}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Ciudad de Nacimiento *
                        </label>
                        <select
                          name="idciudadNac"
                          value={formDataPersona.idciudadNac}
                          onChange={handleChangeFormPerson}
                          className="select"
                        >
                          <option value="">Seleccione una ciudad</option>
                          {ciudades.map((ciudad) => (
                            <option key={ciudad.id} value={ciudad.id}>
                              {ciudad.descripcion}
                            </option>
                          ))}
                        </select>
                        {errors.idciudadNac && (
                          <p className="text-red-500 text-sm mt-1">{errors.idciudadNac}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Fecha de Nacimiento *
                        </label>
                        <input
                          type="date"
                          name="fechaNac"
                          value={formDataPersona.fechaNac}
                          onChange={handleChangeFormPerson}
                          className="input"
                          max={new Date().toISOString().split('T')[0]}
                        />

                        {errors.fechaNac && (
                          <p className="text-red-500 text-sm mt-1">{errors.fechaNac}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Foto *</label>

                        {!selectedFilePersona && !fotoUrl ? (
                          <input
                            type="file"
                            name="rutaFoto"
                            onChange={handleFilePersonaChange}
                            className="file-input"
                          />
                        ) : selectedFilePersona ? (
                          <div className="flex items-center">
                            <p className="text-sm input flex justify-between w-full items-center">
                              {selectedFilePersona.name}
                              <span
                                onClick={handleFilePersonaDelete}
                                className="ml-2 cursor-pointer"
                              >
                                <KeenIcon icon="trash" />
                              </span>
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <img
                              src={fotoUrl}
                              alt="Foto cargada"
                              className="w-24 h-24 object-cover rounded mr-4 border"
                            />
                            <span onClick={() => setFotoUrl('')} className="ml-2 cursor-pointer">
                              <KeenIcon icon="trash" />
                            </span>
                          </div>
                        )}

                        {errors['rutaFoto'] && (
                          <p className="text-red-500 text-sm mt-1">{errors['rutaFoto']}</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}
              {currentStep === 2 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Departamento de Ubicación *
                      </label>
                      <select
                        name="departamentoU"
                        value={formDataUbicacion.departamentoU}
                        onChange={handleChangeFormUbicacion}
                        className="select"
                      >
                        <option value="">Seleccione un departamento</option>
                        {departamentos.map((departamento) => (
                          <option key={departamento.id} value={departamento.id}>
                            {departamento.descripcion}
                          </option>
                        ))}
                      </select>
                      {errors.departamentoU && (
                        <p className="text-red-500 text-sm mt-1">{errors.departamentoU}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Ciudad de Ubicación *
                      </label>
                      <select
                        name="idciudadUbicacion"
                        value={formDataUbicacion.idciudadUbicacion}
                        onChange={handleChangeFormUbicacion}
                        className="select"
                      >
                        <option value="">Seleccione una ciudad</option>
                        {ciudadesUbicacion.map((ciudad) => (
                          <option key={ciudad.id} value={ciudad.id}>
                            {ciudad.descripcion}
                          </option>
                        ))}
                      </select>
                      {errors.idciudadUbicacion && (
                        <p className="text-red-500 text-sm mt-1">{errors.idciudadUbicacion}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Dirección *</label>
                      <input
                        type="text"
                        name="direccion"
                        placeholder="Ingrese la dirección"
                        value={formDataUbicacion.direccion}
                        onChange={handleChangeFormUbicacion}
                        className={`input ${errors.direccion ? 'border-red-500' : ''}`}
                      />
                      {errors.direccion && (
                        <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Correo Electronico *</label>
                      <input
                        type="text"
                        name="email"
                        placeholder="Ingrese el Correo Electronico"
                        value={formDataUbicacion.email}
                        onChange={handleChangeFormUbicacion}
                        className={`input ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Celular *</label>
                      <input
                        type="text"
                        name="celular"
                        placeholder="Ingrese el celular"
                        value={formDataUbicacion.celular}
                        onChange={handleChangeFormUbicacion}
                        className={`input ${errors.celular ? 'border-red-500' : ''}`}
                      />
                      {errors.celular && (
                        <p className="text-red-500 text-sm mt-1">{errors.celular}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Teléfono Fijo</label>
                      <input
                        type="text"
                        name="telefonoFijo"
                        placeholder="Ingrese el teléfono "
                        value={formDataUbicacion.telefonoFijo}
                        onChange={handleChangeFormUbicacion}
                        className={`input ${errors.telefonoFijo ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Fecha Inicio Contrato *
                      </label>
                      <input
                        type="date"
                        name="fechaContratacion"
                        value={formDataContrato.fechaContratacion}
                        onChange={handleChangeFormContrato}
                        className="input"
                      />
                      {errorsContrato.fechaContratacion && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsContrato.fechaContratacion}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Fecha Fin Contrato *</label>
                      <input
                        type="date"
                        name="fechaFinalContrato"
                        value={formDataContrato.fechaFinalContrato}
                        onChange={handleChangeFormContrato}
                        className="input"
                        disabled={isFieldDisabled}
                      />
                      {errorsContrato.fechaFinalContrato && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsContrato.fechaFinalContrato}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo Contrato *</label>
                      <div className="flex items-center">
                        <select
                          name="idtipoContrato"
                          value={formDataContrato.idtipoContrato}
                          onChange={handleChangeFormContrato}
                          className="select w-4/4 mr-2"
                        >
                          <option value="">Seleccione una Opción</option>
                          {tipoContratos.map((tipoContrato) => (
                            <option key={tipoContrato.id} value={tipoContrato.id}>
                              {tipoContrato.nombreTipoContrato}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleTipoContratoModalOpen}
                          className="w-10 h-10 btn btn-sm btn-light"
                        >
                          <KeenIcon icon="plus" />
                        </button>
                      </div>

                      {errorsContrato.idtipoContrato && (
                        <p className="text-red-500 text-sm mt-1">{errorsContrato.idtipoContrato}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Cargo *</label>
                      <div className="flex items-center">
                        <select
                          name="rol"
                          value={formDataContrato.rol}
                          onChange={handleChangeFormContrato}
                          className="select w-4/4 mr-2"
                        >
                          <option value="">Seleccione una Opción</option>
                          {roles.map((rol) => (
                            <option key={rol.id} value={rol.id}>
                              {rol.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={handleRolModalOpen}
                          className="w-10 h-10 btn btn-sm btn-light"
                        >
                          <KeenIcon icon="plus" />
                        </button>
                      </div>
                      {errorsContrato.rol && (
                        <p className="text-red-500 text-sm mt-1">{errorsContrato.rol}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Sueldo mensual *</label>
                      <input
                        type="text"
                        name="sueldo"
                        placeholder="Ingrese el sueldo"
                        value={currencyFormatter.format(Number(formDataContrato.sueldo || 0))}
                        onChange={handleCurrencyChange}
                        className="input"
                        disabled={isSueldoDisabled}
                      />
                      {errorsContrato.sueldo && (
                        <p className="text-red-500 text-sm mt-1">{errorsContrato.sueldo}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Valor total de contrato *
                      </label>
                      <input
                        type="text"
                        disabled={isValorTotalDisabled}
                        name="valorTotalContrato"
                        placeholder="Ingrese el valor del contrato"
                        value={currencyFormatter.format(
                          Number(formDataContrato.valorTotalContrato || 0)
                        )}
                        onChange={handleCurrencyChange}
                        className="input w-4/4 mr-2"
                      />
                      {errorsContrato.valorTotalContrato && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsContrato.valorTotalContrato}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Periodo de Pago *</label>
                      <select
                        name="periodoPago"
                        value={formDataContrato.periodoPago}
                        onChange={handleChangeFormContrato}
                        className="select"
                      >
                        <option value="">Seleccione una Opción</option>
                        <option value="7">SEMANAL</option>
                        <option value="15">QUINCENAL</option>
                        <option value="30">MENSUAL</option>
                      </select>
                      {errorsContrato.periodoPago && (
                        <p className="text-red-500 text-sm mt-1">{errorsContrato.periodoPago}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Objeto contrato *</label>
                      <textarea
                        rows={5}
                        name="objetoContrato"
                        placeholder="Ingrese el objeto de contrato"
                        value={formDataContrato.objetoContrato}
                        onChange={handleChangeFormContrato}
                        className="textarea"
                      ></textarea>
                      {errorsContrato.objetoContrato && (
                        <p className="text-red-500 text-sm mt-1">{errorsContrato.objetoContrato}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Observación</label>

                      <textarea
                        className="textarea"
                        name="observacion"
                        placeholder="Ingrese una obervacion "
                        value={formDataContrato.observacion}
                        onChange={handleChangeFormContrato}
                        rows={5}
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pensión</label>
                      <select
                        name="idPension"
                        value={formDataContrato.idPension}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {entidadesPension.map((res) => (
                          <option key={res.id} value={res.id}>
                          {res.nombre} - {res.codigo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Salud</label>
                      <select
                        name="idSalud"
                        value={formDataContrato.idSalud}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {entidadesEPS.map((res) => (
                          <option key={res.id} value={res.id}>
                           {res.nombre} - {res.codigo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Arl</label>
                      <select
                        name="idArl"
                        value={formDataContrato.idArl}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {entidadesArl.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.nombre} - {res.codigo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Caja de Compensación</label>
                      <select
                        name="idCajaCompensacion"
                        value={formDataContrato.idCajaCompensacion}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {entidadesCajaCompensacion.map((res) => (
                          <option key={res.id} value={res.id}>
                           {res.nombre} - {res.codigo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cesantías </label>
                      <select
                        name="idCesantias"
                        value={formDataContrato.idCesantias}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {entidadesCesantias.map((res) => (
                          <option key={res.id} value={res.id}>
                          {res.nombre} - {res.codigo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo Cotizante</label>
                      <div className="flex items-center">
                        <select
                          name="tipoCotizante"
                          value={formDataContrato.tipoCotizante}
                          onChange={handleChangeFormContrato}
                          className="select w-4/4 mr-2"
                        >
                          <option value="">Seleccione una Opción</option>
                          {tiposCotizante.map((tipo, index) => (
                            <option key={index} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2 mt-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tipo de Cuenta Bancaria{' '}
                      </label>
                      <select
                        name="tipoCuentaBancaria"
                        value={formDataContrato.tipoCuentaBancaria}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {tiposCuentaBancaria.map((tipo, index) => (
                          <option key={index} value={tipo}>
                            {tipo}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Banco</label>
                      <div className="flex items-center">
                        <select
                          name="idBanco"
                          value={formDataContrato.idBanco}
                          onChange={handleChangeFormContrato}
                          className="select w-4/4 mr-2"
                        >
                          <option value="">Seleccione una Opción</option>
                          {bancos.map((res) => (
                            <option key={res.id} value={res.id}>
                              {res.nombre}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setBancoModal(true)}
                          className="w-10 h-10 btn btn-sm btn-light"
                        >
                          <KeenIcon icon="plus" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Número de Cuenta *</label>
                      <input
                        type="text"
                        name="numeroCuentaBancaria"
                        placeholder="Ingrese el número de cuenta"
                        value={formDataContrato.numeroCuentaBancaria}
                        onChange={handleChangeFormContrato}
                        className="input"
                      />
                      {errorsContrato.numeroCuentaBancaria && (
                        <p className="text-red-500 text-sm mt-1">
                          {errorsContrato.numeroCuentaBancaria}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Observación Preocupacional
                      </label>

                      <textarea
                        className="textarea"
                        name="observacionPreocupacional"
                        placeholder="Ingrese una obervación preocupacional "
                        value={formDataContrato.observacionPreocupacional}
                        onChange={handleChangeFormContrato}
                        rows={5}
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Área</label>
                      <select
                        name="idArea"
                        value={formDataContrato.idArea}
                        onChange={handleChangeFormContrato}
                        className="select w-4/4 mr-2"
                      >
                        <option value="">Seleccione una Opción</option>
                        {areas.map((res) => (
                          <option key={res.id} value={res.id}>
                            {res.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo Comisión</label>
                      <select
                        name="tipoComisiones"
                        value={formDataContrato.tipoComisiones}
                        onChange={handleChangeFormContrato}
                        className="select"
                      >
                        <option value="">Seleccione una Opción</option>

                        <option value="Escala de ventas">ESCALA DE VENTAS</option>
                        <option value="Porcentaje fijo">PORCENTAJE FIJO</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                    {documentosContratos.map((documento) => (
                      <div key={documento.id} className="mb-1">
                        <label className="block text-sm font-medium mb-1">
                          {documento.tipoDocumento.tituloDocumento} *
                        </label>
                        {!selectedFiles[documento.id] ? (
                          <input
                            type="file"
                            name={`file-${documento.id}`}
                            onChange={(e) => handleFileChange(e, documento.id)}
                            className="file-input"
                          />
                        ) : (
                          <div className="flex items-center">
                            <p className="text-sm input flex justify-between w-full items-center">
                              {selectedFiles[documento.id]?.name}
                              <span
                                onClick={() => handleFileDelete(documento.id)}
                                className="ml-auto cursor-pointer"
                              >
                                <KeenIcon icon="trash" />
                              </span>
                            </p>
                          </div>
                        )}

                        {fileErrors[documento.id] && (
                          <p className="text-red-500 text-xs mt-1">Este documento es requerido.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                <button onClick={handleSaveContrato} className="btn btn-primary">
                  Guardar
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
      <TipoContratoModal
        open={tipoContratoModal}
        onClose={handleTipoContratoModalClose}
        onSave={fetchTipoContratos}
      />

      <ModalLinksAntecedentes
        open={modalLinkAntecedentes}
        onClose={() => setModalLinkAntecedentes(false)}
      />

      <ModalInfoDocumentos
        open={modalInfoDocuemntos}
        onClose={() => setModalInfoDocumentos(false)}
      />

      <BancoModal open={bancoModal} onClose={() => setBancoModal(false)} onSave={fetchBancos} />

      <RolModal open={rolModal} onClose={handleRolModalClose} onSave={fetchRoles} />
    </Fragment>
  );
};

export { ContratacionPage };
