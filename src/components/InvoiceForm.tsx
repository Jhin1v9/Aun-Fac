import { useState, useEffect } from 'react';
import { 
  Hash, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  User,
  Package,
  FileText,
  Plus,
  Trash2,
  Search,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, generateId, calcularFechaVencimiento, tasasIVA, tasasIRPF } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { InvoiceStepper } from './InvoiceStepper';
import type { Cliente, Servicio, LineaFactura } from '@/types';

const steps = [
  { id: 1, label: 'Cliente', labelShort: 'Cli' },
  { id: 2, label: 'Artículos', labelShort: 'Art' },
  { id: 3, label: 'Revisión', labelShort: 'Rev' }
];

export function InvoiceForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [numeroExiste, setNumeroExiste] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [searchServicio, setSearchServicio] = useState('');
  
  const isMobile = useIsMobile();
  
  const { 
    empresa, 
    clientes, 
    servicios, 
    facturaActual, 
    updateFacturaActual,
    addLineaFactura,
    removeLineaFactura,
    verificarNumeroExiste,
    getUltimoNumeroFactura,
    addFactura,
    resetFacturaActual
  } = useAppStore();

  // Inicializar número de factura sugerido
  useEffect(() => {
    if (!facturaActual.numero && empresa) {
      generarNumeroSugerido();
    }
  }, []);

  const generarNumeroSugerido = () => {
    if (!empresa) return;
    const ano = new Date().getFullYear();
    const ultimoNumero = getUltimoNumeroFactura();
    const secuencia = String(ultimoNumero).padStart(5, '0');
    const numeroSugerido = `${empresa.prefijoFactura}-${ano}-${secuencia}`;
    updateFacturaActual({ numero: numeroSugerido });
  };

  const handleNumeroChange = (valor: string) => {
    updateFacturaActual({ numero: valor.toUpperCase() });
    if (valor.length > 2) {
      const existe = verificarNumeroExiste(valor);
      setNumeroExiste(existe);
    } else {
      setNumeroExiste(false);
    }
  };

  const canNavigateTo = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return !!facturaActual.clienteId;
    if (stepId === 3) return !!facturaActual.clienteId && (facturaActual.lineas?.length || 0) > 0;
    return false;
  };

  const handleStepClick = (stepId: number) => {
    if (canNavigateTo(stepId)) {
      setCurrentStep(stepId);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    updateFacturaActual({ 
      clienteId: cliente.id,
      fechaVencimiento: calcularFechaVencimiento(
        facturaActual.fechaEmision || new Date().toISOString().split('T')[0],
        cliente.diasPago
      )
    });
    setShowClienteModal(false);
  };

  const handleAddServicio = (servicio: Servicio) => {
    const linea: LineaFactura = {
      id: generateId(),
      descripcion: servicio.nombre,
      cantidad: 1,
      precioUnitario: servicio.precioPorDefecto,
      ivaRate: servicio.ivaRate,
      ivaAmount: servicio.precioPorDefecto * (servicio.ivaRate / 100),
      irpfRate: servicio.irpfAplicable ? (empresa?.irpfPorDefecto || 0) : 0,
      irpfAmount: servicio.irpfAplicable ? (servicio.precioPorDefecto * ((empresa?.irpfPorDefecto || 0) / 100)) : 0,
      descuentoPercent: 0,
      totalLinea: servicio.precioPorDefecto,
    };
    addLineaFactura(linea);
    setShowServicioModal(false);
  };

  const handleAddLineaManual = () => {
    const linea: LineaFactura = {
      id: generateId(),
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      ivaRate: empresa?.ivaPorDefecto || 21,
      ivaAmount: 0,
      irpfRate: 0,
      irpfAmount: 0,
      descuentoPercent: 0,
      totalLinea: 0,
    };
    addLineaFactura(linea);
  };

  const handleUpdateLinea = (index: number, field: keyof LineaFactura, value: any) => {
    const lineas = facturaActual.lineas || [];
    const linea = { ...lineas[index], [field]: value };
    
    // Recalcular totales
    const base = linea.precioUnitario * linea.cantidad;
    const descuento = base * (linea.descuentoPercent / 100);
    const baseConDescuento = base - descuento;
    
    linea.ivaAmount = baseConDescuento * (linea.ivaRate / 100);
    linea.irpfAmount = baseConDescuento * (linea.irpfRate / 100);
    linea.totalLinea = baseConDescuento + linea.ivaAmount - linea.irpfAmount;
    
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = linea;
    
    updateFacturaActual({ lineas: nuevasLineas });
    
    // Recalcular totales de la factura
    const subtotal = nuevasLineas.reduce((sum, l) => sum + (l.precioUnitario * l.cantidad), 0);
    const totalDescuento = nuevasLineas.reduce((sum, l) => {
      const b = l.precioUnitario * l.cantidad;
      return sum + (b * (l.descuentoPercent / 100));
    }, 0);
    const totalIva = nuevasLineas.reduce((sum, l) => sum + l.ivaAmount, 0);
    const totalIrpf = nuevasLineas.reduce((sum, l) => sum + l.irpfAmount, 0);
    const totalAmount = subtotal - totalDescuento + totalIva - totalIrpf;
    
    updateFacturaActual({
      subtotal,
      totalDescuento,
      totalIva,
      totalIrpf,
      totalAmount
    });
  };

  const clienteSeleccionado = clientes.find(c => c.id === facturaActual.clienteId);

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
    c.nifCif?.toLowerCase().includes(searchCliente.toLowerCase())
  );

  const filteredServicios = servicios.filter(s => 
    s.nombre.toLowerCase().includes(searchServicio.toLowerCase())
  );

  const canProceed = () => {
    if (currentStep === 1) return !!facturaActual.clienteId;
    if (currentStep === 2) return (facturaActual.lineas?.length || 0) > 0 && !numeroExiste;
    return true;
  };

  const handleGuardarFactura = () => {
    if (!facturaActual.numero || !facturaActual.clienteId) return;
    
    const factura = {
      id: generateId(),
      ...facturaActual,
      estado: 'enviada' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addFactura(factura as any);
    resetFacturaActual();
    setCurrentStep(1);
  };

  // Renderizar paso 1: Cliente
  const renderStepCliente = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Seleccionar Cliente
          </CardTitle>
          <CardDescription>
            Elige un cliente existente o crea uno nuevo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSeleccionado ? (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{clienteSeleccionado.nombre}</h4>
                  {clienteSeleccionado.nifCif && (
                    <p className="text-sm text-muted-foreground">NIF/CIF: {clienteSeleccionado.nifCif}</p>
                  )}
                  {clienteSeleccionado.email && (
                    <p className="text-sm text-muted-foreground">{clienteSeleccionado.email}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFacturaActual({ clienteId: '' })}
                >
                  Cambiar
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-24 border-dashed"
              onClick={() => setShowClienteModal(true)}
            >
              <User className="w-5 h-5 mr-2" />
              Seleccionar cliente
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Fechas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fechaEmision">Fecha de emisión</Label>
            <Input
              id="fechaEmision"
              type="date"
              value={facturaActual.fechaEmision || ''}
              onChange={(e) => updateFacturaActual({ fechaEmision: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
            <Input
              id="fechaVencimiento"
              type="date"
              value={facturaActual.fechaVencimiento || ''}
              onChange={(e) => updateFacturaActual({ fechaVencimiento: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Renderizar paso 2: Artículos
  const renderStepArticulos = () => (
    <div className="space-y-6">
      {/* Número de factura editable */}
      <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Número de Factura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="numeroFactura" className="text-sm font-medium">
                Número <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numeroFactura"
                value={facturaActual.numero || ''}
                onChange={(e) => handleNumeroChange(e.target.value)}
                placeholder="Ej: FV-2024-00001"
                className={cn(
                  "font-mono text-lg uppercase tracking-wider transition-colors",
                  numeroExiste && "border-red-500 focus-visible:ring-red-500"
                )}
                maxLength={20}
              />
              {numeroExiste && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Este número ya existe. Use otro.
                </p>
              )}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={generarNumeroSugerido}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Sugerir
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Este número aparecerá en el documento PDF final y debe ser único.
          </p>
        </CardContent>
      </Card>

      {/* Servicios del catálogo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              Artículos
            </CardTitle>
            <CardDescription>
              Añade servicios o productos a la factura
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowServicioModal(true)}
            >
              <Search className="w-4 h-4 mr-1" />
              Catálogo
            </Button>
            <Button 
              size="sm"
              onClick={handleAddLineaManual}
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {facturaActual.lineas && facturaActual.lineas.length > 0 ? (
            <div className="space-y-3">
              {facturaActual.lineas.map((linea, index) => (
                <div key={linea.id} className="bg-muted/50 rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="text-xs">Descripción</Label>
                      <Input
                        value={linea.descripcion}
                        onChange={(e) => handleUpdateLinea(index, 'descripcion', e.target.value)}
                        placeholder="Descripción del artículo"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <Label className="text-xs">Cant.</Label>
                        <Input
                          type="number"
                          min="1"
                          value={linea.cantidad}
                          onChange={(e) => handleUpdateLinea(index, 'cantidad', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Precio</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={linea.precioUnitario}
                          onChange={(e) => handleUpdateLinea(index, 'precioUnitario', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">IVA %</Label>
                        <Select
                          value={String(linea.ivaRate)}
                          onValueChange={(v) => handleUpdateLinea(index, 'ivaRate', parseFloat(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tasasIVA.map((tasa) => (
                              <SelectItem key={tasa.valor} value={String(tasa.valor)}>
                                {tasa.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">IRPF %</Label>
                        <Select
                          value={String(linea.irpfRate)}
                          onValueChange={(v) => handleUpdateLinea(index, 'irpfRate', parseFloat(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {tasasIRPF.map((tasa) => (
                              <SelectItem key={tasa.valor} value={String(tasa.valor)}>
                                {tasa.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Dto. %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={linea.descuentoPercent}
                            onChange={(e) => handleUpdateLinea(index, 'descuentoPercent', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-500"
                          onClick={() => removeLineaFactura(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold">
                      Total línea: {formatCurrency(linea.totalLinea, empresa?.moneda)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Ningún artículo añadido</p>
              <p className="text-sm">Añade artículos desde el catálogo o manualmente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Renderizar paso 3: Revisión
  const renderStepRevision = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Revisar Factura
          </CardTitle>
          <CardDescription>
            Revise los detalles antes de guardar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número:</span>
              <span className="font-mono font-semibold">{facturaActual.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-semibold">{clienteSeleccionado?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha emisión:</span>
              <span>{facturaActual.fechaEmision}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha vencimiento:</span>
              <span>{facturaActual.fechaVencimiento}</span>
            </div>
          </div>

          {/* Líneas */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-2 px-3">Concepto</th>
                  <th className="text-center py-2 px-2">Cant.</th>
                  <th className="text-right py-2 px-2">Precio</th>
                  <th className="text-right py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {facturaActual.lineas?.map((linea) => (
                  <tr key={linea.id}>
                    <td className="py-2 px-3">{linea.descripcion}</td>
                    <td className="text-center py-2 px-2">{linea.cantidad}</td>
                    <td className="text-right py-2 px-2">{formatCurrency(linea.precioUnitario, empresa?.moneda)}</td>
                    <td className="text-right py-2 px-3 font-medium">{formatCurrency(linea.totalLinea, empresa?.moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(facturaActual.subtotal || 0, empresa?.moneda)}</span>
            </div>
            {facturaActual.totalDescuento ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento:</span>
                <span className="text-red-500">-{formatCurrency(facturaActual.totalDescuento, empresa?.moneda)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA:</span>
              <span>{formatCurrency(facturaActual.totalIva || 0, empresa?.moneda)}</span>
            </div>
            {facturaActual.totalIrpf ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IRPF:</span>
                <span className="text-red-500">-{formatCurrency(facturaActual.totalIrpf, empresa?.moneda)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>TOTAL:</span>
              <span>{formatCurrency(facturaActual.totalAmount || 0, empresa?.moneda)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Modal de selección de cliente
  const renderClienteModal = () => {
    const content = (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className={isMobile ? "h-[60vh]" : "h-[400px]"}>
          <div className="space-y-2">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border"
                  onClick={() => handleSelectCliente(cliente)}
                >
                  <div className="font-medium">{cliente.nombre}</div>
                  {cliente.nifCif && (
                    <div className="text-sm text-muted-foreground">NIF/CIF: {cliente.nifCif}</div>
                  )}
                  {cliente.email && (
                    <div className="text-sm text-muted-foreground">{cliente.email}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron clientes
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );

    if (isMobile) {
      return (
        <Sheet open={showClienteModal} onOpenChange={setShowClienteModal}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Seleccionar Cliente</SheetTitle>
              <SheetDescription>
                Elige un cliente para la factura
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">{content}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Seleccionar Cliente</DialogTitle>
            <DialogDescription>
              Elige un cliente para la factura
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            {content}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  // Modal de selección de servicio
  const renderServicioModal = () => {
    const content = (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar servicio..."
            value={searchServicio}
            onChange={(e) => setSearchServicio(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className={isMobile ? "h-[60vh]" : "h-[400px]"}>
          <div className="space-y-2">
            {filteredServicios.length > 0 ? (
              filteredServicios.map((servicio) => (
                <button
                  key={servicio.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border"
                  onClick={() => handleAddServicio(servicio)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{servicio.nombre}</div>
                      {servicio.descripcion && (
                        <div className="text-sm text-muted-foreground line-clamp-1">{servicio.descripcion}</div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {formatCurrency(servicio.precioPorDefecto, empresa?.moneda)}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron servicios
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );

    if (isMobile) {
      return (
        <Sheet open={showServicioModal} onOpenChange={setShowServicioModal}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>Servicios del Catálogo</SheetTitle>
              <SheetDescription>
                Selecciona un servicio para añadir
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">{content}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <Dialog open={showServicioModal} onOpenChange={setShowServicioModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Servicios del Catálogo</DialogTitle>
            <DialogDescription>
              Selecciona un servicio para añadir
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            {content}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <InvoiceStepper
        currentStep={currentStep}
        steps={steps}
        onStepClick={handleStepClick}
        canNavigateTo={canNavigateTo}
      />

      {/* Contenido del paso */}
      <div className="pb-24">
        {currentStep === 1 && renderStepCliente()}
        {currentStep === 2 && renderStepArticulos()}
        {currentStep === 3 && renderStepRevision()}
      </div>

      {/* Botones de navegación fijos */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-3 safe-area-pb z-50">
        {currentStep > 1 && (
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 h-12"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Atrás</span>
          </Button>
        )}
        {currentStep < 3 ? (
          <Button 
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="flex-1 h-12"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ArrowRight className="w-5 h-5 sm:ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleGuardarFactura}
            className="flex-1 h-12"
          >
            <Check className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Guardar Factura</span>
          </Button>
        )}
      </div>

      {/* Modales */}
      {renderClienteModal()}
      {renderServicioModal()}
    </div>
  );
}
