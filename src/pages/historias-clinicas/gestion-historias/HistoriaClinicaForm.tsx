
import React, { useState } from 'react';
import { HistoriaClinica } from './types';
import { useHistoriaClinicaForm } from './hooks/useHistoriaClinicaForm';
import { FormHeader } from './components/FormHeader';
import { TipoHistoriaSelector } from './components/TipoHistoriaSelector';
import { TextAreaField } from './components/TextAreaField';
import { AntecedentesSection } from './components/AntecedentesSection';
import { TagAutocomplete } from './components/TagAutocomplete';
import { cieDiagnosticos } from './components/autocompleteData';
import { InfoBanner } from './components/InfoBanner';
import { FormActions } from './components/FormActions';
import { crearHistoriaClinica } from './historiaClinicaService';

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
  const { form, setForm, handleChange, validateForm, getFormData } = useHistoriaClinicaForm(historiaExistente);
  const [isAntecedentesExpanded, setIsAntecedentesExpanded] = useState(true);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    const historiaClinica = getFormData();
    try {
      const response = await crearHistoriaClinica(historiaClinica);
      // Puedes mostrar un mensaje de éxito, limpiar el formulario, etc.
      if (onGuardar) onGuardar(response);
    } catch (error) {
      alert('Error al guardar la historia clínica.');
      console.error(error);
    }
  };

  const handleAgregarTratamiento = () => {
    const { tratamientoMedicamento, tratamientoDosis, tratamientoComoTomar, tratamiento } = form;
    if (!tratamientoMedicamento || !tratamientoDosis || !tratamientoComoTomar) return;
    const nuevo = `${tratamientoMedicamento} - ${tratamientoDosis} - ${tratamientoComoTomar}`;
    if (tratamiento && tratamiento.includes(nuevo)) return;
    setForm((prev: any) => ({
      ...prev,
      tratamiento: [...(prev.tratamiento || []), nuevo],
      tratamientoMedicamento: '',
      tratamientoDosis: '',
      tratamientoComoTomar: ''
    }));
  };

  return (
    <div className="card bg-white shadow-card border border-gray-200 rounded-xl">
      <FormHeader isEdit={!!historiaExistente} tipo={form.tipo} />

      <form onSubmit={handleSubmit} className="px-7.5 py-6 space-y-7">
        <TipoHistoriaSelector value={form.tipo} onChange={handleChange} />

        <TextAreaField
          label="Motivo de Consulta"
          name="motivoConsulta"
          value={form.motivoConsulta}
          onChange={handleChange}
          placeholder="Describe el motivo principal de la consulta..."
          required
        />

        <AntecedentesSection
          form={form}
          setForm={setForm}
          isExpanded={isAntecedentesExpanded}
          setIsExpanded={setIsAntecedentesExpanded}
        />

        <TextAreaField
          label="Enfermedad Actual"
          name="enfermedadActual"
          value={form.enfermedadActual || ''}
          onChange={handleChange}
          placeholder="Describe los detalles de la enfermedad actual..."
          required
        />

        {/* EXAMEN FÍSICO */}
        <div className="space-y-3">
          <label className="block text-2sm font-semibold text-gray-900 mb-3">
            Examen Físico <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="relative">
              <input
                type="text"
                name="examenFisico.peso"
                value={form.examenFisico?.peso || ''}
                onChange={handleChange}
                placeholder="Peso"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">kg</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="examenFisico.altura"
                value={form.examenFisico?.altura || ''}
                onChange={handleChange}
                placeholder="Altura"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">cm</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="examenFisico.presionArterial"
                value={form.examenFisico?.presionArterial || ''}
                onChange={handleChange}
                placeholder="Presión Arterial"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">mmHg</span>
            </div>
            <div className="relative">
              <input
                type="text"
                name="examenFisico.frecuenciaCardiaca"
                value={form.examenFisico?.frecuenciaCardiaca || ''}
                onChange={handleChange}
                placeholder="Frecuencia Cardíaca"
                className="input w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary-clarity text-2sm placeholder:text-gray-500 bg-white transition-colors hover:border-gray-400"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">lpm</span>
            </div>
          </div>
        </div>

        {/* DIAGNÓSTICO - Modo autocomplete simple */}
        <TagAutocomplete
          label="Diagnóstico"
          name="diagnostico"
          value={form.diagnostico}
          onChange={diagnosticos => setForm((prev: any) => ({ ...prev, diagnostico: diagnosticos }))}
          suggestions={cieDiagnosticos.map(cie => ({ codigo: cie.value, nombre: cie.label }))}
          placeholder="Busca por código CIE o nombre del diagnóstico..."
          required
          colorScheme="info"
        />

        {/* TRATAMIENTO - Modo multi-input (3 campos) */}
        <TagAutocomplete
          label="Tratamiento"
          name="tratamiento"
          value={form.tratamiento || []}
          onChange={tratamientos => setForm((prev: any) => ({ ...prev, tratamiento: tratamientos }))}
          required
          colorScheme="success"
          multiInputMode={true}
          inputFields={[
            {
              name: 'tratamientoMedicamento',
              placeholder: 'Medicamento',
              value: form.tratamientoMedicamento || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoMedicamento: val })),
              columns: 4
            },
            {
              name: 'tratamientoDosis',
              placeholder: 'Dosis',
              value: form.tratamientoDosis || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoDosis: val })),
              columns: 3
            },
            {
              name: 'tratamientoComoTomar',
              placeholder: '¿Cómo tomarla?',
              value: form.tratamientoComoTomar || '',
              onChange: (val) => setForm((prev: any) => ({ ...prev, tratamientoComoTomar: val })),
              columns: 4
            }
          ]}
          onAddMultiInput={handleAgregarTratamiento}
        />

        <TextAreaField
          label="Observaciones Adicionales"
          name="observaciones"
          value={form.observaciones || ''}
          onChange={handleChange}
          placeholder="Notas adicionales, recomendaciones especiales, seguimiento..."
        />

        <InfoBanner />

        <FormActions isEdit={!!historiaExistente} onCancel={onCancelar} />
      </form>
    </div>
  );
};