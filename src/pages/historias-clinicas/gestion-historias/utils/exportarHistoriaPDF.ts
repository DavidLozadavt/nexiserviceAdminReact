// Utilidad para renderizar bloques de texto multilínea
function renderTextBlock(pdf: jsPDF, text: string, x: number, y: number, width: number, fontSize = 10, fontStyle: [string, string] = ['helvetica', 'normal'], color = COLORS.gray800): number {
  pdf.setFontSize(fontSize);
  pdf.setFont(fontStyle[0], fontStyle[1]);
  pdf.setTextColor(color.r, color.g, color.b);
  const lines = pdf.splitTextToSize(text, width);
  pdf.text(lines, x, y);
  return lines.length * 14;
}
import jsPDF from 'jspdf';
import { HistoriaClinica, Antecedentes, EvolucionClinica } from '../types';

// Recibe array de diagnosticos y catálogo, retorna array de strings enriquecidos
function mapDiagnosticosToText(diagnosticos: any[], cieCatalogo: Array<{ id: number; codigo: string; descripcion: string }>): string[] {
  if (!Array.isArray(diagnosticos)) return [];
  return diagnosticos.map(diag => {
    if (typeof diag === 'object' && diag !== null && diag.cie_id) {
      const cie = cieCatalogo.find(c => c.id === diag.cie_id);
      return cie ? `${cie.codigo} - ${cie.descripcion}` : String(diag.cie_id);
    }
    if (typeof diag === 'number') {
      const cie = cieCatalogo.find(c => c.id === diag);
      return cie ? `${cie.codigo} - ${cie.descripcion}` : String(diag);
    }
    if (typeof diag === 'object' && diag !== null && diag.codigo && diag.descripcion) {
      return `${diag.codigo} - ${diag.descripcion}`;
    }
    if (typeof diag === 'string') {
      const cie = cieCatalogo.find(c => c.codigo === diag);
      return cie ? `${cie.codigo} - ${cie.descripcion}` : diag;
    }
    return '-';
  });
}

interface ExportarHistoriaPDFOptions {
  historia: HistoriaClinica;
  nombrePaciente: string;
  documentoPaciente: string;
  nombreArchivo?: string;
}

// Colores basados en tu tema de Tailwind
const COLORS = {
  primary: { r: 27, g: 132, b: 255 },        // #1B84FF
  primaryActive: { r: 5, g: 110, b: 233 },   // #056EE9
  success: { r: 23, g: 198, b: 83 },         // #17C653
  info: { r: 114, g: 57, b: 234 },           // #7239EA
  danger: { r: 248, g: 40, b: 90 },          // #F8285A
  warning: { r: 246, g: 177, b: 0 },         // #F6B100
  gray100: { r: 249, g: 249, b: 249 },       // #F9F9F9
  gray200: { r: 241, g: 241, b: 244 },       // #F1F1F4
  gray300: { r: 219, g: 223, b: 233 },       // #DBDFE9
  gray500: { r: 153, g: 161, b: 183 },       // #99A1B7
  gray700: { r: 75, g: 86, b: 117 },         // #4B5675
  gray800: { r: 37, g: 47, b: 74 },          // #252F4A
  gray900: { r: 7, g: 20, b: 55 },           // #071437
  white: { r: 255, g: 255, b: 255 }
};

function addHeader(pdf: jsPDF, nombrePaciente: string, documentoPaciente: string, fecha: string) {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Fondo del header con gradiente simulado
  pdf.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.rect(0, 0, pageWidth, 85, 'F');
  
  // Barra superior decorativa
  pdf.setFillColor(COLORS.primaryActive.r, COLORS.primaryActive.g, COLORS.primaryActive.b);
  pdf.rect(0, 0, pageWidth, 5, 'F');
  
  // Logo o ícono (círculo decorativo)
  pdf.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  pdf.circle(40, 42, 15, 'F');
  pdf.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HC', 40, 47, { align: 'center' });
  
  // Título principal
  pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  pdf.setFontSize(26);
  pdf.setFont('helvetica', 'bold');
  pdf.text('HISTORIA CLÍNICA', 70, 35);
  
  // Subtítulo
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Registro Médico Completo', 70, 50);
  
  // Línea decorativa
  pdf.setDrawColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  pdf.setLineWidth(1);
  pdf.line(70, 56, 250, 56);
  
  // Información del paciente en el header
  pdf.setFontSize(8.5);
  pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
  
  const infoY = 70;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Paciente:', 70, infoY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(nombrePaciente, 110, infoY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Documento:', 260, infoY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(documentoPaciente, 315, infoY);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha:', 420, infoY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(fecha, 450, infoY);
}

function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number) {
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  
  // Línea superior del footer
  pdf.setDrawColor(COLORS.gray300.r, COLORS.gray300.g, COLORS.gray300.b);
  pdf.setLineWidth(0.5);
  pdf.line(40, pageHeight - 35, pageWidth - 40, pageHeight - 35);
  
  // Número de página
  pdf.setFontSize(9);
  pdf.setTextColor(COLORS.gray700.r, COLORS.gray700.g, COLORS.gray700.b);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  // Fecha de generación
  pdf.setFontSize(8);
  pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  pdf.setFont('helvetica', 'italic');
  const fechaGeneracion = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Documento generado el ${fechaGeneracion}`, 40, pageHeight - 20);
}

function addSectionHeader(pdf: jsPDF, title: string, y: number, color: {r: number, g: number, b: number} = COLORS.primary): number {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Fondo de la sección
  pdf.setFillColor(COLORS.gray100.r, COLORS.gray100.g, COLORS.gray100.b);
  pdf.roundedRect(40, y, pageWidth - 80, 28, 4, 4, 'F');
  
  // Barra lateral de color
  pdf.setFillColor(color.r, color.g, color.b);
  pdf.roundedRect(40, y, 5, 28, 2, 2, 'F');
  
  // Título
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray900.r, COLORS.gray900.g, COLORS.gray900.b);
  pdf.text(title, 55, y + 18);
  
  return y + 28;
}

function addField(pdf: jsPDF, label: string, value: string, y: number, bold: boolean = false): number {
  const maxWidth = 515;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray700.r, COLORS.gray700.g, COLORS.gray700.b);
  pdf.text(`${label}:`, 50, y);
  
  const labelWidth = pdf.getTextWidth(`${label}: `);
  
  if (bold) {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.gray900.r, COLORS.gray900.g, COLORS.gray900.b);
  } else {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
  }
  
  const lines = pdf.splitTextToSize(value || 'No registrado', maxWidth - labelWidth - 10);
  pdf.text(lines, 50 + labelWidth, y);
  
  const lineHeight = 14;
  return y + (lines.length * lineHeight) + 4;
}

function addSubsectionTitle(pdf: jsPDF, title: string, y: number): number {
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
  
  // Pequeño indicador visual
  pdf.setFillColor(COLORS.info.r, COLORS.info.g, COLORS.info.b);
  pdf.circle(52, y - 2, 2, 'F');
  
  pdf.text(title, 60, y);
  return y + 14;
}

function renderDatosBasicos(pdf: jsPDF, historia: HistoriaClinica, startY: number): number {
  let y = addSectionHeader(pdf, 'INFORMACIÓN GENERAL', startY, COLORS.primary);
  y += 12;
  
  y = addField(pdf, 'Tipo de Historia', historia.tipo, y, true);
  y = addField(pdf, 'Fecha de Creación', historia.fechaCreacion || 'No registrada', y);
  
  return y + 8;
}

function renderMotivoConsulta(pdf: jsPDF, historia: HistoriaClinica, startY: number): number {
  let y = addSectionHeader(pdf, 'MOTIVO DE CONSULTA', startY, COLORS.info);
  y += 12;
  y += renderTextBlock(pdf, historia.motivoConsulta || 'No registrado', 50, y, 515);
  return y + 8;
}

function renderEnfermedadActual(pdf: jsPDF, historia: HistoriaClinica, startY: number): number {
  let y = addSectionHeader(pdf, 'ENFERMEDAD ACTUAL', startY, COLORS.warning);
  y += 12;
  y += renderTextBlock(pdf, historia.enfermedad_actual || 'No registrado', 50, y, 515);
  return y + 8;
}

function renderExamenFisico(pdf: jsPDF, historia: HistoriaClinica, startY: number): number {
  let y = addSectionHeader(pdf, 'EXAMEN FÍSICO', startY, COLORS.success);
  y += 12;
  
  const ef = historia.examenFisico;
  
  // Crear una cuadrícula para los signos vitales
  const colWidth = 125;
  const row1Y = y;
  
  // Primera fila
  pdf.setFillColor(COLORS.gray100.r, COLORS.gray100.g, COLORS.gray100.b);
  pdf.roundedRect(50, row1Y, colWidth, 35, 3, 3, 'F');
  pdf.roundedRect(50 + colWidth + 10, row1Y, colWidth, 35, 3, 3, 'F');
  pdf.roundedRect(50 + (colWidth + 10) * 2, row1Y, colWidth, 35, 3, 3, 'F');
  pdf.roundedRect(50 + (colWidth + 10) * 3, row1Y, colWidth, 35, 3, 3, 'F');
  
  // Peso
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  pdf.text('PESO', 60, row1Y + 12);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.text(`${ef?.peso || '-'} kg`, 60, row1Y + 27);
  
  // Altura
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  pdf.text('ALTURA', 60 + colWidth + 10, row1Y + 12);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  pdf.text(`${ef?.altura || '-'} cm`, 60 + colWidth + 10, row1Y + 27);
  
  // Presión arterial
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  pdf.text('PRESIÓN ARTERIAL', 60 + (colWidth + 10) * 2, row1Y + 12);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
  pdf.text(`${ef?.presionArterial || '-'}`, 60 + (colWidth + 10) * 2, row1Y + 27);
  
  // Frecuencia cardíaca
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
  pdf.text('FRECUENCIA CARDÍACA', 60 + (colWidth + 10) * 3, row1Y + 12);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
  pdf.text(`${ef?.frecuenciaCardiaca || '-'} lpm`, 60 + (colWidth + 10) * 3, row1Y + 27);
  
  return row1Y + 35 + 12;
}

function renderDiagnostico(pdf: jsPDF, historia: { diagnosticos: string[] }, startY: number): number {
  let y = addSectionHeader(pdf, 'DIAGNÓSTICO', startY, COLORS.danger);
  y += 12;
  
  if (Array.isArray(historia.diagnosticos) && historia.diagnosticos.length > 0) {
    historia.diagnosticos.forEach((diag: string, idx: number) => {
      // Número del diagnóstico
      pdf.setFillColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
      pdf.circle(52, y - 2, 3, 'F');
      pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${idx + 1}`, 52, y + 1, { align: 'center' });
      
      // Texto del diagnóstico
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
      const lines = pdf.splitTextToSize(diag, 500);
      pdf.text(lines, 62, y);
      y += lines.length * 14 + 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    pdf.text('No se ha registrado diagnóstico', 50, y);
    y += 14;
  }
  
  return y + 8;
}

function renderTratamiento(pdf: jsPDF, historia: HistoriaClinica, startY: number): number {
  let y = addSectionHeader(pdf, 'TRATAMIENTO', startY, COLORS.success);
  y += 12;
  
  if (Array.isArray(historia.tratamiento) && historia.tratamiento.length > 0) {
    historia.tratamiento.forEach((trat, idx) => {
      // Checkbox de tratamiento
      pdf.setDrawColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
      pdf.setLineWidth(1.5);
      pdf.roundedRect(50, y - 6, 8, 8, 1, 1, 'S');
      pdf.setFillColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
      pdf.text('✓', 52, y + 1, { align: 'center' });

      // Texto del tratamiento (detallado)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
      let texto = `Medicamento: ${trat.medicamento}`;
      if (trat.presentacion) texto += ` | Presentación: ${trat.presentacion}`;
      texto += ` | Dosis: ${trat.dosis} | ¿Cómo tomar?: ${trat.como_tomar}`;
      const lines = pdf.splitTextToSize(texto, 500);
      pdf.text(lines, 65, y);
      y += lines.length * 14 + 6;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    pdf.text('No se ha registrado tratamiento', 50, y);
    y += 14;
  }
  
  return y + 8;
}

function renderObservaciones(pdf: jsPDF, historia: HistoriaClinica, startY: number): number {
  let y = addSectionHeader(pdf, 'OBSERVACIONES', startY, COLORS.info);
  y += 12;
  y += renderTextBlock(pdf, historia.observaciones || 'Sin observaciones adicionales', 50, y, 515);
  return y + 8;
}

function renderAntecedentes(pdf: jsPDF, antecedentes: Antecedentes, startY: number, checkNewPage: (space: number) => boolean): number {
  let y = startY;
  
  // Verificar espacio para el header de la sección
  if (checkNewPage(100)) {
    y = 100;
  }
  
  y = addSectionHeader(pdf, 'ANTECEDENTES', y, COLORS.warning);
  y += 12;
  
  if (!antecedentes || antecedentes.length === 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    pdf.text('No se han registrado antecedentes', 50, y);
    return y + 20;
  }
  
  // Configuración de columnas
  const col1X = 50;
  const col2X = 310;
  const colWidth = 240;
  let currentCol = 1;
  let col1Y = y;
  let col2Y = y;
  let maxY = y;
  
  antecedentes.forEach((ant, index) => {
    // Calcular altura necesaria para este item
    let itemHeight = 18;
    if (ant.descripcion) {
      const lines = pdf.splitTextToSize(ant.descripcion, colWidth - 20);
      itemHeight += (lines.length * 10) + 6;
    } else {
      itemHeight += 12; // Para "No presenta"
    }
    
    // Determinar posición actual
    const currentX = currentCol === 1 ? col1X : col2X;
    let currentY = currentCol === 1 ? col1Y : col2Y;
    
    // Verificar si necesitamos nueva página ANTES de renderizar
    const pageHeight = pdf.internal.pageSize.height;
    if (currentY + itemHeight > pageHeight - 80) {
      // Crear nueva página
      pdf.addPage();
      
      // Resetear posiciones
      y = 100;
      col1Y = y;
      col2Y = y;
      currentCol = 1;
      currentY = y;
      maxY = y;
    }
    
    const tiene = ant.tiene;
    let itemY = currentY;
    
    // Indicador de sí/no
    if (tiene) {
      pdf.setFillColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
      pdf.circle(currentX + 2, itemY - 2, 3, 'F');
    } else {
      pdf.setDrawColor(COLORS.gray300.r, COLORS.gray300.g, COLORS.gray300.b);
      pdf.setLineWidth(1);
      pdf.circle(currentX + 2, itemY - 2, 3, 'S');
    }
    
    // Subcategoría
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    const subcatLines = pdf.splitTextToSize(ant.subcategoria, colWidth - 50);
    pdf.text(subcatLines, currentX + 12, itemY);
    
    // Estado (al lado derecho)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    if (tiene) {
      pdf.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
    } else {
      pdf.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
    }
    pdf.text(tiene ? 'Sí' : 'No', currentX + colWidth - 25, itemY);
    
    itemY += subcatLines.length * 12 + 2;
    
    // Descripción si existe
    if (ant.descripcion) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(COLORS.gray700.r, COLORS.gray700.g, COLORS.gray700.b);
      const descLines = pdf.splitTextToSize(ant.descripcion, colWidth - 20);
      pdf.text(descLines, currentX + 12, itemY);
      itemY += descLines.length * 10 + 6;
    } else {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
      pdf.text('No presenta', currentX + 12, itemY);
      itemY += 12;
    }
    
    // Actualizar posiciones
    if (currentCol === 1) {
      col1Y = itemY + 8;
      maxY = Math.max(maxY, col1Y);
      currentCol = 2;
    } else {
      col2Y = itemY + 8;
      maxY = Math.max(maxY, col2Y);
      currentCol = 1;
    }
  });
  
  return maxY + 12;
}

function renderEvoluciones(pdf: jsPDF, evoluciones: EvolucionClinica[] | undefined, startY: number, checkNewPage: (space: number) => boolean): number {
  let y = startY;
  
  // Verificar espacio para el header de la sección
  if (checkNewPage(80)) {
    y = 100;
  }
  
  y = addSectionHeader(pdf, 'EVOLUCIONES CLÍNICAS', y, COLORS.info);
  y += 12;
  
  if (!evoluciones || evoluciones.length === 0) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
    pdf.text('No se han registrado evoluciones', 50, y);
    return y + 20;
  }
  
  evoluciones.forEach((ev, idx) => {
    // Verificar espacio para toda la evolución (estimado inicial)
    if (checkNewPage(100)) {
      y = 100;
    }
    
    // Encabezado de la evolución
    pdf.setFillColor(COLORS.info.r, COLORS.info.g, COLORS.info.b);
    pdf.roundedRect(50, y, 515, 25, 3, 3, 'F');
    
    // Número de evolución
    pdf.setFillColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    pdf.circle(65, y + 12, 8, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.info.r, COLORS.info.g, COLORS.info.b);
    pdf.text(`${idx + 1}`, 65, y + 16, { align: 'center' });
    
    // Fecha y responsable
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
    pdf.text(`Fecha: ${ev.fecha}`, 80, y + 12);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Responsable: ${ev.responsable}`, 80, y + 21);
    
    y += 25;
    y += 12;
    
    // Descripción
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(COLORS.gray800.r, COLORS.gray800.g, COLORS.gray800.b);
    const lines = pdf.splitTextToSize(ev.descripcion, 500);
    pdf.text(lines, 60, y);
    y += lines.length * 14 + 10;
    
    // Próxima cita si existe
    if (ev.proximaCita) {
      pdf.setFillColor(COLORS.gray100.r, COLORS.gray100.g, COLORS.gray100.b);
      pdf.roundedRect(60, y, 200, 20, 3, 3, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
      pdf.text('📅 Próxima cita:', 68, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(ev.proximaCita, 68, y + 16);
      
      y += 25;
    }
    
    // Firma digital si existe
    if (ev.firmaDigital) {
      y += 5;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(COLORS.gray700.r, COLORS.gray700.g, COLORS.gray700.b);
      pdf.text('Firma Digital:', 60, y);
      y += 8;
      
      try {
        pdf.addImage(ev.firmaDigital, 'PNG', 60, y, 120, 30);
        y += 35;
      } catch (error) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(COLORS.gray500.r, COLORS.gray500.g, COLORS.gray500.b);
        pdf.text('(Firma digital registrada)', 60, y);
        y += 12;
      }
    }
    
    y += 15;
  });
  
  return y + 8;
}

export async function exportarHistoriaPDF({
  historia,
  nombrePaciente,
  documentoPaciente,
  nombreArchivo = 'historia-clinica.pdf',
  cieCatalogo = [], // Nuevo prop opcional
}: ExportarHistoriaPDFOptions & { cieCatalogo?: Array<{ id: number; codigo: string; descripcion: string }> }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageHeight = pdf.internal.pageSize.height;
  let currentPage = 1;
  let y = 100;
  
  // Header
  addHeader(pdf, nombrePaciente, documentoPaciente, historia.fechaCreacion || new Date().toLocaleDateString('es-ES'));
  
  // Función para verificar si necesitamos nueva página
  const checkNewPage = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 80) {
      addFooter(pdf, currentPage, 1); // Actualizaremos el total después
      pdf.addPage();
      currentPage++;
      addHeader(pdf, nombrePaciente, documentoPaciente, historia.fechaCreacion || new Date().toLocaleDateString('es-ES'));
      y = 100;
      return true;
    }
    return false;
  };
  
  // Datos básicos
  checkNewPage(80);
  y = renderDatosBasicos(pdf, historia, y);
  
  // Motivo de consulta
  checkNewPage(100);
  y = renderMotivoConsulta(pdf, historia, y);
  
  // Enfermedad actual
  checkNewPage(100);
  y = renderEnfermedadActual(pdf, historia, y);

  // Antecedentes (antes del examen físico)
  y = renderAntecedentes(pdf, historia.antecedentes, y, checkNewPage);

  // Examen físico
  checkNewPage(100);
  y = renderExamenFisico(pdf, historia, y);

  // Diagnóstico
  checkNewPage(120);
  // Enriquecer diagnósticos antes de renderizar
  const diagnosticosEnriquecidos = mapDiagnosticosToText(historia.diagnosticos ?? [], cieCatalogo);
  const historiaConDiagnosticos = { 
    ...historia, 
    diagnosticos: diagnosticosEnriquecidos 
  } as Omit<HistoriaClinica, 'diagnosticos'> & { diagnosticos: string[] };
  y = renderDiagnostico(pdf, historiaConDiagnosticos, y);
  
  // Tratamiento
  checkNewPage(120);
  y = renderTratamiento(pdf, historia, y);
  
  // Observaciones
  checkNewPage(100);
  y = renderObservaciones(pdf, historia, y);
  

  
  // Evoluciones (con mejor control de paginación)
  y = renderEvoluciones(pdf, historia.evoluciones, y, checkNewPage);
  
  // Actualizar footers con el número total de páginas
  const totalPages = currentPage;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(pdf, i, totalPages);
  }
  
  pdf.save(nombreArchivo);
}

// Export explícito para importación dinámica
export async function exportarTratamientoPDF({
  historia,
  nombrePaciente,
  documentoPaciente,
  nombreArchivo = 'tratamiento.pdf',
  cieCatalogo = [],
}: ExportarHistoriaPDFOptions & { cieCatalogo?: Array<{ id: number; codigo: string; descripcion: string }> }) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageHeight = pdf.internal.pageSize.height;
  let currentPage = 1;
  let y = 100;

  // Header
  addHeader(pdf, nombrePaciente, documentoPaciente, historia.fechaCreacion || new Date().toLocaleDateString('es-ES'));

  // Función para verificar si necesitamos nueva página
  const checkNewPage = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 80) {
      addFooter(pdf, currentPage, 1); // Actualizaremos el total después
      pdf.addPage();
      currentPage++;
      addHeader(pdf, nombrePaciente, documentoPaciente, historia.fechaCreacion || new Date().toLocaleDateString('es-ES'));
      y = 100;
      return true;
    }
    return false;
  };

  // Datos básicos
  checkNewPage(80);
  y = renderDatosBasicos(pdf, historia, y);

  // Tratamiento
  checkNewPage(120);
  y = renderTratamiento(pdf, historia, y);

  // Actualizar footers con el número total de páginas
  const totalPages = currentPage;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    addFooter(pdf, i, totalPages);
  }

  pdf.save(nombreArchivo);
}