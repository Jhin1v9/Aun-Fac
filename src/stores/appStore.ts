import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Empresa, 
  Cliente, 
  Servicio, 
  Factura, 
  LineaFactura,
  DashboardStats,
  IngresosMensuales,
  TemaColor
} from '@/types';

interface AppState {
  // Onboarding
  onboardingCompletado: boolean;
  setOnboardingCompletado: (completado: boolean) => void;
  
  // Empresa
  empresa: Empresa | null;
  setEmpresa: (empresa: Empresa | null) => void;
  updateEmpresa: (updates: Partial<Empresa>) => void;
  
  // Clientes
  clientes: Cliente[];
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, updates: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  getClienteById: (id: string) => Cliente | undefined;
  
  // Servicios
  servicios: Servicio[];
  setServicios: (servicios: Servicio[]) => void;
  addServicio: (servicio: Servicio) => void;
  updateServicio: (id: string, updates: Partial<Servicio>) => void;
  deleteServicio: (id: string) => void;
  incrementarUsoServicio: (id: string) => void;
  
  // Facturas
  facturas: Factura[];
  setFacturas: (facturas: Factura[]) => void;
  addFactura: (factura: Factura) => void;
  updateFactura: (id: string, updates: Partial<Factura>) => void;
  deleteFactura: (id: string) => void;
  getFacturaByNumero: (numero: string) => Factura | undefined;
  verificarNumeroExiste: (numero: string, excludeId?: string) => boolean;
  getUltimoNumeroFactura: () => number;
  
  // Factura actual (en creación)
  facturaActual: Partial<Factura>;
  setFacturaActual: (factura: Partial<Factura>) => void;
  updateFacturaActual: (updates: Partial<Factura>) => void;
  resetFacturaActual: () => void;
  addLineaFactura: (linea: LineaFactura) => void;
  removeLineaFactura: (index: number) => void;
  updateLineaFactura: (index: number, updates: Partial<LineaFactura>) => void;
  calcularTotales: () => void;
  
  // Dashboard
  getDashboardStats: () => DashboardStats;
  getIngresosMensuales: () => IngresosMensuales[];
  
  // Tema
  tema: TemaColor;
  setTema: (tema: TemaColor) => void;
  coloresPersonalizados: {
    primario: string;
    secundario: string;
    destacado: string;
  };
  setColoresPersonalizados: (colores: { primario: string; secundario: string; destacado: string }) => void;
}



const defaultFacturaActual: Partial<Factura> = {
  numero: '',
  tipo: 'completa',
  estado: 'borrador',
  clienteId: '',
  fechaEmision: new Date().toISOString().split('T')[0],
  fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  lineas: [],
  subtotal: 0,
  totalIva: 0,
  totalIrpf: 0,
  totalDescuento: 0,
  totalAmount: 0,
  terminos: 'Plazo de pago: 30 días',
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
      setClientes: (clientes) => set({ clientes }),
      addCliente: (cliente) => set((state) => ({ clientes: [...state.clientes, cliente] })),
      updateCliente: (id, updates) => set((state) => ({
        clientes: state.clientes.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
      })),
      deleteCliente: (id) => set((state) => ({
        clientes: state.clientes.filter((c) => c.id !== id)
      })),
      getClienteById: (id) => get().clientes.find((c) => c.id === id),
      
      // Servicios
      servicios: [],
      setServicios: (servicios) => set({ servicios }),
      addServicio: (servicio) => set((state) => ({ servicios: [...state.servicios, servicio] })),
      updateServicio: (id, updates) => set((state) => ({
        servicios: state.servicios.map((s) => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)
      })),
      deleteServicio: (id) => set((state) => ({
        servicios: state.servicios.filter((s) => s.id !== id)
      })),
      incrementarUsoServicio: (id) => set((state) => ({
        servicios: state.servicios.map((s) => s.id === id ? { ...s, usoCount: s.usoCount + 1 } : s)
      })),
      
      // Facturas
      facturas: [],
      setFacturas: (facturas) => set({ facturas }),
      addFactura: (factura) => set((state) => ({ 
        facturas: [...state.facturas, factura],
        empresa: state.empresa ? { 
          ...state.empresa, 
          secuenciaFactura: state.empresa.secuenciaFactura + 1 
        } : null
      })),
      updateFactura: (id, updates) => set((state) => ({
        facturas: state.facturas.map((f) => f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f)
      })),
      deleteFactura: (id) => set((state) => ({
        facturas: state.facturas.filter((f) => f.id !== id)
      })),
      getFacturaByNumero: (numero) => get().facturas.find((f) => f.numero === numero),
      verificarNumeroExiste: (numero, excludeId) => {
        const facturas = get().facturas;
        return facturas.some((f) => f.numero === numero && f.id !== excludeId);
      },
      getUltimoNumeroFactura: () => {
        const empresa = get().empresa;
        return empresa?.secuenciaFactura || 1;
      },
      
      // Factura actual
      facturaActual: { ...defaultFacturaActual },
      setFacturaActual: (factura) => set({ facturaActual: factura }),
      updateFacturaActual: (updates) => set((state) => ({
        facturaActual: { ...state.facturaActual, ...updates }
      })),
      resetFacturaActual: () => set({ facturaActual: { ...defaultFacturaActual } }),
      addLineaFactura: (linea) => set((state) => {
        const nuevasLineas = [...(state.facturaActual.lineas || []), linea];
        const totales = calcularTotalesFactura(nuevasLineas);
        return {
          facturaActual: { 
            ...state.facturaActual, 
            lineas: nuevasLineas,
            ...totales
          }
        };
      }),
      removeLineaFactura: (index) => set((state) => {
        const nuevasLineas = state.facturaActual.lineas?.filter((_, i) => i !== index) || [];
        const totales = calcularTotalesFactura(nuevasLineas);
        return {
          facturaActual: { 
            ...state.facturaActual, 
            lineas: nuevasLineas,
            ...totales
          }
        };
      }),
      updateLineaFactura: (index, updates) => set((state) => {
        const nuevasLineas = state.facturaActual.lineas?.map((linea, i) => 
          i === index ? { ...linea, ...updates } : linea
        ) || [];
        const totales = calcularTotalesFactura(nuevasLineas);
        return {
          facturaActual: { 
            ...state.facturaActual, 
            lineas: nuevasLineas,
            ...totales
          }
        };
      }),
      calcularTotales: () => set((state) => {
        const totales = calcularTotalesFactura(state.facturaActual.lineas || []);
        return {
          facturaActual: { 
            ...state.facturaActual, 
            ...totales
          }
        };
      }),
      
      // Dashboard
      getDashboardStats: () => {
        const facturas = get().facturas;
        const clientes = get().clientes;
        
        const facturasPagadas = facturas.filter((f) => f.estado === 'pagada');
        const facturasPendientes = facturas.filter((f) => f.estado === 'enviada' || f.estado === 'vista');
        const facturasVencidas = facturas.filter((f) => f.estado === 'vencida');
        
        const totalPendiente = facturasPendientes.reduce((sum, f) => sum + f.totalAmount, 0);
        const totalPagado = facturasPagadas.reduce((sum, f) => sum + f.totalAmount, 0);
        const totalFacturado = totalPendiente + totalPagado;
        
        const tasaCobro = totalFacturado > 0 ? (totalPagado / totalFacturado) * 100 : 0;
        
        // Cliente top
        const clienteFacturacion: Record<string, number> = {};
        facturas.forEach((f) => {
          if (f.estado === 'pagada') {
            clienteFacturacion[f.clienteId] = (clienteFacturacion[f.clienteId] || 0) + f.totalAmount;
          }
        });
        const clienteTopId = Object.entries(clienteFacturacion).sort((a, b) => b[1] - a[1])[0]?.[0];
        const clienteTop = clientes.find((c) => c.id === clienteTopId)?.nombre || 'Sin datos';
        
        // Ticket medio
        const ticketMedio = facturasPagadas.length > 0 
          ? totalPagado / facturasPagadas.length 
          : 0;
        
        // Ingresos del mes
        const mesActual = new Date().getMonth();
        const anoActual = new Date().getFullYear();
        const ingresosMes = facturasPagadas
          .filter((f) => {
            const fecha = new Date(f.fechaEmision);
            return fecha.getMonth() === mesActual && fecha.getFullYear() === anoActual;
          })
          .reduce((sum, f) => sum + f.totalAmount, 0);
        
        // Ingresos mes anterior
        const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
        const anoAnterior = mesActual === 0 ? anoActual - 1 : anoActual;
        const ingresosMesAnterior = facturasPagadas
          .filter((f) => {
            const fecha = new Date(f.fechaEmision);
            return fecha.getMonth() === mesAnterior && fecha.getFullYear() === anoAnterior;
          })
          .reduce((sum, f) => sum + f.totalAmount, 0);
        
        return {
          totalPendiente,
          tasaCobro,
          clienteTop,
          ticketMedio,
          facturasPendientes: facturasPendientes.length,
          facturasPagadas: facturasPagadas.length,
          facturasVencidas: facturasVencidas.length,
          ingresosMes,
          ingresosMesAnterior,
        };
      },
      getIngresosMensuales: () => {
        const facturas = get().facturas.filter((f) => f.estado === 'pagada');
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        const ingresosPorMes: Record<string, { ingresos: number; facturas: number }> = {};
        
        facturas.forEach((f) => {
          const fecha = new Date(f.fechaEmision);
          const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
          if (!ingresosPorMes[key]) {
            ingresosPorMes[key] = { ingresos: 0, facturas: 0 };
          }
          ingresosPorMes[key].ingresos += f.totalAmount;
          ingresosPorMes[key].facturas += 1;
        });
        
        // Últimos 12 meses
        const resultado: IngresosMensuales[] = [];
        const hoy = new Date();
        for (let i = 11; i >= 0; i--) {
          const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
          const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
          resultado.push({
            mes: meses[fecha.getMonth()],
            ingresos: ingresosPorMes[key]?.ingresos || 0,
            facturas: ingresosPorMes[key]?.facturas || 0,
          });
        }
        
        return resultado;
      },
      
      // Tema
      tema: 'azul',
      setTema: (tema) => set({ tema }),
      coloresPersonalizados: {
        primario: '#3b82f6',
        secundario: '#6366f1',
        destacado: '#8b5cf6',
      },
      setColoresPersonalizados: (colores) => set({ coloresPersonalizados: colores }),
    }),
    {
      name: 'verifactus-storage',
      partialize: (state) => ({
        onboardingCompletado: state.onboardingCompletado,
        empresa: state.empresa,
        clientes: state.clientes,
        servicios: state.servicios,
        facturas: state.facturas,
        tema: state.tema,
        coloresPersonalizados: state.coloresPersonalizados,
      }),
    }
  )
);

// Helper para calcular totales
function calcularTotalesFactura(lineas: LineaFactura[]) {
  const subtotal = lineas.reduce((sum, linea) => 
    sum + (linea.precioUnitario * linea.cantidad), 0
  );
  
  const totalDescuento = lineas.reduce((sum, linea) => {
    const base = linea.precioUnitario * linea.cantidad;
    return sum + (base * (linea.descuentoPercent / 100));
  }, 0);
  
  const baseImponible = subtotal - totalDescuento;
  
  const totalIva = lineas.reduce((sum, linea) => {
    const base = linea.precioUnitario * linea.cantidad;
    const descuento = base * (linea.descuentoPercent / 100);
    return sum + ((base - descuento) * (linea.ivaRate / 100));
  }, 0);
  
  const totalIrpf = lineas.reduce((sum, linea) => {
    const base = linea.precioUnitario * linea.cantidad;
    const descuento = base * (linea.descuentoPercent / 100);
    return sum + ((base - descuento) * (linea.irpfRate / 100));
  }, 0);
  
  const totalAmount = baseImponible + totalIva - totalIrpf;
  
  return {
    subtotal,
    totalIva,
    totalIrpf,
    totalDescuento,
    totalAmount,
  };
}
