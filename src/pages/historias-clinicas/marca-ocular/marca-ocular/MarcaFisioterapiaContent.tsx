import React, { useState, useRef, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils';

export interface FisioterapiaProps {
  reload?: boolean;
  pacienteId?: string;
  consultaId?: string;
}

interface MarcaFisioterapia {
  id: string;
  x: number;
  y: number;
  tipo: string;
  color: string;
  intensidad?: 'leve' | 'moderado' | 'severo';
  descripcion?: string;
  fecha: string;
}

const MarcaFisioterapiaContent = ({ reload, pacienteId, consultaId }: FisioterapiaProps) => {
    // --- MODAL HANDLERS ---
    const handleDescripcionModalSave = () => {
      if (!pendingMark) return;
      const { x, y } = pendingMark;
      const nuevaMarca: MarcaFisioterapia = {
        id: `marca-${Date.now()}`,
        x,
        y,
        tipo: tipoMarcaSeleccionado,
        color: colorMarca,
        intensidad: intensidadSeleccionada,
        descripcion: descripcionTemp || undefined,
        fecha: new Date().toLocaleString('es-ES')
      };
      setMarcas((prev) => [...prev, nuevaMarca]);
      setShowDescripcionModal(false);
      setDescripcionTemp('');
      setPendingMark(null);
      setCambiosSinGuardar(true);
    };

    const handleDescripcionModalCancel = () => {
      setShowDescripcionModal(false);
      setDescripcionTemp('');
      setPendingMark(null);
    };
  const [marcas, setMarcas] = useState<MarcaFisioterapia[]>([]);
  const [tipoMarcaSeleccionado, setTipoMarcaSeleccionado] = useState<string>('dolor');
  const [colorMarca, setColorMarca] = useState<string>('#ef4444');
  const [intensidadSeleccionada, setIntensidadSeleccionada] = useState<'leve' | 'moderado' | 'severo'>('moderado');
  // Modal de descripción por marca
  const [showDescripcionModal, setShowDescripcionModal] = useState(false);
  const [descripcionTemp, setDescripcionTemp] = useState<string>('');
  const [pendingMark, setPendingMark] = useState<{ x: number; y: number } | null>(null);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string | null>(null);

  // Estados para backend
  const [guardando, setGuardando] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState<boolean>(false);
  const [registroId, setRegistroId] = useState<string | null>(null);

  const cuerpoRef = useRef<HTMLDivElement>(null);

  // Tipos de marcas disponibles para fisioterapia
  const tiposMarcas = [
    { value: 'dolor', label: 'Dolor', color: '#ef4444' },
    { value: 'lesion', label: 'Lesión', color: '#f59e0b' },
    { value: 'inflamacion', label: 'Inflamación', color: '#ec4899' },
    { value: 'contractura', label: 'Contractura', color: '#8b5cf6' },
    { value: 'tension', label: 'Tensión', color: '#3b82f6' },
    { value: 'tratamiento', label: 'Punto de Tratamiento', color: '#10b981' },
    { value: 'cicatriz', label: 'Cicatriz', color: '#6366f1' },
    { value: 'otro', label: 'Otro', color: '#64748b' }
  ];

  // Intensidades
  const intensidades = [
    { value: 'leve', label: 'Leve', icon: '1', color: '#10b981' },
    { value: 'moderado', label: 'Moderado', icon: '2', color: '#f59e0b' },
    { value: 'severo', label: 'Severo', icon: '3', color: '#ef4444' }
  ];

  const handleClickCuerpo = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPendingMark({ x, y });
    setDescripcionTemp('');
    setShowDescripcionModal(true);
  };

  const eliminarMarca = (id: string) => {
    setMarcas((prev) => prev.filter((marca) => marca.id !== id));
    setMarcaSeleccionada(null);
    setCambiosSinGuardar(true);
  };

  const limpiarTodasLasMarcas = () => {
    if (cambiosSinGuardar) {
      const confirmar = window.confirm(
        '⚠️ Tienes cambios sin guardar. ¿Estás seguro de que deseas limpiar todas las marcas?'
      );
      if (!confirmar) return;
    }

    setMarcas([]);
    setMarcaSeleccionada(null);
    setCambiosSinGuardar(false);
    
    setMensaje({
      tipo: 'info',
      texto: '🗑️ Todas las marcas han sido eliminadas'
    });

    setTimeout(() => setMensaje(null), 3000);
  };

  const seleccionarMarca = (id: string) => {
    setMarcaSeleccionada(id);
  };

  const cambiarTipoMarca = (tipo: string) => {
    setTipoMarcaSeleccionado(tipo);
    const tipoEncontrado = tiposMarcas.find((t) => t.value === tipo);
    if (tipoEncontrado) {
      setColorMarca(tipoEncontrado.color);
    }
  };

  const obtenerTamañoMarca = (intensidad?: string) => {
    switch (intensidad) {
      case 'leve':
        return 'w-4 h-4';
      case 'moderado':
        return 'w-6 h-6';
      case 'severo':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };


  const guardarMarcas = async () => {
    setGuardando(true);
    setMensaje(null);

    try {
      const datos = {
        pacienteId: pacienteId || 'PACIENTE_DEFAULT',
        consultaId: consultaId || undefined,
        marcas: marcas,
        tipo: 'fisioterapia',
        fechaActualizacion: new Date().toISOString()
      };

      const response = await fetch('/api/marcas-fisioterapia', {
        method: registroId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        throw new Error('Error al guardar las marcas');
      }

      const resultado = await response.json();
      
      if (resultado.id) {
        setRegistroId(resultado.id);
      }

      setMensaje({
        tipo: 'success',
        texto: `✅ Marcas de fisioterapia guardadas exitosamente (${marcas.length} marca${marcas.length !== 1 ? 's' : ''})`
      });
      
      setCambiosSinGuardar(false);
      setTimeout(() => setMensaje(null), 3000);

    } catch (error) {
      console.error('Error al guardar marcas:', error);
      setMensaje({
        tipo: 'error',
        texto: '❌ Error al guardar las marcas. Intenta nuevamente.'
      });
    } finally {
      setGuardando(false);
    }
  };

  const cargarMarcas = async () => {
    if (!pacienteId) {
      setMensaje({
        tipo: 'error',
        texto: '⚠️ No hay ID de paciente para cargar marcas'
      });
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const response = await fetch(
        `/api/marcas-fisioterapia/${pacienteId}${consultaId ? `?consultaId=${consultaId}` : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al cargar las marcas');
      }

      const datos = await response.json();

      setMarcas(datos.marcas || []);
      
      if (datos.id) {
        setRegistroId(datos.id);
      }

      setMensaje({
        tipo: 'success',
        texto: `📥 Marcas cargadas exitosamente (${datos.marcas?.length || 0} marca${datos.marcas?.length !== 1 ? 's' : ''})`
      });

      setCambiosSinGuardar(false);
      setTimeout(() => setMensaje(null), 3000);

    } catch (error) {
      console.error('Error al cargar marcas:', error);
      setMensaje({
        tipo: 'info',
        texto: '📋 No hay marcas previas para este paciente'
      });
      setTimeout(() => setMensaje(null), 3000);
    } finally {
      setCargando(false);
    }
  };

  const exportarMarcasJSON = () => {
    const datos = {
      pacienteId: pacienteId || 'PACIENTE_DEFAULT',
      consultaId: consultaId,
      tipo: 'fisioterapia',
      marcas: marcas,
      fecha: new Date().toISOString()
    };

    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marcas-fisioterapia-${pacienteId || 'paciente'}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setMensaje({
      tipo: 'success',
      texto: '💾 Archivo JSON descargado exitosamente'
    });

    setTimeout(() => setMensaje(null), 3000);
  };

  useEffect(() => {
    if (marcas.length > 0) {
      setCambiosSinGuardar(true);
    }
  }, [marcas]);

  useEffect(() => {
    if (pacienteId) {
      cargarMarcas();
    }
  }, [pacienteId, consultaId]);

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Mensajes de estado */}
      {mensaje && (
        <div
          className={`alert ${
            mensaje.tipo === 'success'
              ? 'alert-success'
              : mensaje.tipo === 'error'
              ? 'alert-danger'
              : 'alert-info'
          } flex items-center gap-2`}
        >
          <KeenIcon
            icon={
              mensaje.tipo === 'success'
                ? 'check-circle'
                : mensaje.tipo === 'error'
                ? 'information-2'
                : 'information'
            }
          />
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="btn btn-xs btn-icon btn-light ml-auto"
          >
            <KeenIcon icon="cross" />
          </button>
        </div>
      )}

      {/* Información del paciente */}
      {pacienteId && (
        <div className="card bg-light">
          <div className="card-body flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <KeenIcon icon="user" className="text-primary text-xl" />
              <div>
                <span className="text-sm font-semibold text-gray-900">Paciente ID:</span>
                <span className="text-sm text-gray-700 ml-2">{pacienteId}</span>
              </div>
              {consultaId && (
                <>
                  <div className="border-l border-gray-300 h-6 mx-2"></div>
                  <div>
                    <span className="text-sm font-semibold text-gray-900">Consulta ID:</span>
                    <span className="text-sm text-gray-700 ml-2">{consultaId}</span>
                  </div>
                </>
              )}
            </div>
            {registroId && (
              <span className="badge badge-sm badge-success">
                <KeenIcon icon="check" />
                Guardado
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card de herramientas */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Herramientas de Marcación - Fisioterapia</h3>
        </div>
        <div className="card-body">
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Selección de tipo de marca */}
            <div className="flex flex-col gap-2.5">
              <label className="form-label text-sm font-semibold">Tipo de Marca</label>
              <div className="grid grid-cols-2 gap-2">
                {tiposMarcas.map((tipo) => (
                  <button
                    key={tipo.value}
                    onClick={() => cambiarTipoMarca(tipo.value)}
                    className={`btn btn-sm ${
                      tipoMarcaSeleccionado === tipo.value ? 'btn-primary' : 'btn-light'
                    } flex items-center gap-2 justify-start`}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tipo.color }}
                    ></span>
                    <span className="text-xs">{tipo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de intensidad */}
            <div className="flex flex-col gap-2.5">
              <label className="form-label text-sm font-semibold">Intensidad</label>
              <div className="grid grid-cols-3 gap-2">
                {intensidades.map((intensidad) => (
                  <button
                    key={intensidad.value}
                    onClick={() => setIntensidadSeleccionada(intensidad.value as any)}
                    className={`btn btn-sm ${
                      intensidadSeleccionada === intensidad.value ? 'btn-primary' : 'btn-light'
                    } flex flex-col items-center gap-1`}
                  >
                    <span className="text-lg font-bold">{intensidad.icon}</span>
                    <span className="text-2xs">{intensidad.label}</span>
                  </button>
                ))}
              </div>
            </div>



                {/* Modal para descripción de marca (fuera del grid) */}
                {showDescripcionModal && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      background: '#fff',
                      borderRadius: 8,
                      padding: 24,
                      minWidth: 320,
                      boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
                    }}>
                      <h3 style={{ marginBottom: 12 }}>Descripción de la marca (opcional)</h3>
                      <textarea
                        autoFocus
                        rows={3}
                        style={{ width: '100%', marginBottom: 16, resize: 'vertical' }}
                        placeholder="Describe la observación o tratamiento..."
                        value={descripcionTemp}
                        onChange={e => setDescripcionTemp(e.target.value)}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button onClick={handleDescripcionModalCancel} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5' }}>Cancelar</button>
                        <button onClick={handleDescripcionModalSave} style={{ padding: '6px 16px', borderRadius: 4, border: 'none', background: '#2563eb', color: '#fff' }}>Guardar</button>
                      </div>
                    </div>
                  </div>
                )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex gap-2">
              <button 
                onClick={guardarMarcas} 
                className="btn btn-sm btn-primary"
                disabled={guardando || marcas.length === 0}
              >
                <KeenIcon icon={guardando ? 'loading' : 'check'} />
                {guardando ? 'Guardando...' : 'Guardar Marcas'}
              </button>

              <button 
                onClick={cargarMarcas} 
                className="btn btn-sm btn-light"
                disabled={cargando || !pacienteId}
              >
                <KeenIcon icon={cargando ? 'loading' : 'cloud-download'} />
                {cargando ? 'Cargando...' : 'Cargar Marcas'}
              </button>

              <button 
                onClick={exportarMarcasJSON} 
                className="btn btn-sm btn-info"
                disabled={marcas.length === 0}
              >
                <KeenIcon icon="file-down" />
                Exportar JSON
              </button>

              <button 
                onClick={limpiarTodasLasMarcas} 
                className="btn btn-sm btn-danger"
              >
                <KeenIcon icon="trash" />
                Limpiar todo
              </button>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {cambiosSinGuardar && (
                <span className="badge badge-warning badge-sm">
                  <KeenIcon icon="information-2" className="text-xs" />
                  Cambios sin guardar
                </span>
              )}
              <div className="text-2sm text-gray-600">
                Total de marcas: <span className="font-semibold text-primary">{marcas.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de visualización del cuerpo humano */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <KeenIcon icon="user" className="text-primary" />
            Cuerpo Humano - Vista Frontal
            <span className="badge badge-sm badge-success badge-outline">Fisioterapia</span>
          </h3>
          <div className="text-sm text-gray-600">
            Marcas: <span className="font-semibold text-primary">{marcas.length}</span>
          </div>
        </div>
        <div className="card-body">
          <div
            ref={cuerpoRef}
            onClick={handleClickCuerpo}
            className="relative w-full max-w-md mx-auto bg-white rounded-lg border-4 border-gray-300 cursor-crosshair hover:border-primary transition-colors shadow-lg overflow-hidden"
            style={{ height: '600px' }}
          >
            {/* Imagen del cuerpo humano */}
            <img 
              src={toAbsoluteUrl('/media/images/cuerpoHumano.png')}
              alt="Cuerpo Humano"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable="false"
            />

            {/* Overlay para mejorar visibilidad de marcas */}
            <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors pointer-events-none"></div>

            {/* Marcas */}
            {marcas.map((marca) => (
              <div
                key={marca.id}
                onClick={(e) => {
                  e.stopPropagation();
                  seleccionarMarca(marca.id);
                }}
                className={`absolute ${obtenerTamañoMarca(marca.intensidad)} rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-xl hover:scale-150 transition-transform z-10 ${
                  marcaSeleccionada === marca.id
                    ? 'ring-4 ring-blue-500 scale-150'
                    : ''
                }`}
                style={{
                  left: `${marca.x}%`,
                  top: `${marca.y}%`,
                  backgroundColor: marca.color,
                  border: '3px solid white',
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}
                title={`${marca.tipo} - ${marca.intensidad} - ${marca.fecha}`}
              >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                
                {/* Indicador de intensidad */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] font-bold text-gray-900 shadow">
                  {marca.intensidad === 'leve' ? '1' : marca.intensidad === 'moderado' ? '2' : '3'}
                </div>
              </div>
            ))}
          </div>

          {/* Lista de marcas */}
          {marcas.length > 0 && (
            <div className="mt-5 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">Marcas registradas:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {marcas.map((marca) => (
                  <div
                    key={marca.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      marcaSeleccionada === marca.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: marca.color }}
                      ></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">{marca.tipo}</span>
                          <span className={`badge badge-xs ${
                            marca.intensidad === 'leve' ? 'badge-success' :
                            marca.intensidad === 'moderado' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {marca.intensidad}
                          </span>
                        </div>
                        {marca.descripcion && (
                          <p className="text-xs text-gray-600 mt-1">{marca.descripcion}</p>
                        )}
                        <p className="text-2xs text-gray-500 mt-1">{marca.fecha}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => eliminarMarca(marca.id)}
                      className="btn btn-xs btn-icon btn-light hover:btn-danger"
                    >
                      <KeenIcon icon="trash" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card de instrucciones */}
      <div className="card bg-light">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <KeenIcon icon="information-2" className="text-info text-xl" />
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-gray-900">Instrucciones de uso:</h4>
              <ul className="text-2sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Selecciona el tipo de marca (dolor, lesión, contractura, etc.)</li>
                <li>Elige la intensidad: Leve (1), Moderado (2), Severo (3)</li>
                <li>Opcionalmente, agrega una descripción del área o tratamiento</li>
                <li>Haz clic directamente sobre la imagen del cuerpo en la ubicación exacta</li>
                <li>Las marcas varían de tamaño según la intensidad seleccionada</li>
                <li>Haz clic en una marca existente para seleccionarla (se resaltará con anillo azul)</li>
                <li>Usa el botón de basura junto a cada marca para eliminarla</li>
                <li>Las marcas se registran automáticamente con fecha, hora y todos los detalles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcaFisioterapiaContent;
