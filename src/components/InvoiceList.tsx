import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Download, 
  Trash2,
  Plus,
  ArrowLeft,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/appStore';
import { getRubroById } from '@/data/rubros';
import { estadosFactura, formatearFecha } from '@/lib/utils';
import { downloadInvoicePDF } from '@/services/pdfGenerator';
import type { EstadoFactura } from '@/types';

interface InvoiceListProps {
  onBack: () => void;
  onNewInvoice: () => void;
  onViewInvoice?: (id: string) => void;
}

export function InvoiceList({ onBack, onNewInvoice, onViewInvoice }: InvoiceListProps) {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFactura | 'todos'>('todos');
  
  const { facturas, clientes, deleteFactura, empresa, formatearMoneda } = useAppStore();

  const rubro = empresa ? getRubroById(empresa.rubroPrincipal) : null;

  const facturasFiltradas = useMemo(() => {
    return facturas.filter((factura) => {
      const cliente = clientes.find(c => c.id === factura.clienteId);
      const matchesSearch = 
        factura.numero.toLowerCase().includes(search.toLowerCase()) ||
        cliente?.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesEstado = filtroEstado === 'todos' || factura.estado === filtroEstado;
      return matchesSearch && matchesEstado;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [facturas, clientes, search, filtroEstado]);

  const handleDelete = (id: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar esta ${rubro?.terminologia.factura.toLowerCase() || 'factura'}?`)) {
      deleteFactura(id);
    }
  };

  const handleDuplicar = (_factura: typeof facturas[0]) => {
    // TODO: Implementar duplicación
    alert('Función de duplicar en desarrollo');
  };

  const handleDownloadPDF = (factura: typeof facturas[0]) => {
    if (!empresa) {
      alert('Error: No hay configuración de empresa');
      return;
    }
    const cliente = clientes.find(c => c.id === factura.clienteId);
    downloadInvoicePDF(factura, cliente, empresa);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{rubro?.terminologia.factura || 'Factura'}s</h1>
        </div>
        <Button onClick={onNewInvoice}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva {rubro?.terminologia.factura || 'Factura'}
        </Button>
      </div>

      {/* Filtros */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar factura..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={filtroEstado} 
                onValueChange={(v) => setFiltroEstado(v as EstadoFactura | 'todos')}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="vista">Vista</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">
            {facturasFiltradas.length} factura{facturasFiltradas.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {facturasFiltradas.length > 0 ? (
            <div className="space-y-3">
              {facturasFiltradas.map((factura) => {
                const cliente = clientes.find(c => c.id === factura.clienteId);
                return (
                  <div 
                    key={factura.id} 
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{factura.numero}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {cliente?.nombre || 'Cliente eliminado'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatearFecha(factura.fechaEmision)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="font-semibold">
                          {formatearMoneda(factura.total)}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={`${estadosFactura[factura.estado].bg} ${estadosFactura[factura.estado].textColor}`}
                      >
                        {estadosFactura[factura.estado].label}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewInvoice?.(factura.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicar(factura)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(factura)}>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(factura.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron facturas</p>
              {(search || filtroEstado !== 'todos') && (
                <p className="text-sm">Prueba con otros filtros</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
