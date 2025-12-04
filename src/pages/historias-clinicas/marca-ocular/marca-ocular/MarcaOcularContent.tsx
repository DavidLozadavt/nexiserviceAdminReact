import React, { useState, useRef, useEffect } from 'react';
import { KeenIcon } from '@/components';

export interface modalProps {
  reload?: boolean;
  pacienteId?: string; 
  consultaId?: string; 
}

interface Marca {
  id: string;
  x: number;
  y: number;
  tipo: string;
  color: string;
  descripcion?: string;
  fecha: string;
}

interface MarcasOculares {
  ojoDerecho: Marca[];
  ojoIzquierdo: Marca[];
}

interface MarcaOcularBackend {
  id?: string;
  pacienteId?: string;
  consultaId?: string;
  ojo: 'derecho' | 'izquierdo';
  marcas: Marca[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
  medicoId?: string;
}

const MarcaOcularContent = ({ reload, pacienteId, consultaId }: modalProps) => {
  const [marcas, setMarcas] = useState<MarcasOculares>({
    ojoDerecho: [],
    ojoIzquierdo: []
  });

  const [tipoMarcaSeleccionado, setTipoMarcaSeleccionado] = useState<string>('anomalia');
  const [colorMarca, setColorMarca] = useState<string>('#ef4444');
  const [descripcionMarca, setDescripcionMarca] = useState<string>('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<{ ojo: 'ojoDerecho' | 'ojoIzquierdo'; id: string } | null>(null);
  
  // Estados para backend
  const [guardando, setGuardando] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState<boolean>(false);
  const [registroId, setRegistroId] = useState<string | null>(null);

  const ojoDerechoRef = useRef<HTMLDivElement>(null);
  const ojoIzquierdoRef = useRef<HTMLDivElement>(null);

  const tiposMarcas = [
    { value: 'anomalia', label: 'Anomalía', color: '#ef4444' },
    { value: 'lesion', label: 'Lesión', color: '#f59e0b' },
    { value: 'mancha', label: 'Mancha', color: '#8b5cf6' },
    { value: 'inflamacion', label: 'Inflamación', color: '#ec4899' },
    { value: 'cicatriz', label: 'Cicatriz', color: '#6366f1' },
    { value: 'otro', label: 'Otro', color: '#10b981' }
  ];

  const handleClickOjo = (event: React.MouseEvent<HTMLDivElement>, ojo: 'ojoDerecho' | 'ojoIzquierdo') => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const nuevaMarca: Marca = {
      id: `${ojo}-${Date.now()}`,
      x,
      y,
      tipo: tipoMarcaSeleccionado,
      color: colorMarca,
      descripcion: descripcionMarca,
      fecha: new Date().toLocaleString('es-ES')
    };

    setMarcas((prev) => ({
      ...prev,
      [ojo]: [...prev[ojo], nuevaMarca]
    }));

    setDescripcionMarca('');
  };

  const eliminarMarca = (ojo: 'ojoDerecho' | 'ojoIzquierdo', id: string) => {
    setMarcas((prev) => ({
      ...prev,
      [ojo]: prev[ojo].filter((marca) => marca.id !== id)
    }));
    setMarcaSeleccionada(null);
  };

  const limpiarTodasLasMarcas = () => {
    if (cambiosSinGuardar) {
      const confirmar = window.confirm(
        '⚠️ Tienes cambios sin guardar. ¿Estás seguro de que deseas limpiar todas las marcas?'
      );
      if (!confirmar) return;
    }

    setMarcas({
      ojoDerecho: [],
      ojoIzquierdo: []
    });
    setMarcaSeleccionada(null);
    setCambiosSinGuardar(false);
    
    setMensaje({
      tipo: 'info',
      texto: '🗑️ Todas las marcas han sido eliminadas'
    });

    setTimeout(() => setMensaje(null), 3000);
  };

  const seleccionarMarca = (ojo: 'ojoDerecho' | 'ojoIzquierdo', id: string) => {
    setMarcaSeleccionada({ ojo, id });
  };

  const obtenerMarca = (ojo: 'ojoDerecho' | 'ojoIzquierdo', id: string) => {
    return marcas[ojo].find((m) => m.id === id);
  };

  const cambiarTipoMarca = (tipo: string) => {
    setTipoMarcaSeleccionado(tipo);
    const tipoEncontrado = tiposMarcas.find((t) => t.value === tipo);
    if (tipoEncontrado) {
      setColorMarca(tipoEncontrado.color);
    }
  };

  const prepararDatosParaBackend = (): MarcaOcularBackend[] => {
    const datos: MarcaOcularBackend[] = [];

    if (marcas.ojoDerecho.length > 0) {
      datos.push({
        id: registroId || undefined,
        pacienteId: pacienteId || 'PACIENTE_DEFAULT',
        consultaId: consultaId || undefined,
        ojo: 'derecho',
        marcas: marcas.ojoDerecho,
        fechaActualizacion: new Date().toISOString()
      });
    }

    if (marcas.ojoIzquierdo.length > 0) {
      datos.push({
        id: registroId || undefined,
        pacienteId: pacienteId || 'PACIENTE_DEFAULT',
        consultaId: consultaId || undefined,
        ojo: 'izquierdo',
        marcas: marcas.ojoIzquierdo,
        fechaActualizacion: new Date().toISOString()
      });
    }

    return datos;
  };

  
  const guardarMarcas = async () => {
    setGuardando(true);
    setMensaje(null);

    try {
      const datos = prepararDatosParaBackend();

      const response = await fetch('/api/marcas-oculares', {
        method: registroId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
    
        },
        body: JSON.stringify({
          datos,
          pacienteId,
          consultaId,
          medicoId: 'ID_DEL_MEDICO', 
        })
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
        texto: `✅ Marcas guardadas exitosamente (${datos.length} ojo${datos.length > 1 ? 's' : ''})`
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
        `/api/marcas-oculares/${pacienteId}${consultaId ? `?consultaId=${consultaId}` : ''}`,
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

      const datos: MarcaOcularBackend[] = await response.json();

      const nuevasMarcas: MarcasOculares = {
        ojoDerecho: [],
        ojoIzquierdo: []
      };

      datos.forEach((registro) => {
        if (registro.ojo === 'derecho') {
          nuevasMarcas.ojoDerecho = registro.marcas;
        } else if (registro.ojo === 'izquierdo') {
          nuevasMarcas.ojoIzquierdo = registro.marcas;
        }

        if (registro.id) {
          setRegistroId(registro.id);
        }
      });

      setMarcas(nuevasMarcas);
      
      const totalMarcas = nuevasMarcas.ojoDerecho.length + nuevasMarcas.ojoIzquierdo.length;
      setMensaje({
        tipo: 'success',
        texto: `📥 Marcas cargadas exitosamente (${totalMarcas} marca${totalMarcas !== 1 ? 's' : ''})`
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
    const datos = prepararDatosParaBackend();
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marcas-oculares-${pacienteId || 'paciente'}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setMensaje({
      tipo: 'success',
      texto: '💾 Archivo JSON descargado exitosamente'
    });

    setTimeout(() => setMensaje(null), 3000);
  };

  useEffect(() => {
    const totalMarcas = marcas.ojoDerecho.length + marcas.ojoIzquierdo.length;
    if (totalMarcas > 0) {
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
          <h3 className="card-title">Herramientas de Marcación</h3>
        </div>
        <div className="card-body">
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Selección de tipo de marca */}
            <div className="flex flex-col gap-2.5">
              <label className="form-label text-sm font-semibold">Tipo de Marca</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {tiposMarcas.map((tipo) => (
                  <button
                    key={tipo.value}
                    onClick={() => cambiarTipoMarca(tipo.value)}
                    className={`btn btn-sm ${
                      tipoMarcaSeleccionado === tipo.value ? 'btn-primary' : 'btn-light'
                    } flex items-center gap-2`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tipo.color }}
                    ></span>
                    {tipo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción opcional */}
            <div className="flex flex-col gap-2.5">
              <label className="form-label text-sm font-semibold">Descripción (Opcional)</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Describe la observación..."
                value={descripcionMarca}
                onChange={(e) => setDescripcionMarca(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex gap-2">

              <button 
                onClick={guardarMarcas} 
                className="btn btn-sm btn-primary"
                disabled={guardando || marcas.ojoDerecho.length + marcas.ojoIzquierdo.length === 0}
              >
                <KeenIcon icon={guardando ? 'loading' : 'check'} />
                {guardando ? 'Guardando...' : 'Guardar Marcas'}
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
                Total de marcas: <span className="font-semibold text-primary">{marcas.ojoDerecho.length + marcas.ojoIzquierdo.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de visualización de ojos */}
      <div className="grid lg:grid-cols-2 gap-5 lg:gap-7.5">
        {/* Ojo Derecho (ahora muestra la imagen invertida) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <KeenIcon icon="eye" className="text-primary" />
              Ojo Derecho
              <span className="badge badge-sm badge-success badge-outline">Vista Anatómica</span>
            </h3>
            <div className="text-sm text-gray-600">
              Marcas: <span className="font-semibold text-primary">{marcas.ojoDerecho.length}</span>
            </div>
          </div>
          <div className="card-body">
            <div
              ref={ojoDerechoRef}
              onClick={(e) => handleClickOjo(e, 'ojoDerecho')}
              className="relative w-full aspect-[4/3] bg-white rounded-lg border-4 border-gray-300 cursor-crosshair hover:border-primary transition-colors shadow-lg overflow-hidden"
            >
              {/* Imagen de fondo del ojo (invertida para simular ojo izquierdo) */}
              <img 
                src="https://lubristil.es/wp-content/uploads/2021/06/anatomia-ojo-salud-ocular-scaled-2048x1282.jpg.webp"
                alt="Anatomía del ojo derecho"
                className="w-full h-full object-cover pointer-events-none select-none scale-x-[-1]"
                draggable="false"
              />

              {/* Overlay para mejorar visibilidad de marcas */}
              <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors pointer-events-none"></div>

              {/* Marcas */}
              {marcas.ojoDerecho.map((marca) => (
                <div
                  key={marca.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    seleccionarMarca('ojoDerecho', marca.id);
                  }}
                  className={`absolute w-6 h-6 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-xl hover:scale-150 transition-transform z-10 ${
                    marcaSeleccionada?.ojo === 'ojoDerecho' && marcaSeleccionada?.id === marca.id
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
                  title={`${marca.tipo} - ${marca.fecha}`}
                >
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                  {/* Número de marca */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {marca.tipo}
                  </div>
                </div>
              ))}
            </div>

            {/* Lista de marcas del ojo derecho */}
            {marcas.ojoDerecho.length > 0 && (
              <div className="mt-5 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Marcas registradas:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {marcas.ojoDerecho.map((marca) => (
                    <div
                      key={marca.id}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        marcaSeleccionada?.ojo === 'ojoDerecho' && marcaSeleccionada?.id === marca.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: marca.color }}
                        ></span>
                        <div>
                          <span className="text-sm font-medium capitalize">{marca.tipo}</span>
                          {marca.descripcion && (
                            <p className="text-xs text-gray-600">{marca.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarMarca('ojoDerecho', marca.id)}
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

        {/* Ojo Izquierdo (ahora muestra la imagen normal) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <KeenIcon icon="eye" className="text-primary" />
              Ojo Izquierdo
              <span className="badge badge-sm badge-success badge-outline">Vista Anatómica</span>
            </h3>
            <div className="text-sm text-gray-600">
              Marcas: <span className="font-semibold text-primary">{marcas.ojoIzquierdo.length}</span>
            </div>
          </div>
          <div className="card-body">
            <div
              ref={ojoIzquierdoRef}
              onClick={(e) => handleClickOjo(e, 'ojoIzquierdo')}
              className="relative w-full aspect-[4/3] bg-white rounded-lg border-4 border-gray-300 cursor-crosshair hover:border-primary transition-colors shadow-lg overflow-hidden"
            >
              {/* Imagen de fondo del ojo (normal) */}
              <img 
                src="https://lubristil.es/wp-content/uploads/2021/06/anatomia-ojo-salud-ocular-scaled-2048x1282.jpg.webp"
                alt="Anatomía del ojo izquierdo"
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable="false"
              />

              {/* Overlay para mejorar visibilidad de marcas */}
              <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-colors pointer-events-none"></div>

              {/* Marcas */}
              {marcas.ojoIzquierdo.map((marca) => (
                <div
                  key={marca.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    seleccionarMarca('ojoIzquierdo', marca.id);
                  }}
                  className={`absolute w-6 h-6 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 shadow-xl hover:scale-150 transition-transform z-10 ${
                    marcaSeleccionada?.ojo === 'ojoIzquierdo' && marcaSeleccionada?.id === marca.id
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
                  title={`${marca.tipo} - ${marca.fecha}`}
                >
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                  {/* Número de marca */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {marca.tipo}
                  </div>
                </div>
              ))}
            </div>

            {/* Lista de marcas del ojo izquierdo */}
            {marcas.ojoIzquierdo.length > 0 && (
              <div className="mt-5 space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Marcas registradas:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {marcas.ojoIzquierdo.map((marca) => (
                    <div
                      key={marca.id}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        marcaSeleccionada?.ojo === 'ojoIzquierdo' && marcaSeleccionada?.id === marca.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: marca.color }}
                        ></span>
                        <div>
                          <span className="text-sm font-medium capitalize">{marca.tipo}</span>
                          {marca.descripcion && (
                            <p className="text-xs text-gray-600">{marca.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarMarca('ojoIzquierdo', marca.id)}
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
      </div>

      {/* Card de instrucciones */}
      <div className="card bg-light">
        <div className="card-body">
          <div className="flex items-start gap-3">
            <KeenIcon icon="information-2" className="text-info text-xl" />
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-gray-900">Instrucciones de uso:</h4>
              <ul className="text-2sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Selecciona el tipo de marca que deseas registrar (anomalía, lesión, mancha, etc.)</li>
                <li>Opcionalmente, agrega una descripción detallada de la observación</li>
                <li>Haz clic directamente sobre la imagen del ojo en la ubicación exacta de la anomalía</li>
                <li>Las marcas aparecerán como puntos de colores con animación</li>
                <li>Haz clic en una marca existente para seleccionarla (se resaltará con anillo azul)</li>
                <li>Usa el botón de basura junto a cada marca en la lista para eliminarla</li>
                <li>Las marcas se registran automáticamente con fecha, hora y descripción</li>
                <li>La imagen del ojo izquierdo está invertida para simular la vista correcta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarcaOcularContent;