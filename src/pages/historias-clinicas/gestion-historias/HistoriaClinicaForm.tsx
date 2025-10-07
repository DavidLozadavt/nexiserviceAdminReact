import React, { useState } from 'react';
import { HistoriaClinica, TipoHistoria } from './types';

interface HistoriaClinicaFormProps {
  onGuardar: (historia: HistoriaClinica) => void;
  onCancelar: () => void;
  historiaExistente?: HistoriaClinica;
}

export const HistoriaClinicaForm: React.FC<HistoriaClinicaFormProps> = ({
  onGuardar,
  onCancelar,
  historiaExistente,
}) => {
  const [form, setForm] = useState<Partial<HistoriaClinica>>(historiaExistente || {
    tipo: 'medica',
    motivoConsulta: '',
    antecedentes: '',      // Nuevo campo
    examenFisico: '',      // Nuevo campo
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de campos obligatorios
    if (!form.motivoConsulta || !form.antecedentes || !form.examenFisico || !form.diagnostico || !form.tratamiento) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    onGuardar(form as HistoriaClinica);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'medica':
        return (
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'fisioterapia':
        return (
          <svg className="w-4 h-4 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'odontologica':
        return (
          <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl">
      {/* Header del formulario */}
      <div className="px-7.5 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-1.5xl font-semibold text-gray-900">
              {historiaExistente ? 'Editar Historia Clínica' : 'Nueva Historia Clínica'}
            </h2>
            <p className="text-2sm text-gray-600">
              {historiaExistente ? 'Actualiza la información médica del paciente' : 'Registra la información médica del paciente'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-7.5 py-6 space-y-6">
        {/* Tipo de Historia */}
        <div>
          <label className="block text-2sm font-medium text-gray-700 mb-2">
            Tipo de Historia Clínica <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 bg-white appearance-none pr-10"
            >
              <option value="medica">Médica General</option>
              <option value="fisioterapia">Fisioterapia</option>
              <option value="odontologica">Odontológica</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {getTipoIcon(form.tipo || 'medica')}
            </div>
          </div>
        </div>

        {/* Motivo de Consulta */}
        <div>
          <label className="block text-2sm font-medium text-gray-700 mb-2">
            Motivo de Consulta <span className="text-danger">*</span>
          </label>
          <textarea
            name="motivoConsulta"
            value={form.motivoConsulta}
            onChange={handleChange}
            placeholder="Describe el motivo principal de la consulta..."
            className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 min-h-20 resize-none"
            rows={3}
            required
          />
        </div>

        {/* Antecedentes */}
        <div>
          <label className="block text-2sm font-medium text-gray-700 mb-2">
            Antecedentes <span className="text-danger">*</span>
          </label>
          <textarea
            name="antecedentes"
            value={form.antecedentes}
            onChange={handleChange}
            placeholder="Antecedentes personales, familiares, etc."
            className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 min-h-20 resize-none"
            rows={3}
            required
          />
        </div>

        {/* Examen Físico */}
        <div>
          <label className="block text-2sm font-medium text-gray-700 mb-2">
            Examen Físico <span className="text-danger">*</span>
          </label>
          <textarea
            name="examenFisico"
            value={form.examenFisico}
            onChange={handleChange}
            placeholder="Resultados del examen físico..."
            className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 min-h-20 resize-none"
            rows={3}
            required
          />
        </div>

        {/* Grid para Diagnóstico y Tratamiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-2sm font-medium text-gray-700 mb-2">
              Diagnóstico <span className="text-danger">*</span>
            </label>
            <textarea
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              placeholder="Diagnóstico médico principal..."
              className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 min-h-24 resize-none"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-2sm font-medium text-gray-700 mb-2">
              Tratamiento <span className="text-danger">*</span>
            </label>
            <textarea
              name="tratamiento"
              value={form.tratamiento}
              onChange={handleChange}
              placeholder="Plan de tratamiento y medicamentos..."
              className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 min-h-24 resize-none"
              rows={4}
              required
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-2sm font-medium text-gray-700 mb-2">
            Observaciones Adicionales
          </label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Notas adicionales, recomendaciones especiales, seguimiento..."
            className="input input-lg w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary-clarity transition-all duration-200 min-h-20 resize-none"
            rows={3}
          />
        </div>

        {/* Información adicional */}
        <div className="bg-info-light border border-info rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-info mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-2sm font-medium text-info mb-1">Información importante</h4>
              <p className="text-3xs text-info opacity-90">
                Asegúrate de completar todos los campos obligatorios (*). Esta información será parte del registro médico permanente del paciente.
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancelar}
            className="btn btn-lg px-6 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="btn btn-lg px-6 py-2.5 bg-primary hover:bg-primary-active text-white rounded-lg transition-all duration-200 font-medium shadow-primary"
          >
            {historiaExistente ? 'Actualizar Historia' : 'Guardar Historia'}
          </button>
        </div>
      </form>
    </div>
  );
};