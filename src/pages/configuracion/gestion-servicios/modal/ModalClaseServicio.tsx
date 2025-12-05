import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, ModalContent, ModalBody, ModalHeader, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { useSnackbar } from 'notistack';

interface ModalClaseProps {
  open: boolean;
  data?: any;
  onClose: () => void;
  onSave?: () => void;
}

const ModalClaseServicio = ({ open, data, onClose, onSave }: ModalClaseProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pucClase, setPucClase] = useState('');
  const [pucGrupos, setPucGrupos] = useState('');
  const [pucCuenta, setPucCuenta] = useState('');
  const [pucSubCuenta, setPucSubCuenta] = useState('');
  const [nombreSubCuenta, setNombreSubCuenta] = useState('');
  const [codigo, setCodigo] = useState('');

  const [clasesPuc, setClasesPuc] = useState<any[]>([]);
  const [gruposPuc, setGruposPuc] = useState<any[]>([]);
  const [cuentasPuc, setCuentasPuc] = useState<any[]>([]);
  const [subCuentasPuc, setSubCuentasPuc] = useState<any[]>([]);

  const [errors, setErrors] = useState<any>({});

  /* ------------------------------
     GENERAR CÓDIGO AUTOMÁTICO
  ------------------------------ */

  const generarCodigoPropio = () => {
    if (subCuentasPuc.length === 0) return "001";

    const max = Math.max(
      ...subCuentasPuc
        .map((sc) => Number(sc.codigo))
        .filter((n) => !isNaN(n))
    );

    return (max + 1).toString().padStart(3, "0");
  };

  const handleSelectSubCuentaPUC = (value: string) => {
    setPucSubCuenta(value);

    if (value) {
      setNombreSubCuenta("");
      setCodigo("");
    }
  };

  const handleNombreSubCuentaPropia = (value: string) => {
    setNombreSubCuenta(value);

    if (value.trim().length > 0) {
      setPucSubCuenta("");
      setCodigo("");
    }
  };

  // Generar código automáticamente si es propia
  useEffect(() => {
    const esPropia = nombreSubCuenta.trim() && !pucSubCuenta;

    if (esPropia) {
      const codigoGenerado = generarCodigoPropio();
      setCodigo(codigoGenerado);
    }
  }, [nombreSubCuenta, pucSubCuenta, subCuentasPuc]);

  /* ---------------------------------
     Cargar selects
  -----------------------------------*/

  const fetchSelects = async () => {
    try {
      const clasesRes = await axios.get('clases');
      setClasesPuc(clasesRes.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar clases PUC', { variant: 'error' });
    }
  };

  // AL CAMBIAR PUC CLASE
  useEffect(() => {
    if (!pucClase) {
      setGruposPuc([]);
      setPucGrupos('');
      setCuentasPuc([]);
      setPucCuenta('');
      setSubCuentasPuc([]);
      setPucSubCuenta('');
      return;
    }

    axios
      .get(`cuentas_by_id/${pucClase}`)
      .then((res) => {
        setGruposPuc(res.data);
        setPucGrupos('');
        setCuentasPuc([]);
        setPucCuenta('');
        setSubCuentasPuc([]);
        setPucSubCuenta('');
      })
      .catch(() => enqueueSnackbar('Error al cargar grupos PUC', { variant: 'error' }));
  }, [pucClase]);

  // AL CAMBIAR GRUPO
  useEffect(() => {
    if (!pucGrupos) {
      setCuentasPuc([]);
      setPucCuenta('');
      setSubCuentasPuc([]);
      setPucSubCuenta('');
      return;
    }

    axios
      .get(`cuentas_by_id/${pucGrupos}`)
      .then((res) => {
        setCuentasPuc(res.data);
        setPucCuenta('');
        setSubCuentasPuc([]);
        setPucSubCuenta('');
      })
      .catch(() => enqueueSnackbar('Error al cargar cuentas PUC', { variant: 'error' }));
  }, [pucGrupos]);

  // AL CAMBIAR CUENTA
  useEffect(() => {
    if (!pucCuenta) {
      setSubCuentasPuc([]);
      setPucSubCuenta('');
      return;
    }

    axios
      .get(`subcuentas_by_code?codigo=${pucCuenta}`)
      .then((res) => {
        setSubCuentasPuc(res.data);
        setPucSubCuenta('');
      })
      .catch(() => enqueueSnackbar('Error al cargar subcuentas PUC', { variant: 'error' }));
  }, [pucCuenta]);

  // AL SELECCIONAR SUBCUENTA → PONER CÓDIGO
  useEffect(() => {
    if (!pucSubCuenta) {
      setCodigo('');
      return;
    }

    const sc = subCuentasPuc.find((s) => s.id.toString() === pucSubCuenta.toString());
    if (sc) setCodigo(sc.codigo);
  }, [pucSubCuenta, subCuentasPuc]);

  // Cargar data al abrir
  useEffect(() => {
    if (open) {
      fetchSelects();

      if (data) {
        setNombre(data.nombre || '');
        setDescripcion(data.descripcion || '');
        setPucClase(data.pucClase || '');
        setPucGrupos(data.pucGrupos || '');
        setPucCuenta(data.pucCuenta || '');
        setPucSubCuenta(data.pucSubCuenta || '');
        setNombreSubCuenta(data.nombreSubCuenta || '');
        setCodigo(data.codigo || '');
      } else {
        setNombre('');
        setDescripcion('');
        setPucClase('');
        setPucGrupos('');
        setPucCuenta('');
        setPucSubCuenta('');
        setNombreSubCuenta('');
        setCodigo('');
      }

      setErrors({});
    }
  }, [open, data]);

  /* -----------------------------
     VALIDACIÓN
  ------------------------------ */

  const validate = () => {
    const newErrors: any = {};

    const esPropia = nombreSubCuenta.trim() && !pucSubCuenta;

    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es requerida';
    if (!pucClase) newErrors.pucClase = 'Selecciona una clase PUC';
    if (!pucGrupos) newErrors.pucGrupos = 'Selecciona un grupo PUC';
    if (!pucCuenta) newErrors.pucCuenta = 'Selecciona una cuenta PUC';

    if (!pucSubCuenta && !nombreSubCuenta.trim()) {
      newErrors.subcuenta = 'Debes elegir una subcuenta PUC o crear una propia';
    }

    // Si es PUC → exigir código
    if (!esPropia && !codigo.trim()) {
      newErrors.codigo = 'Código requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -----------------------------
     GUARDAR
  ------------------------------ */

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      nombreClaseServicio: nombre,
      descripcion,
      idClaseCuenta: pucClase,
      cuentas: pucCuenta,
      grupos: pucGrupos,
      subcuenta_id: pucSubCuenta || null,
      nombreSubcuentaPropia: nombreSubCuenta || null,
      codigo
    };

    try {
      if (data) {
        await axios.put(`clase/${data.id}`, payload);
        enqueueSnackbar('Clase de servicio actualizada', { variant: 'success' });
      } else {
        await axios.post('store_clase_servicio', payload);
        enqueueSnackbar('Clase de servicio creada', { variant: 'success' });
      }

      onSave && onSave();
      onClose();
    } catch (error) {
      enqueueSnackbar('Error al guardar la clase de servicio', { variant: 'error' });
    }
  };

  /* -----------------------------
     RENDER
  ------------------------------ */

  const esPropia = nombreSubCuenta.trim() && !pucSubCuenta;

  return (
    <Modal open={open}>
      <ModalContent className="max-w-[600px] top-[10%] p-4">
        <ModalHeader>
          <ModalTitle>{data ? 'Editar Clase de Servicio' : 'Nueva Clase de Servicio'}</ModalTitle>
          <button className="btn btn-sm btn-icon btn-light btn-clear" onClick={onClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>

        <ModalBody className="grid gap-3 px-0 py-5">

          {/* Nombre */}
          <div>
            <label className="block mb-1 text-sm font-medium">Nombre Clase Servicio</label>
            <input
              type="text"
              className="input border rounded-md w-full p-2"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block mb-1 text-sm font-medium">Descripción</label>
            <textarea
              rows={2}
              className="textarea border rounded-md w-full p-2"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            {errors.descripcion && <p className="text-red-500 text-xs">{errors.descripcion}</p>}
          </div>

          {/* PUC Clase */}
          <div>
            <label className="block mb-1 text-sm font-medium">Puc Clase</label>
            <select
              className="input border rounded-md w-full p-2"
              value={pucClase}
              onChange={(e) => setPucClase(e.target.value)}
            >
              <option value="">Selecciona Clase</option>
              {clasesPuc.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombreClase}
                </option>
              ))}
            </select>
            {errors.pucClase && <p className="text-red-500 text-xs">{errors.pucClase}</p>}
          </div>

          {/* PUC Grupos */}
          <div>
            <label className="block mb-1 text-sm font-medium">Puc Grupos</label>
            <select
              className="input border rounded-md w-full p-2"
              value={pucGrupos}
              onChange={(e) => setPucGrupos(e.target.value)}
            >
              <option value="">Selecciona Grupo</option>
              {gruposPuc.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.titulo}
                </option>
              ))}
            </select>
            {errors.pucGrupos && <p className="text-red-500 text-xs">{errors.pucGrupos}</p>}
          </div>

          {/* PUC Cuenta */}
          <div>
            <label className="block mb-1 text-sm font-medium">Puc Cuenta</label>
            <select
              className="input border rounded-md w-full p-2"
              value={pucCuenta}
              onChange={(e) => setPucCuenta(e.target.value)}
            >
              <option value="">Selecciona Cuenta</option>
              {cuentasPuc.map((cu) => (
                <option key={cu.id} value={cu.id}>
                  {cu.titulo}
                </option>
              ))}
            </select>
            {errors.pucCuenta && <p className="text-red-500 text-xs">{errors.pucCuenta}</p>}
          </div>

          {/* PUC SubCuenta */}
          <div>
            <label className="block mb-1 text-sm font-medium">Puc SubCuenta</label>
            <select
              className="input border rounded-md w-full p-2"
              value={pucSubCuenta}
              onChange={(e) => handleSelectSubCuentaPUC(e.target.value)}
            >
              <option value="">Selecciona SubCuenta</option>
              {subCuentasPuc.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.nombreSubcuentaPropia?.trim() || sc.codigo}
                </option>
              ))}
            </select>

            {errors.subcuenta && !esPropia && (
              <p className="text-red-500 text-xs">{errors.subcuenta}</p>
            )}
          </div>

          {/* Nombre SubCuenta Propia */}
          <div>
            <label className="block mb-1 text-sm font-medium">Nombre SubCuenta Propia</label>
            <input
              type="text"
              className="input border rounded-md w-full p-2"
              value={nombreSubCuenta}
              onChange={(e) => handleNombreSubCuentaPropia(e.target.value)}
            />
            {errors.subcuenta && esPropia && (
              <p className="text-red-500 text-xs">{errors.subcuenta}</p>
            )}
          </div>

          {/* Código → SOLO SI NO ES PROPIA */}
          {!esPropia && (
            <div>
              <label className="block mb-1 text-sm font-medium">Código</label>
              <input
                type="text"
                className="input border rounded-md w-full p-2"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              {errors.codigo && <p className="text-red-500 text-xs">{errors.codigo}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button className="btn btn-sm btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </div>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export { ModalClaseServicio };
