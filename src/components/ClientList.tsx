import { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';
import type { Cliente } from '@/types';

interface ClientListProps {
  onBack: () => void;
}

export function ClientList({ onBack }: ClientListProps) {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  
  const { clientes, facturas, deleteCliente, empresa } = useAppStore();

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch = 
        cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
        cliente.nifCif?.toLowerCase().includes(search.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientes, search]);

  const getFacturasCliente = (clienteId: string) => {
    return facturas.filter(f => f.clienteId === clienteId);
  };

  const getTotalFacturado = (clienteId: string) => {
    return facturas
      .filter(f => f.clienteId === clienteId && f.estado === 'pagada')
      .reduce((sum, f) => sum + f.totalAmount, 0);
  };

  const handleDelete = (id: string) => {
    const facturasCliente = getFacturasCliente(id);
    if (facturasCliente.length > 0) {
      alert('No puedes eliminar un cliente que tiene facturas asociadas.');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      deleteCliente(id);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Clientes</h1>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {clientesFiltrados.length} cliente{clientesFiltrados.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientesFiltrados.length > 0 ? (
            <div className="space-y-3">
              {clientesFiltrados.map((cliente) => {
                const facturasCliente = getFacturasCliente(cliente.id);
                const totalFacturado = getTotalFacturado(cliente.id);
                
                return (
                  <div 
                    key={cliente.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{cliente.nombre}</p>
                        {cliente.nifCif && (
                          <p className="text-sm text-muted-foreground">
                            NIF/CIF: {cliente.nifCif}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {cliente.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {cliente.email}
                            </span>
                          )}
                          {cliente.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {cliente.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Total facturado</p>
                        <p className="font-semibold">
                          {formatCurrency(totalFacturado, empresa?.moneda)}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {facturasCliente.length} factura{facturasCliente.length !== 1 ? 's' : ''}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedClient(cliente)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(cliente.id)}
                            className="text-red-500"
                            disabled={facturasCliente.length > 0}
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
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron clientes</p>
              {search && (
                <p className="text-sm">Prueba con otra búsqueda</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedClient.nombre}</p>
                  {selectedClient.nifCif && (
                    <p className="text-sm text-muted-foreground">
                      NIF/CIF: {selectedClient.nifCif}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedClient.email && (
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p>{selectedClient.email}</p>
                  </div>
                )}
                {selectedClient.telefono && (
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p>{selectedClient.telefono}</p>
                  </div>
                )}
                {selectedClient.direccion && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Dirección</p>
                    <p>{selectedClient.direccion}</p>
                    <p>
                      {selectedClient.codigoPostal} {selectedClient.ciudad}, {selectedClient.provincia}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Resumen de facturas</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">
                      {getFacturasCliente(selectedClient.id).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Facturas</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">
                      {formatCurrency(getTotalFacturado(selectedClient.id), empresa?.moneda)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total facturado</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
