import { useState, useEffect, ChangeEvent } from 'react';
import { HistoriaClinica, Antecedentes, AntecedenteItem } from '../types';

type DynamicForm = {
  [key: string]: any;
};

export const useHistoriaClinicaForm = (historiaExistente?: HistoriaClinica) => {
  const [form, setForm] = useState<DynamicForm>(
    historiaExistente
      ? {
          tipo: historiaExistente.tipo,
          motivoConsulta: historiaExistente.motivoConsulta,
          enfermedadActual: historiaExistente.enfermedadActual || '',
          examenFisico: historiaExistente.examenFisico,
          diagnostico: historiaExistente.diagnostico,
          tratamiento: historiaExistente.tratamiento,
          observaciones: historiaExistente.observaciones || '',
          ...antecedentesToForm(historiaExistente.antecedentes)
        }
      : {
          tipo: 'medica',
          motivoConsulta: '',
          enfermedadActual: '',
          examenFisico: '',
          diagnostico: '',
          tratamiento: '',
          observaciones: '',
        }
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.motivoConsulta || !form.examenFisico || !form.diagnostico || 
        !form.tratamiento || !form.enfermedadActual) {
      return false;
    }
    return true;
  };

  const getFormData = (): HistoriaClinica => {
    return {
      id: historiaExistente?.id || '',
      pacienteId: historiaExistente?.pacienteId || '',
      tipo: form.tipo,
      fechaCreacion: historiaExistente?.fechaCreacion || new Date().toISOString(),
      motivoConsulta: form.motivoConsulta,
      enfermedadActual: form.enfermedadActual,
      examenFisico: form.examenFisico,
      diagnostico: form.diagnostico,
      tratamiento: form.tratamiento,
      observaciones: form.observaciones,
      antecedentes: formToAntecedentes(form),
      historialCambios: historiaExistente?.historialCambios || [],
      adjuntos: historiaExistente?.adjuntos || [],
      evoluciones: historiaExistente?.evoluciones || []
    };
  };

  return {
    form,
    setForm,
    handleChange,
    validateForm,
    getFormData
  };
};

function formToAntecedentes(formData: any): Antecedentes {
  const createItem = (checkKey: string, descKey: string): AntecedenteItem | undefined => {
    const check = formData[checkKey];
    if (check === 'si') {
      return {
        tiene: true,
        descripcion: formData[descKey] || ''
      };
    } else if (check === 'no') {
      return {
        tiene: false
      };
    }
    return undefined;
  };

  return {
    patologicos: {
      enfermedadesPrevias: createItem(
        'Patológicos-Enfermedades previas-check',
        'Patológicos-Enfermedades previas-description'
      ),
      hospitalizaciones: createItem(
        'Patológicos-Hospitalizaciones-check',
        'Patológicos-Hospitalizaciones-description'
      ),
      cirugias: createItem(
        'Patológicos-Cirugías-check',
        'Patológicos-Cirugías-description'
      )
    },
    familiares: {
      enfermedadesHereditarias: createItem(
        'Familiares-Enfermedades hereditarias-check',
        'Familiares-Enfermedades hereditarias-description'
      )
    },
    alergias: {
      medicamentos: createItem(
        'Alergias-Medicamentos-check',
        'Alergias-Medicamentos-description'
      ),
      alimentos: createItem(
        'Alergias-Alimentos-check',
        'Alergias-Alimentos-description'
      ),
      sustancias: createItem(
        'Alergias-Sustancias-check',
        'Alergias-Sustancias-description'
      )
    },
    toxicosFarmacologicos: {
      consumoTabaco: createItem(
        'Tóxicos y Farmacológicos-Consumo de tabaco-check',
        'Tóxicos y Farmacológicos-Consumo de tabaco-description'
      ),
      consumoAlcohol: createItem(
        'Tóxicos y Farmacológicos-Consumo de alcohol-check',
        'Tóxicos y Farmacológicos-Consumo de alcohol-description'
      ),
      consumoDrogas: createItem(
        'Tóxicos y Farmacológicos-Consumo de drogas-check',
        'Tóxicos y Farmacológicos-Consumo de drogas-description'
      ),
      medicamentosHabituales: createItem(
        'Tóxicos y Farmacológicos-Medicamentos habituales-check',
        'Tóxicos y Farmacológicos-Medicamentos habituales-description'
      )
    },
    vacunacion: createItem('Vacunación-check', 'Vacunación-description')
  };
}

function antecedentesToForm(antecedentes: Antecedentes): any {
  const formData: any = {};

  const setItem = (checkKey: string, descKey: string, item?: AntecedenteItem) => {
    if (item !== undefined) {
      formData[checkKey] = item.tiene ? 'si' : 'no';
      if (item.tiene && item.descripcion) {
        formData[descKey] = item.descripcion;
      }
    }
  };

  setItem('Patológicos-Enfermedades previas-check', 'Patológicos-Enfermedades previas-description', 
    antecedentes.patologicos.enfermedadesPrevias);
  setItem('Patológicos-Hospitalizaciones-check', 'Patológicos-Hospitalizaciones-description',
    antecedentes.patologicos.hospitalizaciones);
  setItem('Patológicos-Cirugías-check', 'Patológicos-Cirugías-description',
    antecedentes.patologicos.cirugias);
  setItem('Familiares-Enfermedades hereditarias-check', 'Familiares-Enfermedades hereditarias-description',
    antecedentes.familiares.enfermedadesHereditarias);
  setItem('Alergias-Medicamentos-check', 'Alergias-Medicamentos-description',
    antecedentes.alergias.medicamentos);
  setItem('Alergias-Alimentos-check', 'Alergias-Alimentos-description',
    antecedentes.alergias.alimentos);
  setItem('Alergias-Sustancias-check', 'Alergias-Sustancias-description',
    antecedentes.alergias.sustancias);
  setItem('Tóxicos y Farmacológicos-Consumo de tabaco-check', 
    'Tóxicos y Farmacológicos-Consumo de tabaco-description',
    antecedentes.toxicosFarmacologicos.consumoTabaco);
  setItem('Tóxicos y Farmacológicos-Consumo de alcohol-check',
    'Tóxicos y Farmacológicos-Consumo de alcohol-description',
    antecedentes.toxicosFarmacologicos.consumoAlcohol);
  setItem('Tóxicos y Farmacológicos-Consumo de drogas-check',
    'Tóxicos y Farmacológicos-Consumo de drogas-description',
    antecedentes.toxicosFarmacologicos.consumoDrogas);
  setItem('Tóxicos y Farmacológicos-Medicamentos habituales-check',
    'Tóxicos y Farmacológicos-Medicamentos habituales-description',
    antecedentes.toxicosFarmacologicos.medicamentosHabituales);
  setItem('Vacunación-check', 'Vacunación-description', antecedentes.vacunacion);

  return formData;
}