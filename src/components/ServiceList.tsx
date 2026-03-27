import { useState, useMemo } from 'react';
import { 
  Search, 
  Briefcase, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  ArrowLeft,
  Tag,
  Clock,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/store/appStore';
import { getRubroById } from '@/data/rubros';
import { tasasIVA, tasasIRPF } from '@/lib/utils';
import type { Servicio } from '@/types';

interface ServiceListProps {
  onBack: () => void;
}

export function ServiceList({ onBack }: ServiceListProps) {
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newService, setNewService] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    iva: '21',
    irpf: '0',
    categoria: '',
    duracion: '',
    esPaquete: false
  });
  
  const { servicios, addServicio, deleteServicio, formatearMoneda, empresa, generarId } = useAppStore();

  const rubro = empresa ? getRubroById(empresa.rubroPrincipal) : null;

  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((servicio) => {
      const matchesSearch = 
        servicio.nombre.toLowerCase().includes(search.toLowerCase()) ||
        servicio.descripcion?.toLowerCase().includes(search.toLowerCase()) ||
        servicio.categoria?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => b.usoCount - a.usoCount);
  }, [servicios, search]);

  const handleAddService = () => {
    if (!newService.nombre || !newService.precio) {
      alert('El nombre y el precio son obligatorios');
      return;
    }

    const servicio: Servicio = {
      id: generarId(),
      nombre: newService.nombre,
      descripcion: newService.descripcion,
      precio: parseFloat(newService.precio),
      iva: parseFloat(newService.iva),
      irpf: parseFloat(newService.irpf),
      categoria: newService.categoria,
      duracion: newService.duracion ? parseInt(newService.duracion) : undefined,
      esPaquete: newService.esPaquete,
      usoCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addServicio(servicio);
    setNewService({
      nombre: '',
      descripcion: '',
      precio: '',
      iva: '21',
      irpf: '0',
      categoria: '',
      duracion: '',
      esPaquete: false
    });
    setShowAddDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      deleteServicio(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{rubro?.terminologia.servicio || 'Servicio'}s</h1>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo {rubro?.terminologia.servicio || 'Servicio'}
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${rubro?.terminologia.servicio.toLowerCase() || 'servicio'}...`}
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
            {serviciosFiltrados.length} {rubro?.terminologia.servicio.toLowerCase() || 'servicio'}
            {serviciosFiltrados.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviciosFiltrados.length > 0 ? (
            <div className="space-y-3">
              {serviciosFiltrados.map((servicio) => (
                <div 
                  key={servicio.id} 
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{servicio.nombre}</p>
                        {servicio.esPaquete && (
                          <Badge variant="secondary" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            Paquete
                          </Badge>
                        )}
                      </div>
                      {servicio.descripcion && (
                        <p className="text-sm text-muted-foreground truncate">
                          {servicio.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {servicio.categoria && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {servicio.categoria}
                          </span>
                        )}
                        {servicio.duracion && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {servicio.duracion} min
                          </span>
                        )}
                        <span>Usado {servicio.usoCount} veces</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatearMoneda(servicio.precio)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        IVA: {servicio.iva}%
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(servicio.id)}
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron servicios</p>
              {search && (
                <p className="text-sm">Prueba con otra búsqueda</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para añadir servicio */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo {rubro?.terminologia.servicio || 'Servicio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={newService.nombre}
                onChange={(e) => setNewService({ ...newService, nombre: e.target.value })}
                placeholder="Nombre del servicio"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={newService.descripcion}
                onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
                placeholder="Descripción del servicio"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newService.precio}
                  onChange={(e) => setNewService({ ...newService, precio: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newService.duracion}
                  onChange={(e) => setNewService({ ...newService, duracion: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IVA (%)</Label>
                <Select 
                  value={newService.iva} 
                  onValueChange={(v) => setNewService({ ...newService, iva: v })}
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
              <div className="space-y-2">
                <Label>IRPF (%)</Label>
                <Select 
                  value={newService.irpf} 
                  onValueChange={(v) => setNewService({ ...newService, irpf: v })}
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
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Input
                value={newService.categoria}
                onChange={(e) => setNewService({ ...newService, categoria: e.target.value })}
                placeholder="Ej: Consultoría, Diseño, etc."
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={newService.esPaquete}
                onCheckedChange={(checked) => setNewService({ ...newService, esPaquete: checked })}
              />
              <Label>Es un paquete de servicios</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddService}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
