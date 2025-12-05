import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Paciente, Departamento, Ciudad } from './types';
import { nanoid } from 'nanoid';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalTitle } from '@/components/modal';
import { KeenIcon } from '@/components';
import { obtenerDepartamentos, obtenerCiudadesPorDepartamento, crearPaciente, obtenerTiposIdentificacion } from './pacientesService';

import { useAuthContext } from '@/auth/useAuthContext';



interface PacienteFormProps {
	identificacion: string;
	paciente?: Partial<Paciente>;
	onGuardar: (paciente: Paciente) => void;
	onCancelar: () => void;
	open?: boolean;
}


export const PacienteForm: React.FC<PacienteFormProps> = ({ identificacion, paciente, onGuardar, onCancelar }) => {
	const { enqueueSnackbar } = useSnackbar();
	const [tiposIdentificacion, setTiposIdentificacion] = useState<{ id: number, codigo: string, detalle: string }[]>([]);
	useEffect(() => {
		const fetchTiposIdentificacion = async () => {
			try {
				const data = await obtenerTiposIdentificacion();
				setTiposIdentificacion(data);
			} catch (error) {
				console.error('Error al cargar los tipos de identificación:', error);
			}
		};
		fetchTiposIdentificacion();
	}, []);
	const { empresa } = useAuthContext();
	const [form, setForm] = useState({
		nombre1: paciente?.nombre1 || '',
		apellido1: paciente?.apellido1 || '',
		tipoIdentificacion: paciente?.tipoIdentificacion || '',
		identificacion: paciente?.identificacion || identificacion || '',
		fechaNacimiento: paciente?.fechaNac || '',
		sexo: paciente?.sexo || '',
		direccion: paciente?.direccion || '',
		ciudad: paciente?.idCiudad || '',
		departamento: paciente?.departamento || '',
		telefono: paciente?.telefono || '',
		correo: paciente?.email || '',
		acudiente: paciente?.acudiente || '',
		eps: paciente?.eps || ''
	});

    const [errores, setErrores] = useState<{ [key: string]: string }>({});
	const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
	const [ciudades, setCiudades] = useState<Ciudad[]>([]);

	useEffect(() => {
		const fetchDepartamentos = async () => {
			try {
				const departamentosData = await obtenerDepartamentos();
				setDepartamentos(departamentosData);
			} catch (error) {
				console.error('Error al cargar los departamentos:', error);
			}
		};

		fetchDepartamentos();
	}, []);

	const fetchCiudades = async (idDepartamento: number) => {
		try {
			const ciudadesData = await obtenerCiudadesPorDepartamento(idDepartamento);
			setCiudades(ciudadesData);
		} catch (error) {
			console.error('Error al cargar las ciudades:', error);
		}
	};

	const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target;
		setForm((prev) => ({ ...prev, departamento: value, ciudad: '' }));
		if (value) {
			fetchCiudades(Number(value));
		} else {
			setCiudades([]);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let error = '';

        if (name === 'nombre1' && value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(value)) {
            error = 'Solo se permiten letras y espacios';
        }
        if (name === 'apellido1' && value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(value)) {
            error = 'Solo se permiten letras y espacios';
        }
        if ((name === 'telefono' || name === 'identificacion') && value && !/^[0-9]*$/.test(value)) {
            error = 'Solo se permiten números';
        }

        setErrores(prev => ({ ...prev, [name]: error }));
        setForm(prev => ({ ...prev, [name]: value }));
        };

	const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  let valid = true;
  let newErrors: { [key: string]: string } = {};

  if (!form.nombre1) {
    newErrors.nombre1 = 'El nombre es obligatorio';
    valid = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.nombre1)) {
    newErrors.nombre1 = 'Solo se permiten letras y espacios';
    valid = false;
  }

  if (!form.apellido1) {
    newErrors.apellido1 = 'El apellido es obligatorio';
    valid = false;
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/.test(form.apellido1)) {
    newErrors.apellido1 = 'Solo se permiten letras y espacios';
    valid = false;
  }

  if (!form.tipoIdentificacion) {
    newErrors.tipoIdentificacion = 'Seleccione un tipo de identificación';
    valid = false;
  }

  if (!form.identificacion) {
    newErrors.identificacion = 'El número de identificación es obligatorio';
    valid = false;
  } else if (!/^[0-9]+$/.test(form.identificacion)) {
    newErrors.identificacion = 'Solo se permiten números';
    valid = false;
  }

  if (!form.fechaNacimiento) {
    newErrors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    valid = false;
  }

  if (form.telefono && !/^[0-9]+$/.test(form.telefono)) {
    newErrors.telefono = 'Solo se permiten números';
    valid = false;
  }

  setErrores(newErrors);

  if (!valid) return;


			try {
				if (!empresa?.id) {
					enqueueSnackbar('No se pudo obtener la empresa. Intente nuevamente.', { variant: 'solid', state: 'danger' });
					return;
				}
				const payload: any = {
					id: nanoid(8),
					identificacion: form.identificacion,
					nombre1: form.nombre1,
					apellido1: form.apellido1,
					direccion: form.direccion,
					email: form.correo,
					tipoIdentificacion: Number(form.tipoIdentificacion),
					idCiudad: form.ciudad,
					sexo: form.sexo,
					fechaNac: form.fechaNacimiento,
					//eps: form.eps,
				};
				if (form.telefono) {
					payload.celular = form.telefono;
				}
				await crearPaciente(empresa.id, payload);
				enqueueSnackbar('Paciente registrado exitosamente', { variant: 'solid', state: 'success' });
				onCancelar();
			} catch (error) {
				const data = (error as any)?.response?.data || {};
				const backendMsg = data.message || data.error || '';
				let customMsg = backendMsg || 'Intente nuevamente más tarde';
				enqueueSnackbar(`Error al registrar el paciente: ${customMsg}`, { variant: 'solid', state: 'danger' });
			}
};

	return (
		<Modal open={true} onClose={onCancelar}>
			<ModalContent className="max-w-2xl w-full p-0 card shadow-card">
				<ModalHeader className="border-b border-gray-200 px-7.5 py-5">
					<ModalTitle >
						Registrar Nuevo Paciente
					</ModalTitle>
					<button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={onCancelar}>
            <KeenIcon icon="cross" />
          </button>
				</ModalHeader>
				<ModalBody className="px-7.5 py-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<h3 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">
								Información Personal
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Primer Nombre <span className="text-danger">*</span>
									</label>
									<input 
										name="nombre1" 
										placeholder="Ingrese el primer nombre" 
										value={form.nombre1} 
										onChange={handleChange} 
										required 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
									{errores.nombre1 && <span className="text-red-500 text-xs">{errores.nombre1}</span>}
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Primer Apellido <span className="text-danger">*</span>
									</label>
									<input 
										name="apellido1" 
										placeholder="Ingrese el primer apellido" 
										value={form.apellido1} 
										onChange={handleChange} 
										required 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
									{errores.apellido1 && <span className="text-red-500 text-xs">{errores.apellido1}</span>}
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Fecha de nacimiento <span className="text-danger">*</span>
									</label>
									<input 
										name="fechaNacimiento" 
										type="date" 
										value={form.fechaNacimiento} 
										onChange={handleChange} 
										required 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Tipo de identificación <span className="text-danger">*</span>
									</label>
																			<select 
																				name="tipoIdentificacion" 
																				value={form.tipoIdentificacion} 
																				onChange={handleChange} 
																				required 
																				className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 bg-white"
																			>
																				<option value="" className="text-gray-400">Seleccione tipo</option>
																				{tiposIdentificacion.map(tipo => (
																					<option key={tipo.id} value={tipo.id}>{tipo.detalle}</option>
																				))}
																			</select>
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Número de identificación <span className="text-danger">*</span>
									</label>
									<input 
										name="identificacion" 
										placeholder="Número de identificación" 
										value={form.identificacion} 
										onChange={handleChange} 
										required 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
                                    {errores.identificacion && <span className="text-red-500 text-xs">{errores.identificacion}</span>}
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Sexo/Género <span className="text-danger">*</span>
									</label>
									<select 
										name="sexo" 
										value={form.sexo} 
										onChange={handleChange} 
										required 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 bg-white"
									>
										<option value="" className="text-gray-400">Seleccione sexo/género</option>
										<option value="M">Masculino</option>
										<option value="F">Femenino</option>
										<option value="O">Otro</option>
									</select>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">
								Información de Contacto
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-2">
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Dirección
									</label>
									<input 
										name="direccion" 
										placeholder="Dirección de residencia" 
										value={form.direccion} 
										onChange={handleChange} 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Departamento
									</label>
									<select
										name="departamento"
										value={form.departamento}
										onChange={handleDepartamentoChange}
										className="input"
									>
										<option value="">Seleccione un departamento</option>
										{departamentos.map((departamento) => (
											<option key={departamento.id} value={departamento.id}>
											{departamento.descripcion}
											</option>
  ))}
									</select>
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Ciudad
									</label>
									<select
										name="ciudad"
										value={form.ciudad}
										onChange={handleChange}
										className="input"
									>
										<option value="">Seleccione una ciudad</option>
										{ciudades.map((ciudad) => (
											<option key={ciudad.id} value={ciudad.id}>
												{ciudad.descripcion}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Teléfono
									</label>
									<input 
										name="telefono" 
										placeholder="Número de teléfono" 
										value={form.telefono} 
										onChange={handleChange} 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
                                    {errores.telefono && <span className="text-red-500 text-xs">{errores.telefono}</span>}
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Correo electrónico
									</label>
									<input 
										name="correo" 
										type="email"
										placeholder="correo@ejemplo.com" 
										value={form.correo} 
										onChange={handleChange} 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-md font-medium text-gray-700 mb-4 border-b border-gray-200 pb-2">
								Información Adicional
							</h3>
							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										Datos del acudiente
									</label>
									<input 
										name="acudiente" 
										placeholder="Nombre y contacto del acudiente (si aplica)" 
										value={form.acudiente} 
										onChange={handleChange} 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
								</div>
								<div>
									<label className="block text-2sm font-medium text-gray-700 mb-2">
										EPS / Aseguradora
									</label>
									<input 
										name="eps" 
										placeholder="Nombre de la EPS o aseguradora (si aplica)" 
										value={form.eps} 
										onChange={handleChange} 
										className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200" 
									/>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
							<button 
								type="button" 
								onClick={onCancelar} 
								className="btn btn-secondary btn-sm"
							>
								Cancelar
							</button>
							<button 
								type="submit" 
								className="btn btn-primary btn-sm"
							>
								Registrar
							</button>
						</div>
					</form>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};