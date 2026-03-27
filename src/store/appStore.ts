import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Empresa, 
  Cliente, 
  Servicio, 
  Factura, 
  LineaFactura, 
  DashboardStats,
  IngresoMensual
} from '@/types';

interface AppState {
  // Onboarding
  onboardingCompletado: boolean;
  setOnboardingCompletado: (completado: boolean) => void;
  
  // Empresa
  empresa: Empresa | null;
  setEmpresa: (empresa: Empresa) => void;
  updateEmpresa: (updates: Partial<Empresa>) => void;
  
  // Clientes
  clientes: Cliente[];
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  getClienteById: (id: string) => Cliente | undefined;
  
  // Servicios
  servicios: Servicio[];
  addServicio: (servicio: Servicio) => void;
  updateServicio: (id: string, updates: Partial<Servicio>) => void;
  deleteServicio: (id: string) => void;
  incrementarUsoServicio: (id: string) => void;
  
  // Facturas
  facturas: Factura[];
  addFactura: (factura: Factura) => void;
  updateFactura: (id: string, updates: Partial<Factura>) => void;
  deleteFactura: (id: string) => void;
  getFacturaByNumero: (numero: string) => Factura | undefined;
  verificarNumeroExiste: (numero: string) => boolean;
  getProximoNumero: () => string;
  
  // Factura actual (en creación)
  facturaActual: Partial<Factura>;
  setFacturaActual: (factura: Partial<Factura>) => void;
  updateFacturaActual: (updates: Partial<Factura>) => void;
  resetFacturaActual: () => void;
  addLinea: (linea: LineaFactura) => void;
  removeLinea: (index: number) => void;
  updateLinea: (index: number, updates: Partial<LineaFactura>) => void;
  calcularTotales: () => void;
  
  // Dashboard
  getDashboardStats: () => DashboardStats;
  getIngresosMensuales: () => IngresoMensual[];
  
  // Tema
  tema: 'light' | 'dark';
  toggleTema: () => void;
  
  // Utilidades
  generarId: () => string;
  formatearMoneda: (valor: number) => string;
}

const calcularTotalesFactura = (lineas: LineaFactura[]) => {
  const subtotal = lineas.reduce((sum, l) => sum + (l.precioUnitario * l.cantidad), 0);
  const totalDescuento = lineas.reduce((sum, l) => {
    const base = l.precioUnitario * l.cantidad;
    return sum + (base * (l.descuento / 100));
  }, 0);
  const totalIva = lineas.reduce((sum, l) => {
    const base = l.precioUnitario * l.cantidad;
    const desc = base * (l.descuento / 100);
    return sum + ((base - desc) * (l.iva / 100));
  }, 0);
  const totalIrpf = lineas.reduce((sum, l) => {
    const base = l.precioUnitario * l.cantidad;
    const desc = base * (l.descuento / 100);
    return sum + ((base - desc) * (l.irpf / 100));
  }, 0);
  const total = subtotal - totalDescuento + totalIva - totalIrpf;
  
  return { subtotal, totalDescuento, totalIva, totalIrpf, total };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Onboarding
      onboardingCompletado: false,
      setOnboardingCompletado: (completado) => set({ onboardingCompletado: completado }),
      
      // Empresa
      empresa: null,
      setEmpresa: (empresa) => set({ empresa }),
      updateEmpresa: (updates) => set((state) => ({
        empresa: state.empresa ? { ...state.empresa, ...updates, updatedAt: new Date().toISOString() } : null
      })),
      
      // Clientes
      clientes: [],
      addCliente: (cliente) => set((state) => ({ 
        clientes: [...state.clientes, cliente] 
      })),
      updateCliente: (id, updates) => set((state) => ({
        clientes: state.clientes.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
      })),
      deleteCliente: (id) => set((state) => ({
        clientes: state.clientes.filter(c => c.id !== id)
      })),
      getClienteById: (id) => get().clientes.find(c => c.id === id),
      
      // Servicios
      servicios: [],
      addServicio: (servicio) => set((state) => ({ 
        servicios: [...state.servicios, servicio] 
      })),
      updateServicio: (id, updates) => set((state) => ({
        servicios: state.servicios.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)
      })),
      deleteServicio: (id) => set((state) => ({
        servicios: state.servicios.filter(s => s.id !== id)
      })),
      incrementarUsoServicio: (id) => set((state) => ({
        servicios: state.servicios.map(s => s.id === id ? { ...s, usoCount: s.usoCount + 1 } : s)
      })),
      
      // Facturas
      facturas: [],
      addFactura: (factura) => set((state) => {
        const empresa = state.empresa;
        if (empresa) {
          return { 
            facturas: [...state.facturas, factura],
            empresa: { ...empresa, secuenciaFactura: empresa.secuenciaFactura + 1 }
          };
        }
        return { facturas: [...state.facturas, factura] };
      }),
      updateFactura: (id, updates) => set((state) => ({
        facturas: state.facturas.map(f => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f)
      })),
      deleteFactura: (id) => set((state) => ({
        facturas: state.facturas.filter(f => f.id !== id)
      })),
      getFacturaByNumero: (numero) => get().facturas.find(f => f.numero === numero),
      verificarNumeroExiste: (numero) => get().facturas.some(f => f.numero === numero),
      getProximoNumero: () => {
        const empresa = get().empresa;
        if (!empresa) return 'FV-00001';
        const anio = new Date().getFullYear();
        const seq = String(empresa.secuenciaFactura).padStart(5, '0');
        return `${empresa.prefijoFactura}-${anio}-${seq}`;
      },
      
      // Factura actual
      facturaActual: {
        lineas: [],
        estado: 'borrador',
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      setFacturaActual: (factura) => set({ facturaActual: factura }),
      updateFacturaActual: (updates) => set((state) => ({
        facturaActual: { ...state.facturaActual, ...updates }
      })),
      resetFacturaActual: () => set({
        facturaActual: {
          lineas: [],
          estado: 'borrador',
          fechaEmision: new Date().toISOString().split('T')[0],
          fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }),
      addLinea: (linea) => set((state) => {
        const lineas = [...(state.facturaActual.lineas || []), linea];
        const totales = calcularTotalesFactura(lineas);
        return { facturaActual: { ...state.facturaActual, lineas, ...totales } };
      }),
      removeLinea: (index) => set((state) => {
        const lineas = state.facturaActual.lineas?.filter((_, i) => i !== index) || [];
        const totales = calcularTotalesFactura(lineas);
        return { facturaActual: { ...state.facturaActual, lineas, ...totales } };
      }),
      updateLinea: (index, updates) => set((state) => {
        const lineas = state.facturaActual.lineas?.map((l, i) => 
          i === index ? { ...l, ...updates } : l
        ) || [];
        const totales = calcularTotalesFactura(lineas);
        return { facturaActual: { ...state.facturaActual, lineas, ...totales } };
      }),
      calcularTotales: () => set((state) => {
        const totales = calcularTotalesFactura(state.facturaActual.lineas || []);
        return { facturaActual: { ...state.facturaActual, ...totales } };
      }),
      
      // Dashboard
      getDashboardStats: () => {
        const facturas = get().facturas;
        const clientes = get().clientes;
        
        const facturasPagadas = facturas.filter(f => f.estado === 'pagada');
        const facturasPendientes = facturas.filter(f => f.estado === 'enviada' || f.estado === 'vista');
        const facturasVencidas = facturas.filter(f => f.estado === 'vencida');
        
        const totalPendiente = facturasPendientes.reduce((sum, f) => sum + f.total, 0);
        const totalPagadoMes = facturasPagadas
          .filter(f => {
            const fecha = new Date(f.fechaEmision);
            const hoy = new Date();
            return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
          })
          .reduce((sum, f) => sum + f.total, 0);
        
        const totalFacturado = facturas.reduce((sum, f) => sum + f.total, 0);
        const totalPagado = facturasPagadas.reduce((sum, f) => sum + f.total, 0);
        const tasaConversion = totalFacturado > 0 ? (totalPagado / totalFacturado) * 100 : 0;
        
        const ticketPromedio = facturasPagadas.length > 0 
          ? totalPagado / facturasPagadas.length 
          : 0;
        
        // Cliente top
        const clienteFacturacion: Record<string, number> = {};
        facturasPagadas.forEach(f => {
          clienteFacturacion[f.clienteId] = (clienteFacturacion[f.clienteId] || 0) + f.total;
        });
        const clienteTopId = Object.entries(clienteFacturacion)
          .sort((a, b) => b[1] - a[1])[0]?.[0];
        const clienteTop = clientes.find(c => c.id === clienteTopId)?.nombre || '-';
        
        return {
          totalPendiente,
          totalPagadoMes,
          tasaConversion,
          ticketPromedio,
          facturasPendientes: facturasPendientes.length,
          facturasPagadas: facturasPagadas.length,
          facturasVencidas: facturasVencidas.length,
          clienteTop
        };
      },
      getIngresosMensuales: () => {
        const facturas = get().facturas.filter(f => f.estado === 'pagada');
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const ingresosPorMes: Record<string, { ingresos: number; facturas: number }> = {};
        
        facturas.forEach(f => {
          const fecha = new Date(f.fechaEmision);
          const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
          if (!ingresosPorMes[key]) {
            ingresosPorMes[key] = { ingresos: 0, facturas: 0 };
          }
          ingresosPorMes[key].ingresos += f.total;
          ingresosPorMes[key].facturas += 1;
        });
        
        // Últimos 12 meses
        const resultado: IngresoMensual[] = [];
        const hoy = new Date();
        for (let i = 11; i >= 0; i--) {
          const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
          const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
          resultado.push({
            mes: meses[fecha.getMonth()],
            ingresos: ingresosPorMes[key]?.ingresos || 0,
            facturas: ingresosPorMes[key]?.facturas || 0
          });
        }
        
        return resultado;
      },
      
      // Tema
      tema: 'light',
      toggleTema: () => set((state) => ({ tema: state.tema === 'light' ? 'dark' : 'light' })),
      
      // Utilidades
      generarId: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      formatearMoneda: (valor) => {
        const empresa = get().empresa;
        const simbolo = empresa?.moneda === 'USD' ? '$' : empresa?.moneda === 'GBP' ? '£' : '€';
        return `${simbolo} ${valor.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }),
    {
      name: 'verifactus-storage',
      partialize: (state) => ({
        onboardingCompletado: state.onboardingCompletado,
        empresa: state.empresa,
        clientes: state.clientes,
        servicios: state.servicios,
        facturas: state.facturas,
        tema: state.tema
      })
    }
  )
);
