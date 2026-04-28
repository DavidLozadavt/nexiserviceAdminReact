/**
 * NexiDashboard.tsx
 *
 * Panel de control principal de NexiService.
 * Muestra KPIs en tiempo real, gráfico de rendimiento operativo,
 * actividad reciente y accesos rápidos.
 *
 * Responsividad:
 *  - mobile  (< 640px):  1–2 columnas, header apilado, reloj compacto, ticker oculto
 *  - tablet  (640–1023px): 2 columnas KPI, layouts intermedios
 *  - desktop (≥ 1024px): layout completo con 3–4 columnas
 *
 * FIXES aplicados:
 *  - Eliminado <Container> interno (el padre Demo1LightSidebarPage ya lo provee)
 *  - Eliminados px-4/md:px-8 del div raíz (el Container padre maneja el padding)
 *  - Ticker usa overflow:hidden en el wrapper para que no genere ancho intrínseco
 *  - Eliminado import de Container
 *
 * Dependencias externas: axios, pusher-js, react-apexcharts, apexcharts
 * Dependencias internas: useAuthContext, KeenIcon, Snackbar
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuthContext } from '@/auth';
import { useSettings } from '@/providers';
import { KeenIcon } from '@/components';
import ApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import Pusher from 'pusher-js';
import { Snackbar } from '@/components/Snackbar';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

interface TrendData {
  trend: number;
  spark: number[];
}

interface VentasDesempeno {
  ventasMesActual: number;
  ventasMesAnterior: number;
  porcentajeAumento: number;
}

interface CustomersInfo {
  totalUniqueCustomers: number;
  newCustomersToday: number;
}

interface Activity {
  label: string;
  meta: string;
  icon: string;
  dot: string;
}

interface ChartSeries {
  name: string;
  data: number[];
}

interface DashboardCache {
  pedidosPendientesCount: number;
  pedidosTrend: TrendData;
  serviciosActivosCount: number;
  serviciosTrend: TrendData;
  sedesCount: number;
  sedesTrend: TrendData;
  personalCount: number;
  personalTrend: TrendData;
  chartCategories: string[];
  chartSeries: ChartSeries[];
  recentActivities: Activity[];
  ventasDesempeno: VentasDesempeno;
  customersInfo: CustomersInfo;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────

const PUSHER_KEY     = 'ae9cbea5e49a86a070bf';
const PUSHER_CLUSTER = 'us2';
const SPARK_DAYS     = 7;

const DEFAULT_CHART_CATEGORIES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DEFAULT_TREND: TrendData         = { trend: 0, spark: Array(SPARK_DAYS).fill(0) };
const DEFAULT_VENTAS: VentasDesempeno  = { ventasMesActual: 0, ventasMesAnterior: 0, porcentajeAumento: 0 };
const DEFAULT_CUSTOMERS: CustomersInfo = { totalUniqueCustomers: 0, newCustomersToday: 0 };
const DEFAULT_CHART_SERIES: ChartSeries[] = [
  { name: 'Ventas',    data: [] },
  { name: 'Servicios', data: [] },
];

// ─────────────────────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────────────────────

function generateTrendData(items: Array<{ created_at?: string }>): TrendData {
  if (!items?.length) return DEFAULT_TREND;

  const now         = Date.now();
  const dailyCounts = Array(SPARK_DAYS).fill(0);

  items.forEach(({ created_at }) => {
    if (!created_at) return;
    const diffDays = Math.floor((now - new Date(created_at).getTime()) / 86_400_000);
    if (diffDays < SPARK_DAYS) dailyCounts[SPARK_DAYS - 1 - diffDays]++;
  });

  const half      = Math.floor(SPARK_DAYS / 2);
  const prevTotal = dailyCounts.slice(0, half).reduce((a, b) => a + b, 0);
  const currTotal = dailyCounts.slice(half).reduce((a, b) => a + b, 0);

  const trend =
    prevTotal > 0 ? Math.round(((currTotal - prevTotal) / prevTotal) * 100)
    : currTotal > 0 ? 100
    : 0;

  let running = items.length - dailyCounts.reduce((a, b) => a + b, 0);
  const spark  = dailyCounts.map((d) => (running += d));

  return { trend, spark };
}

// ─────────────────────────────────────────────────────────────
// SUBCOMPONENTES
// ─────────────────────────────────────────────────────────────

const AmbientCanvas: React.FC<{ dark: boolean; isMobile: boolean }> = ({ dark, isMobile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx   = canvas.getContext('2d')!;
    let   rafId: number;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: isMobile ? 20 : 40 }, () => ({
      x:  Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015,
      r:  Math.random() * 1.4 + 0.4,
    }));

    const dotColor      = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
    const lineAlphaBase = dark ? 'rgba(255,255,255,' : 'rgba(0,0,0,';

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      dots.forEach((d) => {
        d.x = (d.x + d.vx + 1) % 1;
        d.y = (d.y + d.vy + 1) % 1;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx   = (dots[i].x - dots[j].x) * W;
          const dy   = (dots[i].y - dots[j].y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x * W, dots[i].y * H);
            ctx.lineTo(dots[j].x * W, dots[j].y * H);
            ctx.strokeStyle = lineAlphaBase + ((1 - dist / 130) * 0.06) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [dark, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

const AnimatedNumber: React.FC<{ to: number; prefix?: string }> = ({ to, prefix = '' }) => {
  const [value, setValue] = useState(0);
  const startTime         = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number;
    startTime.current = null;
    const DURATION = 1400;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const p     = Math.min((ts - startTime.current) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(eased * to));
      if (p < 1) rafId = requestAnimationFrame(animate);
    };
    const tid = setTimeout(() => { rafId = requestAnimationFrame(animate); }, 200);
    return () => { clearTimeout(tid); cancelAnimationFrame(rafId); };
  }, [to]);

  return <>{prefix}{value.toLocaleString()}</>;
};

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const W = 72, H = 30;
  if (!data || data.length < 2) return <div style={{ width: W, height: H }} />;

  const min  = Math.min(...data), max = Math.max(...data);
  const sx   = W / (data.length - 1);
  const sy   = (v: number) => H - ((v - min) / (max - min || 1)) * H;
  const pts  = data.map((v, i) => `${i * sx},${sy(v)}`).join(' ');
  const area = `0,${H} ${pts} ${(data.length - 1) * sx},${H}`;
  const gid  = `sg-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity=".2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────

function useMediaQuery(maxWidth: number): boolean {
  const [matches, setMatches] = useState(() => window.innerWidth < maxWidth);
  useEffect(() => {
    const mq      = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [maxWidth]);
  return matches;
}

function useBreakpoint() {
  const isMobile = useMediaQuery(640);
  const isTablet = useMediaQuery(1024);
  return { isMobile, isTablet, isDesktop: !isTablet };
}

function useClock() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const now = new Date();
  return {
    timeStr: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    dateStr: now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }),
  };
}

function useThemeTokens(dark: boolean) {
  return {
    surf:   dark ? '#111113' : '#ffffff',
    surf2:  dark ? '#1c1c1f' : '#f9f9fa',
    brd:    dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.09)',
    brdH:   dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.16)',
    txt:    dark ? '#e4e4e7' : '#18181b',
    txt2:   dark ? 'rgba(255,255,255,0.5)' : '#52525b',
    txt3:   dark ? 'rgba(255,255,255,0.3)' : '#71717a',
    up:     '#22c55e',
    dn:     '#f43f5e',
    acLine: dark ? '#71717a' : '#52525b',
  };
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

const NexiDashboard: React.FC = () => {
  const { persona, empresa }   = useAuthContext();
  const navigate               = useNavigate();
  const { getThemeMode }       = useSettings();
  const dark                   = getThemeMode() === 'dark';
  const { isMobile, isTablet } = useBreakpoint();
  const { timeStr, dateStr }   = useClock();
  const tk                     = useThemeTokens(dark);

  // ── Estado ────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  } | null>(null);

  const [pedidosPendientesCount, setPedidosPendientesCount] = useState(0);
  const [serviciosActivosCount,  setServiciosActivosCount]  = useState(0);
  const [sedesCount,             setSedesCount]             = useState(0);
  const [personalCount,          setPersonalCount]          = useState(0);

  const [pedidosTrend,   setPedidosTrend]   = useState<TrendData>(DEFAULT_TREND);
  const [serviciosTrend, setServiciosTrend] = useState<TrendData>(DEFAULT_TREND);
  const [sedesTrend,     setSedesTrend]     = useState<TrendData>(DEFAULT_TREND);
  const [personalTrend,  setPersonalTrend]  = useState<TrendData>(DEFAULT_TREND);

  const [ventasDesempeno,  setVentasDesempeno]  = useState<VentasDesempeno>(DEFAULT_VENTAS);
  const [customersInfo,    setCustomersInfo]    = useState<CustomersInfo>(DEFAULT_CUSTOMERS);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [chartSeries,      setChartSeries]      = useState<ChartSeries[]>(DEFAULT_CHART_SERIES);
  const [chartCategories,  setChartCategories]  = useState<string[]>(DEFAULT_CHART_CATEGORIES);

  // ── Aplica un DashboardCache completo al estado local ─────
  const applyDashboardData = useCallback((data: DashboardCache) => {
    setPedidosPendientesCount(data.pedidosPendientesCount);
    setPedidosTrend(data.pedidosTrend);
    setServiciosActivosCount(data.serviciosActivosCount);
    setServiciosTrend(data.serviciosTrend);
    setSedesCount(data.sedesCount);
    setSedesTrend(data.sedesTrend);
    setPersonalCount(data.personalCount);
    setPersonalTrend(data.personalTrend);
    setChartCategories(data.chartCategories);
    setChartSeries(data.chartSeries);
    setRecentActivities(data.recentActivities);
    setVentasDesempeno(data.ventasDesempeno);
    setCustomersInfo(data.customersInfo);
  }, []);

  // ── Fetch principal (paralelo) ────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!empresa?.id) {
      console.warn('NexiDashboard: empresa_id no disponible.');
      return;
    }
    if (!silent) setLoading(true);

    try {
      const id = empresa.id;
      const [
        resPedidos, resServicios, resSedes, resPersonal,
        resFlujo,   resVentas,   resCustomers,
      ] = await Promise.all([
        axios.get(`get_pedidos_pendientes?per_page=100&id_company=${id}`),
        axios.get(`servicios?id_company=${id}`),
        axios.get(`sedes?id_company=${id}`),
        axios.get(`responsables?id_company=${id}`),
        axios.get(`reporte_flujo_ventas?id_company=${id}`),
        axios.get(`total_all_ventas?id_company=${id}`),
        axios.get(`total_customers?id_company=${id}`),
      ]);

      let chartCats = DEFAULT_CHART_CATEGORIES;
      let chartSer  = DEFAULT_CHART_SERIES;
      if (resFlujo.data) {
        const entries = Object.values(resFlujo.data) as Array<{
          month: string; productSales: number; serviceSales: number;
        }>;
        if (entries.length) {
          chartCats = entries.map((v) => v.month);
          chartSer  = [
            { name: 'Ventas',    data: entries.map((v) => v.productSales) },
            { name: 'Servicios', data: entries.map((v) => v.serviceSales) },
          ];
        }
      }

      const pedidosData: Array<{
        id: number; estado: string; updated_at: string;
        tercero?: { nombre?: string }; created_at?: string;
      }> = resPedidos.data.data ?? [];

      const activities: Activity[] = pedidosData.slice(0, 5).map((p) => ({
        label: `Pedido #${p.id} - ${p.tercero?.nombre ?? 'Cliente'}`,
        meta:  `Estado: ${p.estado} · ${new Date(p.updated_at).toLocaleDateString()}`,
        icon:  'package',
        dot:   '#22c55e',
      }));

      const newData: DashboardCache = {
        pedidosPendientesCount: resPedidos.data.total ?? 0,
        pedidosTrend:           generateTrendData(pedidosData),
        serviciosActivosCount:  resServicios.data.length ?? 0,
        serviciosTrend:         generateTrendData(resServicios.data),
        sedesCount:             resSedes.data.length ?? 0,
        sedesTrend:             generateTrendData(resSedes.data),
        personalCount:          resPersonal.data.length ?? 0,
        personalTrend:          generateTrendData(resPersonal.data),
        chartCategories: chartCats,
        chartSeries:     chartSer,
        recentActivities: activities,
        ventasDesempeno:  resVentas.data   ?? DEFAULT_VENTAS,
        customersInfo:    resCustomers.data ?? DEFAULT_CUSTOMERS,
      };

      applyDashboardData(newData);
      localStorage.setItem(`nexiDashboardCache_${id}`, JSON.stringify(newData));
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : 'Error desconocido';
      console.error('NexiDashboard:', msg);
      if (!silent) setSnackbar({ message: 'Error al conectar con la API central.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [empresa?.id, applyDashboardData]);

  // ── Ref para fetchData (evita re-suscripciones a Pusher) ────
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // ── Carga inicial: caché → refresh silencioso ─────────────
  useEffect(() => {
    if (!empresa?.id) return;
    const cached = localStorage.getItem(`nexiDashboardCache_${empresa.id}`);
    if (cached) {
      try {
        applyDashboardData(JSON.parse(cached) as DashboardCache);
        setLoading(false);
        fetchData(true);
      } catch {
        fetchData();
      }
    } else {
      fetchData();
    }
  }, [empresa?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pusher: eventos en tiempo real ───────────────────────
  useEffect(() => {
    if (!empresa?.id) return;

    let pusher: Pusher | null = null;
    let channel: any = null;

    const timer = setTimeout(() => {
      pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER, forceTLS: true });
      channel = pusher.subscribe(`company.${empresa.id}`);

      channel.bind('new-order', (data: { order_id: number; customer_name: string }) => {
        setPedidosPendientesCount((prev) => prev + 1);
        setSnackbar({ message: `Nuevo pedido recibido: #${data.order_id}`, type: 'success' });
        setRecentActivities((prev) =>
          [{
            label: `Nuevo pedido #${data.order_id}`,
            meta:  `Cliente: ${data.customer_name} · Recién ahora`,
            icon:  'package',
            dot:   '#22c55e',
          }, ...prev].slice(0, 5)
        );
      });

      channel.bind('service-update', (data: { message: string }) => {
        setSnackbar({ message: `Actualización de servicio: ${data.message}`, type: 'info' });
        fetchDataRef.current(true);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (pusher) {
        try {
          if (channel) channel.unbind_all();
          pusher.unsubscribe(`company.${empresa.id}`);
          pusher.disconnect();
        } catch (err) {
          console.debug('Pusher disconnect error (safe to ignore):', err);
        }
      }
    };
  }, [empresa?.id]);

  // ── ApexCharts config ─────────────────────────────────────
  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        speed: 900,
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    colors: [tk.acLine, dark ? '#3f3f46' : '#71717a'],
    stroke: { curve: 'smooth', width: 1.5 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.15, opacityTo: 0, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: tk.brd,
      strokeDashArray: 3,
      padding: { left: -4, right: 0, top: -10 },
    },
    xaxis: {
      categories: chartCategories,
      axisBorder: { show: false },
      axisTicks:  { show: false },
      labels: { style: { colors: tk.txt2, fontSize: '10px', fontFamily: 'inherit' } },
    },
    yaxis: {
      labels: { style: { colors: tk.txt2, fontSize: '10px', fontFamily: 'inherit' } },
    },
    legend:  { show: false },
    tooltip: { theme: dark ? 'dark' : 'light', style: { fontFamily: 'inherit' } },
  };

  // ── CSS global ────────────────────────────────────────────
  const globalCSS = `
    /* Reset box-sizing dentro del dashboard */
    .nx, .nx *, .nx *::before, .nx *::after { box-sizing: border-box; }

    /* Animación de entrada */
    .nx-in { opacity:0; animation:nxFadeUp .55s cubic-bezier(.22,1,.36,1) forwards; }
    @keyframes nxFadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    .nx-d1{animation-delay:.03s} .nx-d2{animation-delay:.08s} .nx-d3{animation-delay:.14s}
    .nx-d4{animation-delay:.20s} .nx-d5{animation-delay:.27s}
    
    /* ApexCharts Passive Listener Fix */
    .apexcharts-canvas { touch-action: pan-y; }

    /* Dot live */
    .nx-live-dot {
      display:inline-block;width:7px;height:7px;border-radius:50%;
      background:${tk.up};margin-left:7px;vertical-align:middle;
      animation:nxBlink 1.5s ease-in-out infinite;
    }
    @keyframes nxBlink { 0%,100%{opacity:1} 50%{opacity:.25} }
    @keyframes nxPulse  { 0%,100%{opacity:1} 50%{opacity:.5}  }

    /* Ticker — el contenedor es position:relative; overflow:hidden
       por lo que el ancho intrínseco del ticker NO desborda al exterior */
    .nx-ticker-scroll { display:flex; animation:nxTick 30s linear infinite; white-space:nowrap; width:max-content; }
    @keyframes nxTick { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .nx-ticker-scroll:hover { animation-play-state:paused; }

    /* Filas y acciones */
    .nx-row:hover    { background:${dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)'}; }
    .nx-action:hover { background:${tk.surf2};border-color:${tk.brd} !important; }
    .nx-ghost:hover  { border-color:${tk.brdH} !important;color:${tk.txt} !important; }
    .nx-kpi          { transition:background .15s; }
    .nx-kpi:hover    { background:${tk.surf2}; }

    /* Scrollbar delgado */
    .nx-sb::-webkit-scrollbar       { width:3px; }
    .nx-sb::-webkit-scrollbar-track { background:transparent; }
    .nx-sb::-webkit-scrollbar-thumb { background:${tk.brd};border-radius:99px; }

    /* Header interior */
    .nx-header-inner {
      display:flex; flex-wrap:wrap; align-items:center;
      justify-content:space-between; gap:20px; padding:28px 36px;
    }
    .nx-header-right    { display:flex; align-items:center; gap:28px; flex-wrap:wrap; }
    .nx-header-counters { display:flex; align-items:center; gap:28px; flex-wrap:wrap; }

    /* Strip del gráfico */
    .nx-strip { display:grid; grid-template-columns:repeat(3,1fr); }

    /* ════ MOBILE < 640px ════ */
    @media (max-width:639px) {
      .nx-header-inner    { padding:18px 16px; gap:14px; }
      .nx-header-right    { width:100%; justify-content:space-between; gap:10px; }
      .nx-header-sep      { display:none !important; }
      .nx-header-counters { gap:14px; }
      .nx-clock-time      { font-size:1.25rem !important; }
      .nx-clock-date      { display:none !important; }
      .nx-ticker-wrap     { display:none !important; }
      .nx-strip           { grid-template-columns:1fr 1fr; gap:12px 0; }
      .nx-strip-item2     { border-right:none !important; }
      .nx-strip-item3     {
        border-top:1px solid ${tk.brd}; padding-top:12px;
        grid-column:1/-1; border-right:none !important; padding-left:0 !important;
      }
    }

    /* ════ TABLET 640–1023px ════ */
    @media (min-width:640px) and (max-width:1023px) {
      .nx-header-inner { padding:22px 24px; }
      .nx-header-right { gap:18px; }
    }
  `;

  // ── Datos derivados ───────────────────────────────────────
  const kpis = [
    { label: 'Servicios Activos',   value: serviciosActivosCount,  trend: serviciosTrend, icon: 'setting-2' },
    { label: 'Sedes Operativas',    value: sedesCount,             trend: sedesTrend,     icon: 'home' },
    { label: 'Personal Registrado', value: personalCount,          trend: personalTrend,  icon: 'profile-circle' },
    { label: 'Pedidos Pendientes',  value: pedidosPendientesCount, trend: pedidosTrend,   icon: 'time' },
  ];

  const quickActions = [
    { label: 'Gestión de servicios', icon: 'support', sub: 'Configuración',     path: '/configuracion/gestion-servicios' },
    { label: 'Ver pedidos',          icon: 'package', sub: 'Historial',         path: '/gestion-pedidos' },
    { label: 'Gestionar personal',   icon: 'users',   sub: 'Equipo de trabajo', path: '/gestion-personal' },
    { label: 'Configuración',        icon: 'setting', sub: 'Sistema',           path: '/empresa/configuracion-empresa' },
  ];

  const displayActivities: Activity[] = recentActivities.length > 0
    ? recentActivities
    : [
        { label: 'Sincronización completa', meta: 'Sistema · ahora',  icon: 'check', dot: tk.up },
        { label: 'Conectando a Pusher...',  meta: 'Dashboard · live', icon: 'time',  dot: tk.acLine },
      ];

  const skeletonStyle: React.CSSProperties = {
    background: tk.brdH,
    borderRadius: 4,
    animation: 'nxPulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
  };

  // Clases de grid adaptadas al breakpoint
  const kpiGridCls    = isMobile
    ? 'grid grid-cols-2 gap-3 mb-5'
    : isTablet
    ? 'grid grid-cols-2 gap-4 mb-6'
    : 'grid grid-cols-4 gap-4 mb-6';

  const mainGridCls   = isTablet
    ? 'grid grid-cols-1 gap-6 mb-6'
    : 'grid xl:grid-cols-3 gap-6 mb-6';

  const bottomGridCls = isMobile
    ? 'grid grid-cols-1 gap-6'
    : 'grid lg:grid-cols-2 gap-6';

  // Paddings adaptativos
  const cardPad    = isMobile ? '18px 16px'      : '32px 36px';
  const chartPad   = isMobile ? '18px 16px 14px' : '32px 36px 28px';
  const actPadHead = isMobile ? '18px 16px 12px' : '32px 24px 16px';
  const actPadRow  = isMobile ? '11px 16px'      : '13px 24px';
  const actPadFoot = isMobile ? '11px 16px'      : '14px 24px';

  // ─────────────────────────────────────────────────────────
  // RENDER
  // IMPORTANTE: Sin <Container> aquí — el padre Demo1LightSidebarPage
  // ya envuelve este componente en su propio <Container>.
  // ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{globalCSS}</style>

      {/*
        .nx es el único div raíz.
        - w-full + min-w-0:      ocupa el ancho disponible sin desbordarlo
        - overflow-x-hidden:     corta cualquier contenido que se salga
        - SIN padding propio:    el Container padre ya lo gestiona
      */}
      <div
        className="nx w-full min-w-0 overflow-x-hidden"
        style={{ color: tk.txt, fontFamily: 'inherit' }}
      >

        {/* ══ HEADER ══════════════════════════════════════════ */}
        <div
          className="nx-in nx-d1 relative overflow-hidden rounded-3xl mb-6"
          style={{ background: tk.surf, border: `1px solid ${tk.brd}` }}
        >
          <AmbientCanvas dark={dark} isMobile={isMobile} />

          <div className="nx-header-inner relative z-10">
            {/* Saludo */}
            <div>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: tk.txt2, marginBottom: 4,
              }}>
                Centro de operaciones
              </div>
              <h1 style={{
                fontSize: isMobile ? '1.2rem' : 'clamp(1.3rem,2.5vw,1.75rem)',
                fontWeight: 700, letterSpacing: '-0.025em',
                lineHeight: 1.1, color: tk.txt, margin: 0,
              }}>
                Bienvenido, {persona?.nombre1 ?? 'Administrador'}
              </h1>
              <div style={{ fontSize: 12, color: tk.txt2, marginTop: 3 }}>
                {empresa?.nombreEmpresa ?? 'NexiService'}
                <span className="nx-live-dot" aria-label="en línea" />
              </div>
            </div>

            {/* Reloj + contadores rápidos */}
            <div className="nx-header-right">
              <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                <div
                  className="nx-clock-time"
                  style={{
                    fontSize: 'clamp(1.5rem,2.2vw,2rem)', fontWeight: 700,
                    letterSpacing: '-0.04em', color: tk.txt,
                    lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {timeStr}
                </div>
                <div
                  className="nx-clock-date"
                  style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '.07em',
                    textTransform: 'uppercase', color: tk.txt2, marginTop: 3,
                  }}
                >
                  {dateStr}
                </div>
              </div>

              <div className="nx-header-sep" style={{ width: 1, height: 36, background: tk.brd }} />

              <div className="nx-header-counters">
                {[
                  { value: serviciosActivosCount,  label: 'Servicios' },
                  { value: pedidosPendientesCount, label: 'Pedidos' },
                  { value: personalCount,          label: 'Personal' },
                ].map(({ value, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: isMobile ? '1.1rem' : 'clamp(1.2rem,1.8vw,1.6rem)',
                      fontWeight: 700, letterSpacing: '-0.03em',
                      color: tk.txt, lineHeight: 1,
                    }}>
                      {value}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 9 : 10, fontWeight: 600,
                      letterSpacing: '.08em', textTransform: 'uppercase',
                      color: tk.txt2, marginTop: 3,
                    }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ TICKER (oculto en mobile via CSS) ══════════════════ */}
        {/*
          overflow:hidden en el wrapper es CRÍTICO:
          evita que el contenido animado (white-space:nowrap + width:max-content)
          expanda el ancho del documento y genere scroll horizontal.
        */}
        <div
          className="nx-in nx-d2 nx-ticker-wrap mb-6 rounded-2xl"
          style={{
            background: tk.surf2,
            border: `1px solid ${tk.brd}`,
            overflow: 'hidden',   /* ← corta el ticker */
            height: 30,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div className="nx-ticker-scroll">
            {[0, 1].flatMap((r) =>
              [
                `Servicios Activos ${serviciosActivosCount}`,
                `Personal Registrado ${personalCount}`,
                `Sedes Operativas ${sedesCount}`,
                `Pedidos Pendientes ${pedidosPendientesCount}`,
                'Uptime 99.9%',
                'Satisfacción 98%',
              ].map((text, i) => (
                <span
                  key={`${r}-${i}`}
                  style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: tk.txt3, padding: '0 36px',
                  }}
                >
                  {text}
                </span>
              ))
            )}
          </div>
        </div>

        {/* ══ KPI ROW ═════════════════════════════════════════ */}
        <div className={`nx-in nx-d3 ${kpiGridCls}`}>
          {kpis.map(({ label, value, trend }) => {
            const isPositive = trend.trend >= 0;
            const trendColor = isPositive ? tk.up : tk.dn;
            const trendBg    = isPositive
              ? (dark ? 'rgba(34,197,94,.08)' : 'rgba(34,197,94,.07)')
              : (dark ? 'rgba(244,63,94,.08)'  : 'rgba(244,63,94,.07)');

            return (
              <div
                key={label}
                className="nx-kpi rounded-2xl"
                style={{
                  background: tk.surf,
                  border: `1px solid ${tk.brd}`,
                  padding: isMobile ? '16px 16px' : '26px 32px',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: 10,
                }}>
                  <span style={{
                    fontSize: isMobile ? 9 : 10, fontWeight: 700,
                    letterSpacing: '.09em', textTransform: 'uppercase',
                    color: tk.txt2, lineHeight: 1.4, marginRight: 4,
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: trendColor,
                    background: trendBg, padding: '2px 6px',
                    borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {trend.trend > 0 ? '+' : ''}{trend.trend}%
                  </span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: isMobile
                      ? 'clamp(1.4rem,5vw,1.9rem)'
                      : 'clamp(1.8rem,3vw,2.6rem)',
                    fontWeight: 700, letterSpacing: '-0.03em',
                    lineHeight: 1, color: tk.txt,
                  }}>
                    {loading
                      ? <div style={{ width: 48, height: 26, ...skeletonStyle }} />
                      : <AnimatedNumber to={value} />
                    }
                  </span>
                  {!isMobile && <Sparkline data={trend.spark} color={trendColor} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* ══ GRÁFICO + ACTIVIDAD ══════════════════════════════ */}
        <div className={`nx-in nx-d4 ${mainGridCls}`}>

          {/* Gráfico de área */}
          <div
            className={isTablet ? 'rounded-3xl' : 'xl:col-span-2 rounded-3xl'}
            style={{ background: tk.surf, border: `1px solid ${tk.brd}`, padding: chartPad }}
          >
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', marginBottom: 6,
              flexWrap: 'wrap', gap: 8,
            }}>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                  textTransform: 'uppercase', color: tk.txt3,
                }}>
                  Rendimiento operativo
                </div>
                <h3 style={{
                  fontSize: isMobile ? 15 : 18, fontWeight: 700,
                  letterSpacing: '-0.02em', color: tk.txt, margin: '5px 0 0',
                }}>
                  Ventas vs Servicios
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {[
                  { l: 'Ventas',    c: tk.acLine },
                  { l: 'Servicios', c: dark ? '#3f3f46' : '#71717a' },
                ].map(({ l, c }) => (
                  <div key={l} style={{
                    display: 'flex', alignItems: 'center',
                    gap: 5, fontSize: 11, color: tk.txt2, fontWeight: 500,
                  }}>
                    <span style={{
                      width: 14, height: 2, background: c,
                      display: 'inline-block', borderRadius: 99,
                    }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            <ApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={isMobile ? 170 : 240}
            />

            <div style={{ height: 1, background: tk.brd, margin: '10px 0 18px' }} />
            <div className="nx-strip">
              {[
                { label: 'Total Ventas',      value: chartSeries[0].data.reduce((a, b) => a + b, 0), sub: 'Todo el periodo', cls: '' },
                { label: 'Total Servicios',   value: chartSeries[1].data.reduce((a, b) => a + b, 0), sub: 'Todo el periodo', cls: 'nx-strip-item2' },
                { label: 'Servicios Activos', value: serviciosActivosCount,                          sub: 'Actualmente',     cls: 'nx-strip-item3' },
              ].map(({ label, value, sub, cls }, i) => (
                <div
                  key={label}
                  className={cls}
                  style={{
                    borderRight:  i < 2 ? `1px solid ${tk.brd}` : 'none',
                    paddingRight: i < 2 ? 16 : 0,
                    paddingLeft:  i > 0 ? 16 : 0,
                  }}
                >
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.09em',
                    textTransform: 'uppercase', color: tk.txt3,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontSize: isMobile ? 16 : 20, fontWeight: 700,
                    letterSpacing: '-0.025em', color: tk.txt, margin: '3px 0 1px',
                  }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 11, color: tk.txt2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed de actividad */}
          <div
            className="flex flex-col rounded-3xl"
            style={{ background: tk.surf, border: `1px solid ${tk.brd}` }}
          >
            <div style={{ padding: actPadHead, borderBottom: `1px solid ${tk.brd}` }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: tk.txt3,
              }}>
                Feed
              </div>
              <h3 style={{
                fontSize: isMobile ? 15 : 17, fontWeight: 700,
                letterSpacing: '-0.02em', color: tk.txt, margin: '5px 0 0',
              }}>
                Actividad reciente
              </h3>
            </div>

            <div
              className="nx-sb overflow-y-auto grow"
              style={{ maxHeight: isMobile ? 240 : 350 }}
            >
              {loading
                ? Array(3).fill(null).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: actPadRow, borderBottom: `1px solid ${tk.brd}`,
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, ...skeletonStyle }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ width: '60%', height: 12, marginBottom: 4, ...skeletonStyle }} />
                        <div style={{ width: '40%', height: 10, ...skeletonStyle }} />
                      </div>
                    </div>
                  ))
                : displayActivities.map((activity, i) => (
                    <div
                      key={i}
                      className="nx-row"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: actPadRow,
                        borderBottom: i < displayActivities.length - 1
                          ? `1px solid ${tk.brd}` : 'none',
                        cursor: 'pointer', transition: 'background .14s',
                      }}
                    >
                      <div style={{
                        width: 30, height: 30, borderRadius: 7,
                        border: `1px solid ${tk.brd}`, background: tk.surf2,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontSize: 13, color: tk.txt2, display: 'flex' }}>
                          <KeenIcon icon={activity.icon} />
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 600, color: tk.txt,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {activity.label}
                        </div>
                        <div style={{ fontSize: 11, color: tk.txt2, marginTop: 1 }}>
                          {activity.meta}
                        </div>
                      </div>
                      <span style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: activity.dot, flexShrink: 0,
                      }} />
                    </div>
                  ))
              }
            </div>

            <div style={{ padding: actPadFoot, borderTop: `1px solid ${tk.brd}` }}>
              <button
                className="nx-ghost"
                style={{
                  width: '100%', padding: '8px 0', borderRadius: 7,
                  border: `1px solid ${tk.brd}`, background: 'transparent',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  color: tk.txt2, letterSpacing: '.04em',
                  fontFamily: 'inherit', transition: 'border-color .14s, color .14s',
                }}
              >
                Ver historial completo →
              </button>
            </div>
          </div>
        </div>

        {/* ══ DESEMPEÑO + ACCESOS RÁPIDOS ════════════════════ */}
        <div className={`nx-in nx-d5 ${bottomGridCls} pb-6`}>

          {/* Desempeño */}
          <div
            className="rounded-3xl"
            style={{ background: tk.surf, border: `1px solid ${tk.brd}`, padding: cardPad }}
          >
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: tk.txt3, marginBottom: 4,
            }}>
              Resumen de Desempeño
            </div>
            <h3 style={{
              fontSize: isMobile ? 15 : 17, fontWeight: 700,
              letterSpacing: '-0.02em', color: tk.txt, margin: '0 0 20px',
            }}>
              Ventas y Clientes
            </h3>

            {[
              {
                label: 'Crecimiento de Ventas vs Mes Anterior',
                displayValue: `${ventasDesempeno.porcentajeAumento > 0 ? '+' : ''}${Math.round(ventasDesempeno.porcentajeAumento)}%`,
                pct:   Math.min(Math.max(ventasDesempeno.porcentajeAumento, 0), 100),
                color: ventasDesempeno.porcentajeAumento >= 0 ? tk.up : tk.dn,
              },
              {
                label: 'Ventas Totales del Mes',
                displayValue: `$${parseFloat(ventasDesempeno.ventasMesActual.toString()).toLocaleString('es-CO')}`,
                pct:   100,
                color: tk.acLine,
              },
              {
                label: 'Total Clientes Históricos',
                displayValue: String(customersInfo.totalUniqueCustomers),
                pct:   100,
                color: '#8b5cf6',
              },
              {
                label: 'Nuevos Clientes (Hoy)',
                displayValue: `+${customersInfo.newCustomersToday}`,
                pct:   Math.min(customersInfo.newCustomersToday * 10, 100),
                color: tk.up,
              },
            ].map(({ label, displayValue, pct, color }) => (
              <div key={label} style={{ marginBottom: isMobile ? 16 : 22 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 12, fontWeight: 500, color: tk.txt2,
                  marginBottom: 7, gap: 8,
                }}>
                  <span style={{ flex: 1, minWidth: 0 }}>{label}</span>
                  <span style={{
                    fontWeight: 700, color, whiteSpace: 'nowrap', flexShrink: 0,
                  }}>
                    {displayValue}
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 99, background: tk.brd }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 99,
                    background: color, transition: 'width 1.2s cubic-bezier(.4,0,.2,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div
            className="rounded-3xl"
            style={{ background: tk.surf, border: `1px solid ${tk.brd}`, padding: cardPad }}
          >
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: tk.txt3, marginBottom: 4,
            }}>
              Acciones
            </div>
            <h3 style={{
              fontSize: isMobile ? 15 : 17, fontWeight: 700,
              letterSpacing: '-0.02em', color: tk.txt, margin: '0 0 12px',
            }}>
              Acceso rápido
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {quickActions.map(({ label, icon, sub, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="nx-action"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: isMobile ? '12px 10px' : '10px 12px',
                    borderRadius: 9, cursor: 'pointer',
                    border: '1px solid transparent', background: 'transparent',
                    width: '100%', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'background .14s, border-color .14s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: tk.surf2, border: `1px solid ${tk.brd}`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 14, color: tk.txt2, display: 'flex' }}>
                      <KeenIcon icon={icon} />
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: tk.txt }}>{label}</div>
                    <div style={{ fontSize: 11, color: tk.txt2 }}>{sub}</div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', fontSize: 13,
                    color: tk.txt3, flexShrink: 0,
                  }}>
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
    </>
  );
};

export default NexiDashboard;