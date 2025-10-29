import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { KeenIcon } from '@/components/keenicons';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { useSnackbar } from 'notistack';
import { useEmpresaThemeContext } from '@/colores/EmpresaThemeProvider';

interface ModalProps {
  open: boolean;
  persona: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalPersonal = ({ open, persona, onClose, onSave }: ModalProps) => {
  const { styles } = useEmpresaThemeContext();
  const { enqueueSnackbar } = useSnackbar();

  // Campos del formulario
  const [primerNombre, setPrimerNombre] = useState('');
  const [segundoNombre, setSegundoNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [celular, setCelular] = useState('');
  const [porcentaje, setPorcentaje] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Cuando abres el modal, si es edición carga información
  useEffect(() => {
    if (persona) {
      setPrimerNombre(persona.nombre1 || '');
      setSegundoNombre(persona.segundo_nombre || '');
      setPrimerApellido(persona.apellido1 || '');
      setSegundoApellido(persona.segundo_apellido || '');
      setIdentificacion(persona.identificacion || '');
      setFechaNacimiento(persona.fechaNac || '');
      setCelular(persona.celular || persona.telefono || '');
      setPorcentaje(persona.porcentajeGanancia ?? 0);
      setDescripcion(persona.descripcion || '');
      setEmail(persona.email || '');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    } else {
      limpiarFormulario();
    }
  }, [persona, open]);

  // Limpia los campos
  const limpiarFormulario = () => {
    setPrimerNombre('');
    setSegundoNombre('');
    setPrimerApellido('');
    setSegundoApellido('');
    setIdentificacion('');
    setFechaNacimiento('');
    setCelular('');
    setPorcentaje(0);
    setDescripcion('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  // Validar campos
  const validar = () => {
    const e: any = {};
    if (!primerNombre.trim()) e.primerNombre = 'Primer nombre requerido';
    if (!primerApellido.trim()) e.primerApellido = 'Primer apellido requerido';
    if (!identificacion.trim()) e.identificacion = 'Identificación requerida';
    if (!email.trim()) e.email = 'Email requerido';
    // contraseña necesaria solo al crear; si se proporciona debe coincidir
    if (!persona && !password) e.password = 'Contraseña requerida';
    if (password && password !== confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Guardar o actualizar
  const handleSave = async () => {
    if (!validar()) return;
    setSaving(true);

    const payload: any = {
      nombre1: primerNombre,
      nombre2: segundoNombre || undefined,
      apellido1: primerApellido,
      apellido2: segundoApellido || undefined,
      identificacion,
      fechaNac: fechaNacimiento || undefined,
      celular: celular || undefined,
      porcentajeGanancia: porcentaje,
      descripcion: descripcion || undefined,
      email
    };
    if (password) payload.contrasena = password;

    try {
      if (persona?.id) {
        await axios.put(`/responsable_servicios/${persona.id}`, payload);
        enqueueSnackbar('Personal actualizado correctamente', { variant: 'success' });
      } else {
        await axios.post(`/responsable_servicios`, payload);
        enqueueSnackbar('Personal guardado correctamente', { variant: 'success' });
      }

      if (onSave) await onSave();
      onClose();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Error al guardar personal', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Cerrar
  const handleClose = () => {
    limpiarFormulario();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>
            <KeenIcon icon="user" className="mr-2" />
            {persona ? 'Editar Personal' : 'Nuevo Personal'}
          </ModalTitle>
          <button
            className="btn btn-sm btn-icon btn-light btn-clear shrink-0"
            onClick={handleClose}
          >
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid grid-cols-1 md:grid-cols-2 gap-4 px-0 py-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Primer nombre</label>
            <input
              className={`input p-2 border ${errors.primerNombre ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Primer nombre"
              value={primerNombre}
              onChange={(e) => {
                setPrimerNombre(e.target.value);
                if (errors.primerNombre) setErrors((prev: any) => ({ ...prev, primerNombre: '' }));
              }}
            />
            {errors.primerNombre && (
              <p className="mt-1 text-sm text-red-500">{errors.primerNombre}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Segundo nombre</label>
            <input
              className="input p-2 rounded-md w-full"
              placeholder="Segundo nombre"
              value={segundoNombre}
              onChange={(e) => setSegundoNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Primer apellido</label>
            <input
              className={`input p-2 border ${errors.primerApellido ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Primer apellido"
              value={primerApellido}
              onChange={(e) => {
                setPrimerApellido(e.target.value);
                if (errors.primerApellido)
                  setErrors((prev: any) => ({ ...prev, primerApellido: '' }));
              }}
            />
            {errors.primerApellido && (
              <p className="mt-1 text-sm text-red-500">{errors.primerApellido}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Segundo apellido</label>
            <input
              className="input p-2 rounded-md w-full"
              placeholder="Segundo apellido"
              value={segundoApellido}
              onChange={(e) => setSegundoApellido(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Identificación</label>
            <input
              className={`input p-2 border ${errors.identificacion ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Identificación"
              value={identificacion}
              onChange={(e) => {
                setIdentificacion(e.target.value);
                if (errors.identificacion)
                  setErrors((prev: any) => ({ ...prev, identificacion: '' }));
              }}
            />
            {errors.identificacion && (
              <p className="mt-1 text-sm text-red-500">{errors.identificacion}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Fecha de nacimiento</label>
            <input
              type="date"
              className={`input p-2 rounded-md w-full`}
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Celular</label>
            <input
              className={`input p-2 border ${errors.celular ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Celular"
              value={celular}
              onChange={(e) => {
                setCelular(e.target.value);
                if (errors.celular) setErrors((prev: any) => ({ ...prev, celular: '' }));
              }}
            />
            {errors.celular && <p className="mt-1 text-sm text-red-500">{errors.celular}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">% Ganancia</label>
            <input
              className={`input p-2 border ${errors.porcentaje ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              type="number"
              placeholder="% Ganancia"
              value={porcentaje}
              onChange={(e) => {
                setPorcentaje(Number(e.target.value));
                if (errors.porcentaje) setErrors((prev: any) => ({ ...prev, porcentaje: '' }));
              }}
            />
            {errors.porcentaje && <p className="mt-1 text-sm text-red-500">{errors.porcentaje}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea
              className={`input p-2 border ${errors.descripcion ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                if (errors.descripcion) setErrors((prev: any) => ({ ...prev, descripcion: '' }));
              }}
              rows={3}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              className={`input p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev: any) => ({ ...prev, email: '' }));
              }}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Contraseña</label>
            <input
              type="password"
              className={`input p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev: any) => ({ ...prev, password: '' }));
              }}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Confirmar contraseña</label>
            <input
              type="password"
              className={`input p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md w-full`}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev: any) => ({ ...prev, confirmPassword: '' }));
              }}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 px-4 mt-2">
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalPersonal;
