import React, { useState } from 'react';
import { HistoriaClinica } from './types';
import { useHistoriaClinicaForm } from './hooks/useHistoriaClinicaForm';
import { FormHeader } from './components/FormHeader';
import { TipoHistoriaSelector } from './components/TipoHistoriaSelector';
import { TextAreaField } from './components/TextAreaField';
import { AntecedentesSection } from './components/AntecedentesSection';
import { DiagnosticoTratamientoGrid } from './components/DiagnosticoTratamientoGrid';
import { InfoBanner } from './components/InfoBanner';
import { FormActions } from './components/FormActions';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const historiaClinica = getFormData();
    console.log('Historia Clínica a guardar:', historiaClinica);
    onGuardar(historiaClinica);
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

        <TextAreaField
          label="Examen Físico"
          name="examenFisico"
          value={form.examenFisico}
          onChange={handleChange}
          placeholder="Resultados del examen físico..."
          required
        />

        <DiagnosticoTratamientoGrid
          diagnostico={form.diagnostico}
          tratamiento={form.tratamiento}
          onChange={handleChange}
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