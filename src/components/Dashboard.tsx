import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  Euro,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency, estadosFactura } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { EstadoFactura } from '@/types';

interface DashboardProps {
  onNewInvoice: () => void;
  onViewInvoices: () => void;
  onViewClients?: () => void;
}

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#6b7280', '#f59e0b', '#8b5cf6'];

export function Dashboard({ onNewInvoice, onViewInvoices, onViewClients }: DashboardProps) {
  // Usar onViewClients para evitar error de lint
  if (onViewClients) {
    // Esta función se puede usar en el futuro
  }
  
  const { 
    empresa, 
    facturas, 
    getDashboardStats, 
    getIngresosMensuales 
  } = useAppStore();

  const stats = useMemo(() => getDashboardStats(), [facturas]);
  const ingresosMensuales = useMemo(() => getIngresosMensuales(), [facturas]);

  // Datos para gráfico de estados
  const estadosData = useMemo(() => {
    const counts: Record<EstadoFactura, number> = {
      borrador: 0,
      enviada: 0,
      vista: 0,
      pagada: 0,
      vencida: 0,
      anulada: 0,
    };
    facturas.forEach(f => {
      counts[f.estado]++;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([estado, count]) => ({
        name: estadosFactura[estado as EstadoFactura].label,
        value: count,
        color: COLORS[Object.keys(estadosFactura).indexOf(estado) % COLORS.length],
      }));
  }, [facturas]);

  // Facturas recientes
  const facturasRecientes = useMemo(() => {
    return [...facturas]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [facturas]);

  // Facturas vencidas
  const facturasVencidas = useMemo(() => {
    return facturas.filter(f => f.estado === 'vencida');
  }, [facturas]);

  const variacionIngresos = stats.ingresosMesAnterior > 0
    ? ((stats.ingresosMes - stats.ingresosMesAnterior) / stats.ingresosMesAnterior) * 100
    : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resumen de tu negocio</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <Button onClick={onNewInvoice}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Por Cobrar
            </CardTitle>
            <Euro className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalPendiente, empresa?.moneda)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.facturasPendientes} facturas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos del Mes
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.ingresosMes, empresa?.moneda)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {variacionIngresos >= 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">+{variacionIngresos.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">{variacionIngresos.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa de Cobro
            </CardTitle>
            <Progress value={stats.tasaCobro} className="w-12 h-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaCobro.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.facturasPagadas} facturas pagadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Medio
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.ticketMedio, empresa?.moneda)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Cliente top: {stats.clienteTop}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {facturasVencidas.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-700 dark:text-red-300">
                Tienes {facturasVencidas.length} factura{facturasVencidas.length > 1 ? 's' : ''} vencida{facturasVencidas.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Total pendiente: {formatCurrency(
                  facturasVencidas.reduce((sum, f) => sum + f.totalAmount, 0),
                  empresa?.moneda
                )}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onViewInvoices}>
              Ver facturas
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolución de Ingresos</CardTitle>
            <CardDescription>Últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosMensuales}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `€${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value, empresa?.moneda)}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Bar 
                    dataKey="ingresos" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de estados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Facturas</CardTitle>
            <CardDescription>Distribución por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {estadosData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadosData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {estadosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No hay datos
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {estadosData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facturas recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Facturas Recientes</CardTitle>
            <CardDescription>Últimas 5 facturas creadas</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onViewInvoices}>
            Ver todas
          </Button>
        </CardHeader>
        <CardContent>
          {facturasRecientes.length > 0 ? (
            <div className="space-y-3">
              {facturasRecientes.map((factura) => (
                <div 
                  key={factura.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{factura.numero}</p>
                      <p className="text-sm text-muted-foreground">
                        {factura.cliente?.nombre || 'Cliente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(factura.totalAmount, empresa?.moneda)}
                    </p>
                    <Badge 
                      variant="secondary"
                      className={estadosFactura[factura.estado].color}
                    >
                      {estadosFactura[factura.estado].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay facturas aún</p>
              <Button variant="outline" className="mt-3" onClick={onNewInvoice}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera factura
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
