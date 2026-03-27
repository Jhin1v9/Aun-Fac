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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/appStore';
import { getRubroById } from '@/data/rubros';
import type { Cliente } from '@/types';

interface ClientListProps {
  onBack: () => void;
}

export function ClientList({ onBack }: ClientListProps) {
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [newClient, setNewClient] = useState({
    nombre: '',
    email: '',
    telefono: '',
    nifCif: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  });
  
  const { clientes, facturas, addCliente, deleteCliente, formatearMoneda, empresa, generarId } = useAppStore();

  const rubro = empresa ? getRubroById(empresa.rubroPrincipal) : null;

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
      .reduce((sum, f) => sum + f.total, 0);
  };

  const handleAddClient = () => {
    if (!newClient.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    const cliente: Cliente = {
      id: generarId(),
      nombre: newClient.nombre,
      email: newClient.email,
      telefono: newClient.telefono,
      nifCif: newClient.nifCif,
      direccion: newClient.direccion,
      ciudad: newClient.ciudad,
      codigoPostal: newClient.codigoPostal,
      totalFacturado: 0,
      facturasCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addCliente(cliente);
    setNewClient({
      nombre: '',
      email: '',
      telefono: '',
      nifCif: '',
      direccion: '',
      ciudad: '',
      codigoPostal: ''
    });
    setShowAddDialog(false);
  };

  const handleDelete = (id: string) => {
    const facturasCliente = getFacturasCliente(id);
    if (facturasCliente.length > 0) {
      alert(`No puedes eliminar un ${rubro?.terminologia.cliente.toLowerCase() || 'cliente'} que tiene facturas asociadas.`);
      return;
    }
    if (confirm(`¿Estás seguro de que quieres eliminar este ${rubro?.terminologia.cliente.toLowerCase() || 'cliente'}?`)) {
      deleteCliente(id);
    }
  };

  const handleViewDetail = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{rubro?.terminologia.cliente || 'Cliente'}s</h1>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo {rubro?.terminologia.cliente || 'Cliente'}
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${rubro?.terminologia.cliente.toLowerCase() || 'cliente'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">
            {clientesFiltrados.length} {rubro?.terminologia.cliente.toLowerCase() || 'cliente'}{clientesFiltrados.length !== 1 ? 's' : ''}
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
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{cliente.nombre}</p>
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
                          {formatearMoneda(totalFacturado)}
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
                          <DropdownMenuItem onClick={() => handleViewDetail(cliente)}>
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
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron clientes</p>
              {search && (
                <p className="text-sm">Prueba con otra búsqueda</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para añadir cliente */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo {rubro?.terminologia.cliente || 'Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newClient.nombre}
                onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={newClient.telefono}
                onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })}
                placeholder="+34 600 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label>NIF/CIF</Label>
              <Input
                value={newClient.nifCif}
                onChange={(e) => setNewClient({ ...newClient, nifCif: e.target.value })}
                placeholder="B12345678"
              />
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={newClient.direccion}
                onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
                placeholder="Calle, número, piso"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={newClient.ciudad}
                  onChange={(e) => setNewClient({ ...newClient, ciudad: e.target.value })}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label>Código Postal</Label>
                <Input
                  value={newClient.codigoPostal}
                  onChange={(e) => setNewClient({ ...newClient, codigoPostal: e.target.value })}
                  placeholder="28001"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddClient}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalles */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del {rubro?.terminologia.cliente || 'Cliente'}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-xl">{selectedClient.nombre}</p>
                  {selectedClient.nifCif && (
                    <p className="text-muted-foreground">
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
                      {selectedClient.codigoPostal} {selectedClient.ciudad}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Resumen de facturas</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">
                      {getFacturasCliente(selectedClient.id).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Facturas</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold">
                      {formatearMoneda(getTotalFacturado(selectedClient.id))}
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
