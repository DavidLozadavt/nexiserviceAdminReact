// módulo para control de cálculos de fechas, navegación y filtro de días
import { useState, useMemo, useCallback } from "react";
import { Reserva } from "..//types"; 
import React from "react"; // 

export type FiltroEstado = "ACTIVO" | "CANCELADO" | "COMPLETADO"|"TODOS";
type Vista = "mensual" | "semanal";

const HOY = new Date(); 

const calcularSemanaDeHoy = () => { 
    const diaIndex = HOY.getDate() - 1; 
    return Math.floor(diaIndex / 7);
};

export const useCalendarLogic = (reservas: Reserva[], filtroEstado: FiltroEstado) => {
    const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(HOY); 
    const [vista, setVista] = useState<Vista>("mensual"); 
    const [mesActual, setMesActual] = useState<Date>(HOY); 
    const [indiceSemana, setIndiceSemana] = useState(calcularSemanaDeHoy()); 
    const [mostrarTodasLasReservas, setMostrarTodasLasReservas] = useState(false); 
    
    const LIMITE_RESERVAS_VISIBLES = 3;


    // --- Cálculos de Días y mes ---
    
    const esMesPresente = useMemo(() => {
        return mesActual.getFullYear() === HOY.getFullYear() &&
               mesActual.getMonth() === HOY.getMonth();
    }, [mesActual]);

    const diasDelMesCompleto = useMemo(() => {
        const primerDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
        const ultimoDiaDelMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
        const numDiasDelMes = ultimoDiaDelMes.getDate();

        const offset = primerDiaDelMes.getDay(); 

        const dias = Array.from({ length: numDiasDelMes }, (_, i) => {
          const dia = new Date(primerDiaDelMes);
          dia.setDate(i + 1);
          return dia;
        });
        
        const paddingInicial = Array(offset).fill(null); 

        return [...paddingInicial, ...dias];
    }, [mesActual]);

    const diasVisibles = useMemo(() => {
        if (vista === "mensual") {
            return diasDelMesCompleto;
        }

        const inicio = indiceSemana * 7;
        const fin = inicio + 7;

        return diasDelMesCompleto.slice(inicio, fin) as (Date | null)[]; 
    }, [vista, diasDelMesCompleto, indiceSemana]);

    const totalSemanas = Math.ceil(diasDelMesCompleto.length / 7);

    const nombreDelMes = mesActual.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    // --- Lógica de Marcaje  ---

    const tieneReserva = useCallback((dia: Date): boolean => {
        return reservas.some(
          (reserva) => {
                const [year, month, day] = reserva.fecha.split('-').map(Number);
                const fechaReservaLocal = new Date(year, month - 1, day); 
                
                return fechaReservaLocal.toDateString() === dia.toDateString();
          }
        );
      }, [reservas]);

    const esDiaInactivo = useCallback((dia: Date): boolean => {
        if (dia.getDay() === 0) return true; 

        const hoySoloFecha = new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate());
        const diaSoloFecha = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());

        if (diaSoloFecha.getTime() < hoySoloFecha.getTime()) return true; 
        
        return false;
    }, []);

    const esHoy = (dia: Date): boolean => {
        return esMesPresente && dia.toDateString() === HOY.toDateString();
    };


    // --- Handlers de Navegación ---
    
    const navegarMes = useCallback((offset: number) => {
        setMesActual(prevMes => {
          const nuevoMes = new Date(prevMes);
          nuevoMes.setMonth(prevMes.getMonth() + offset);
          
          const esNuevoMesPresente = 
            nuevoMes.getFullYear() === HOY.getFullYear() &&
            nuevoMes.getMonth() === HOY.getMonth();

          if (esNuevoMesPresente) {
            setFechaSeleccionada(HOY);
            setIndiceSemana(calcularSemanaDeHoy()); 
          } else {
            setFechaSeleccionada(new Date(nuevoMes.getFullYear(), nuevoMes.getMonth(), 1));
            setIndiceSemana(0);
          }

          setMostrarTodasLasReservas(false);
          return nuevoMes;
        });
    }, []); 

    const irMesAnterior = useCallback(() => navegarMes(-1), [navegarMes]);
    const irMesSiguiente = useCallback(() => navegarMes(1), [navegarMes]);
    
    const irSemanaAnterior = useCallback(() => {
        if (indiceSemana > 0) {
            setIndiceSemana(prev => prev - 1);
        }
    }, [indiceSemana]);

    const irSemanaSiguiente = useCallback(() => {
        if (indiceSemana + 1 < totalSemanas) {
            setIndiceSemana(prev => prev + 1);
        }
    }, [indiceSemana, totalSemanas]);

    const manejarCambioVista = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevaVista = e.target.value as Vista;
        
        if (nuevaVista === 'semanal') {
            const semanaInicial = esMesPresente ? calcularSemanaDeHoy() : 0;
            setIndiceSemana(semanaInicial); 
        } else {
            setIndiceSemana(0); 
        }
        setVista(nuevaVista);
    }, [esMesPresente]);

    const manejarClickDia = useCallback((dia: Date | null) => {
        if (dia) {
          setFechaSeleccionada(dia);
          setMostrarTodasLasReservas(false); 
        }
    }, []);

    // --- Lógica de Filtrado de Reservas del Día (AJUSTADO) ---
    
    const reservasDelDiaSeleccionado = useMemo(() => {
        const diaSeleccionadoString = fechaSeleccionada.toDateString();
        
        //  Filtrar por fecha
        let reservasFiltradasPorFecha = reservas.filter(
            (reserva) => {
                const [year, month, day] = reserva.fecha.split('-').map(Number);
                const fechaReservaLocal = new Date(year, month - 1, day); 
                
                return fechaReservaLocal.toDateString() === diaSeleccionadoString;
            }
        );
        
        // APLICAR EL FILTRO DE ESTADO
        return reservasFiltradasPorFecha.filter(reserva => {
            const estadoReserva = reserva.estado?.toUpperCase() || 'ACTIVO';
            
            if (filtroEstado === 'TODOS') {
                return true;
            }
            if (filtroEstado === 'ACTIVO') {
                return estadoReserva !== 'CANCELADO' && estadoReserva !== 'ANULADO' && 
                       estadoReserva !== 'COMPLETADO' && 
                       estadoReserva !== 'FINALIZADO';
            }
            if (filtroEstado === 'CANCELADO') {
                return estadoReserva === 'CANCELADO' || estadoReserva === 'ANULADO';
            }
            if (filtroEstado === 'COMPLETADO') { 
                return estadoReserva === 'COMPLETADO' || estadoReserva === 'FINALIZADO'; 
            }
            return true;
        });
        
    }, [reservas, fechaSeleccionada, filtroEstado]); 
    
    const reservasVisibles = useMemo(() => mostrarTodasLasReservas
        ? reservasDelDiaSeleccionado
        : reservasDelDiaSeleccionado.slice(0, LIMITE_RESERVAS_VISIBLES), 
    [mostrarTodasLasReservas, reservasDelDiaSeleccionado]);

    const hayMasReservas = reservasDelDiaSeleccionado.length > LIMITE_RESERVAS_VISIBLES;
    
    const toggleMostrarReservas = useCallback(() => {
        setMostrarTodasLasReservas(!mostrarTodasLasReservas);
    }, [mostrarTodasLasReservas]);

    return {
        fechaSeleccionada,
        setFechaSeleccionada,
        vista,
        setVista,
        mesActual,
        setMesActual,
        indiceSemana,
        setIndiceSemana,
        mostrarTodasLasReservas,
        setMostrarTodasLasReservas,
        
        // Cálculos
        nombreDelMes,
        diasVisibles,
        totalSemanas,
        reservasDelDiaSeleccionado,
        reservasVisibles,
        hayMasReservas,
        LIMITE_RESERVAS_VISIBLES,
        
        // Handlers
        irMesAnterior,
        irMesSiguiente,
        irSemanaAnterior,
        irSemanaSiguiente,
        manejarCambioVista,
        manejarClickDia,
        toggleMostrarReservas,
        
        tieneReserva,
        esDiaInactivo,
        esHoy,
    };
};