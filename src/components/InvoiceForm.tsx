import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Check,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { getRubroById } from '@/data/rubros';
import { cn, formatearFecha, calcularVencimiento, tasasIVA, tasasIRPF } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Cliente, Servicio, LineaFactura } from '@/types';

interface InvoiceFormProps {
  onCancel: () => void;
  onSave: () => void;
}

const steps = [
  { id: 1, label: 'Cliente', labelShort: 'Cli', icon: User },
  { id: 2, label: 'Artículos', labelShort: 'Art', icon: Package },
  { id: 3, label: 'Revisión', labelShort: 'Rev', icon: FileText }
];

export function InvoiceForm({ onCancel, onSave }: InvoiceFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [numeroExiste, setNumeroExiste] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [searchServicio, setSearchServicio] = useState('');
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const { 
    empresa, 
    clientes, 
    servicios, 
    facturaActual, 
    updateFacturaActual,
    addLinea,
    removeLinea,
    verificarNumeroExiste,
    getProximoNumero,
    addFactura,
    resetFacturaActual,
    generarId,
    formatearMoneda
  } = useAppStore();

  const rubro = empresa ? getRubroById(empresa.rubroPrincipal) : null;

  // Inicializar número de factura sugerido
  useEffect(() => {
    if (!facturaActual.numero && empresa) {
      const sugerido = getProximoNumero();
      updateFacturaActual({ numero: sugerido });
    }
  }, [empresa]);

  const handleNumeroChange = (valor: string) => {
    updateFacturaActual({ numero: valor.toUpperCase() });
    if (valor.length > 2) {
      const existe = verificarNumeroExiste(valor);
      setNumeroExiste(existe);
    } else {
      setNumeroExiste(false);
    }
  };

  const generarNumeroSugerido = () => {
    const sugerido = getProximoNumero();
    updateFacturaActual({ numero: sugerido });
    setNumeroExiste(false);
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
    const clienteData = { ...cliente };
    updateFacturaActual({ 
      clienteId: cliente.id,
      cliente: clienteData,
      fechaVencimiento: calcularVencimiento(
        facturaActual.fechaEmision || new Date().toISOString().split('T')[0],
        30
      )
    });
    setShowClienteModal(false);
  };

  const handleAddServicio = (servicio: Servicio) => {
    const ivaRate = servicio.iva || empresa?.ivaDefault || 21;
    const irpfRate = servicio.irpf || empresa?.irpfDefault || 0;
    const base = servicio.precio;
    const ivaAmount = base * (ivaRate / 100);
    const irpfAmount = base * (irpfRate / 100);
    const total = base + ivaAmount - irpfAmount;

    const linea: LineaFactura = {
      id: generarId(),
      descripcion: servicio.nombre,
      cantidad: 1,
      precioUnitario: servicio.precio,
      iva: ivaRate,
      irpf: irpfRate,
      descuento: 0,
      total,
      servicioId: servicio.id
    };
    addLinea(linea);
    setShowServicioModal(false);
  };

  const handleAddLineaManual = () => {
    const linea: LineaFactura = {
      id: generarId(),
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      iva: empresa?.ivaDefault || 21,
      irpf: 0,
      descuento: 0,
      total: 0
    };
    addLinea(linea);
  };

  const handleUpdateLinea = (index: number, field: keyof LineaFactura, value: any) => {
    const lineas = facturaActual.lineas || [];
    const linea = { ...lineas[index], [field]: value };
    
    // Recalcular total
    const base = linea.precioUnitario * linea.cantidad;
    const descuento = base * (linea.descuento / 100);
    const baseConDescuento = base - descuento;
    const iva = baseConDescuento * (linea.iva / 100);
    const irpf = baseConDescuento * (linea.irpf / 100);
    linea.total = baseConDescuento + iva - irpf;
    
    const nuevasLineas = [...lineas];
    nuevasLineas[index] = linea;
    
    // Recalcular totales
    const subtotal = nuevasLineas.reduce((sum, l) => sum + (l.precioUnitario * l.cantidad), 0);
    const totalDescuento = nuevasLineas.reduce((sum, l) => {
      const b = l.precioUnitario * l.cantidad;
      return sum + (b * (l.descuento / 100));
    }, 0);
    const totalIva = nuevasLineas.reduce((sum, l) => {
      const b = l.precioUnitario * l.cantidad;
      const d = b * (l.descuento / 100);
      return sum + ((b - d) * (l.iva / 100));
    }, 0);
    const totalIrpf = nuevasLineas.reduce((sum, l) => {
      const b = l.precioUnitario * l.cantidad;
      const d = b * (l.descuento / 100);
      return sum + ((b - d) * (l.irpf / 100));
    }, 0);
    const total = subtotal - totalDescuento + totalIva - totalIrpf;
    
    updateFacturaActual({ 
      lineas: nuevasLineas,
      subtotal,
      totalDescuento,
      totalIva,
      totalIrpf,
      total
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
      id: generarId(),
      numero: facturaActual.numero,
      estado: 'enviada' as const,
      clienteId: facturaActual.clienteId,
      cliente: facturaActual.cliente,
      fechaEmision: facturaActual.fechaEmision || new Date().toISOString().split('T')[0],
      fechaVencimiento: facturaActual.fechaVencimiento || calcularVencimiento(new Date().toISOString().split('T')[0], 30),
      lineas: facturaActual.lineas || [],
      subtotal: facturaActual.subtotal || 0,
      totalDescuento: facturaActual.totalDescuento || 0,
      totalIva: facturaActual.totalIva || 0,
      totalIrpf: facturaActual.totalIrpf || 0,
      total: facturaActual.total || 0,
      notas: facturaActual.notas,
      terminos: facturaActual.terminos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    addFactura(factura);
    resetFacturaActual();
    toast.success('Factura guardada correctamente');
    onSave();
  };

  // Renderizar paso 1: Cliente
  const renderStepCliente = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-primary" />
            Seleccionar {rubro?.terminologia.cliente || 'Cliente'}
          </CardTitle>
          <CardDescription>
            Elige un {rubro?.terminologia.cliente.toLowerCase() || 'cliente'} existente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clienteSeleccionado ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{clienteSeleccionado.nombre}</h4>
                    {clienteSeleccionado.nifCif && (
                      <p className="text-sm text-muted-foreground">NIF/CIF: {clienteSeleccionado.nifCif}</p>
                    )}
                    {clienteSeleccionado.email && (
                      <p className="text-sm text-muted-foreground">{clienteSeleccionado.email}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => updateFacturaActual({ clienteId: '', cliente: undefined })}
                >
                  Cambiar
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full h-24 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => setShowClienteModal(true)}
            >
              <User className="w-6 h-6 mr-2" />
              Seleccionar {rubro?.terminologia.cliente.toLowerCase() || 'cliente'}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
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
            Número de {rubro?.terminologia.factura || 'Factura'}
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

      {/* Servicios */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              {rubro?.terminologia.servicio || 'Artículos'}
            </CardTitle>
            <CardDescription>
              Añade {rubro?.terminologia.servicio.toLowerCase() || 'artículos'} a la factura
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
                <div key={linea.id} className="bg-muted/50 rounded-xl p-4 space-y-3">
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
                          value={String(linea.iva)}
                          onValueChange={(v) => handleUpdateLinea(index, 'iva', parseFloat(v))}
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
                          value={String(linea.irpf)}
                          onValueChange={(v) => handleUpdateLinea(index, 'irpf', parseFloat(v))}
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
                            value={linea.descuento}
                            onChange={(e) => handleUpdateLinea(index, 'descuento', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => removeLinea(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold">
                      Total línea: {formatearMoneda(linea.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Revisar {rubro?.terminologia.factura || 'Factura'}
          </CardTitle>
          <CardDescription>
            Revise los detalles antes de guardar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Número:</span>
              <span className="font-mono font-semibold">{facturaActual.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{rubro?.terminologia.cliente || 'Cliente'}:</span>
              <span className="font-semibold">{clienteSeleccionado?.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha emisión:</span>
              <span>{formatearFecha(facturaActual.fechaEmision || '')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha vencimiento:</span>
              <span>{formatearFecha(facturaActual.fechaVencimiento || '')}</span>
            </div>
          </div>

          <Separator />

          {/* Líneas */}
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left py-3 px-4">Concepto</th>
                  <th className="text-center py-3 px-2">Cant.</th>
                  <th className="text-right py-3 px-2">Precio</th>
                  <th className="text-right py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {facturaActual.lineas?.map((linea) => (
                  <tr key={linea.id}>
                    <td className="py-3 px-4">{linea.descripcion}</td>
                    <td className="text-center py-3 px-2">{linea.cantidad}</td>
                    <td className="text-right py-3 px-2">{formatearMoneda(linea.precioUnitario)}</td>
                    <td className="text-right py-3 px-4 font-medium">{formatearMoneda(linea.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator />

          {/* Totales */}
          <div className="bg-primary/5 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatearMoneda(facturaActual.subtotal || 0)}</span>
            </div>
            {facturaActual.totalDescuento ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento:</span>
                <span className="text-red-500">-{formatearMoneda(facturaActual.totalDescuento)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA:</span>
              <span>{formatearMoneda(facturaActual.totalIva || 0)}</span>
            </div>
            {facturaActual.totalIrpf ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IRPF:</span>
                <span className="text-red-500">-{formatearMoneda(facturaActual.totalIrpf)}</span>
              </div>
            ) : null}
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>{formatearMoneda(facturaActual.total || 0)}</span>
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
            placeholder={`Buscar ${rubro?.terminologia.cliente.toLowerCase() || 'cliente'}...`}
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className={isMobile ? "h-[50vh]" : "h-[400px]"}>
          <div className="space-y-2">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  className="w-full text-left p-4 rounded-xl hover:bg-muted transition-colors border"
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
                No se encontraron {rubro?.terminologia.cliente.toLowerCase() || 'cliente'}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );

    if (isMobile) {
      return (
        <Sheet open={showClienteModal} onOpenChange={setShowClienteModal}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Seleccionar {rubro?.terminologia.cliente || 'Cliente'}</SheetTitle>
              <SheetDescription>
                Elige un {rubro?.terminologia.cliente.toLowerCase() || 'cliente'} para la factura
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
            <DialogTitle>Seleccionar {rubro?.terminologia.cliente || 'Cliente'}</DialogTitle>
            <DialogDescription>
              Elige un {rubro?.terminologia.cliente.toLowerCase() || 'cliente'} para la factura
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
            placeholder={`Buscar ${rubro?.terminologia.servicio.toLowerCase() || 'servicio'}...`}
            value={searchServicio}
            onChange={(e) => setSearchServicio(e.target.value)}
            className="pl-9"
          />
        </div>
        <ScrollArea className={isMobile ? "h-[50vh]" : "h-[400px]"}>
          <div className="space-y-2">
            {filteredServicios.length > 0 ? (
              filteredServicios.map((servicio) => (
                <button
                  key={servicio.id}
                  className="w-full text-left p-4 rounded-xl hover:bg-muted transition-colors border"
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
                      {formatearMoneda(servicio.precio)}
                    </Badge>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron {rubro?.terminologia.servicio.toLowerCase() || 'servicio'}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );

    if (isMobile) {
      return (
        <Sheet open={showServicioModal} onOpenChange={setShowServicioModal}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader>
              <SheetTitle>Servicios del Catálogo</SheetTitle>
              <SheetDescription>
                Selecciona un {rubro?.terminologia.servicio.toLowerCase() || 'servicio'} para añadir
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
              Selecciona un {rubro?.terminologia.servicio.toLowerCase() || 'servicio'} para añadir
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
      {/* Header con stepper */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nueva {rubro?.terminologia.factura || 'Factura'}</h1>
          <p className="text-muted-foreground">Paso {currentStep} de {steps.length}</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = canNavigateTo(step.id);
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && handleStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : isCompleted
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  !isClickable && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center rounded-full text-xs font-bold w-6 h-6",
                  isActive || isCompleted ? "bg-white/20" : "bg-muted-foreground/20"
                )}>
                  {step.id}
                </span>
                <span className="hidden sm:inline text-sm font-medium">{step.label}</span>
                <span className="sm:hidden text-xs font-medium">{step.labelShort}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="w-8 h-px bg-border mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Contenido del paso */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {currentStep === 1 && renderStepCliente()}
          {currentStep === 2 && renderStepArticulos()}
          {currentStep === 3 && renderStepRevision()}
        </motion.div>
      </AnimatePresence>

      {/* Botones de navegación */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Atrás'}
        </Button>
        
        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGuardarFactura}
            disabled={!canProceed()}
          >
            <Check className="w-4 h-4 mr-2" />
            Guardar {rubro?.terminologia.factura || 'Factura'}
          </Button>
        )}
      </div>

      {/* Modales */}
      {renderClienteModal()}
      {renderServicioModal()}
    </div>
  );
}
