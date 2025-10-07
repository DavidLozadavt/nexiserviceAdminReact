import React, { useState } from 'react';
import { EvolucionClinica } from '../gestion-historias/types';
import SignatureCanvas from 'react-signature-canvas';

interface EvolucionClinicaFormProps {
	onAddEvolucion: (evolucion: EvolucionClinica) => void;
	responsable: string;
}

const getToday = () => new Date().toISOString().slice(0, 10);

const EvolucionClinicaForm: React.FC<EvolucionClinicaFormProps> = ({ onAddEvolucion, responsable }) => {
	const [fecha, setFecha] = useState(getToday());
	const [descripcion, setDescripcion] = useState('');
	const [firmaDigital, setFirmaDigital] = useState<string | undefined>(undefined);
	const [proximaCita, setProximaCita] = useState('');
	const [showSignaturePreview, setShowSignaturePreview] = useState(false);
	const signaturePadRef = React.useRef<SignatureCanvas | null>(null);

	const clearSignature = () => {
		signaturePadRef.current?.clear();
		setFirmaDigital(undefined);
		setShowSignaturePreview(false);
	};

	const saveSignature = () => {
		if (signaturePadRef.current) {
			const dataUrl = signaturePadRef.current.getTrimmedCanvas().toDataURL('image/png');
			setFirmaDigital(dataUrl);
			setShowSignaturePreview(true);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!descripcion.trim()) return;
		const nuevaEvolucion: EvolucionClinica = {
			id: crypto.randomUUID(),
			fecha,
			descripcion,
			firmaDigital,
			responsable,
			proximaCita: proximaCita || undefined,
		};
		onAddEvolucion(nuevaEvolucion);
		setDescripcion('');
		setFirmaDigital(undefined);
		setProximaCita('');
		setFecha(getToday());
		setShowSignaturePreview(false);
		clearSignature();
	};

	return (
		<div className="card bg-white shadow-card border border-gray-200 rounded-xl overflow-hidden">
			<div className="px-7.5 py-5 border-b border-gray-200">
				<div className="flex items-center">
					<div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center mr-3">
						<svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div>
						<h3 className="text-1.5xl font-semibold text-gray-900">Nueva Evolución Clínica</h3>
						<p className="text-2sm text-gray-600">Responsable: <span className="font-medium text-gray-900">{responsable}</span></p>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="px-7.5 py-6">
				<div className="space-y-6">
					{/* Fecha y Próxima Cita */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-2sm font-medium text-gray-700 mb-2 flex items-center">
								<svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Fecha de Evolución
							</label>
							<input 
								type="date" 
								className="w-full px-4 py-2.5 text-2sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
								value={fecha} 
								onChange={e => setFecha(e.target.value)} 
								required
							/>
						</div>

						<div>
							<label className="block text-2sm font-medium text-gray-700 mb-2 flex items-center">
								<svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Próxima Cita
								<span className="ml-1.5 text-3xs text-gray-500 font-normal">(opcional)</span>
							</label>
							<input 
								type="date" 
								className="w-full px-4 py-2.5 text-2sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
								value={proximaCita} 
								onChange={e => setProximaCita(e.target.value)} 
							/>
						</div>
					</div>

					{/* Descripción */}
					<div>
						<label className="block text-2sm font-medium text-gray-700 mb-2 flex items-center">
							<svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
							</svg>
							Descripción de la Evolución
							<span className="ml-1.5 text-danger text-3xs">*</span>
						</label>
						<textarea 
							className="w-full px-4 py-3 text-2sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none" 
							rows={5}
							placeholder="Describa la evolución del paciente, síntomas, tratamiento aplicado y observaciones relevantes..."
							value={descripcion} 
							onChange={e => setDescripcion(e.target.value)} 
							required 
						/>
						<p className="text-3xs text-gray-500 mt-1.5">Mínimo 10 caracteres</p>
					</div>

					{/* Firma Digital */}
					<div>
						<label className="block text-2sm font-medium text-gray-700 mb-2 flex items-center">
							<svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
							Firma Digital
							<span className="ml-1.5 text-3xs text-gray-500 font-normal">(opcional)</span>
						</label>
						
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
							<SignatureCanvas
								ref={signaturePadRef}
								penColor="black" // Cambiado de azul a negro
								canvasProps={{ 
									className: 'w-full h-40 bg-white rounded-lg border border-gray-200 shadow-sm cursor-crosshair' 
								}}
							/>
							
							<div className="flex gap-3 mt-4">
								<button 
									type="button" 
									className="btn btn-sm bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg transition-all duration-200 text-2xs font-medium flex items-center"
									onClick={clearSignature}
								>
									<svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Limpiar
								</button>
								<button 
									type="button" 
									className="btn btn-sm bg-info hover:bg-info-active text-white px-4 py-2 rounded-lg transition-all duration-200 text-2xs font-medium flex items-center shadow-info"
									onClick={saveSignature}
								>
									<svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									Guardar Firma
								</button>
							</div>

							{showSignaturePreview && firmaDigital && (
								<div className="mt-4 p-3 bg-success-light border border-success-clarity rounded-lg">
									<div className="flex items-start">
										<div className="flex-shrink-0">
											<svg className="w-5 h-5 text-success mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="ml-3 flex-1">
											<p className="text-2sm font-medium text-success-active mb-2">Firma guardada correctamente</p>
											<img src={firmaDigital} alt="Firma digital guardada" className="max-h-20 bg-white p-2 rounded border border-gray-200" />
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Botones de Acción */}
					<div className="flex gap-3 pt-4 border-t border-gray-200">
						<button 
							type="submit" 
							className="btn bg-primary hover:bg-primary-active text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-primary flex items-center"
							disabled={!descripcion.trim()}
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Agregar Evolución
						</button>
						
						<button 
							type="button" 
							className="btn bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center"
							onClick={() => {
								setDescripcion('');
								setFirmaDigital(undefined);
								setProximaCita('');
								setFecha(getToday());
								setShowSignaturePreview(false);
								clearSignature();
							}}
						>
							<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
							Cancelar
						</button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default EvolucionClinicaForm;