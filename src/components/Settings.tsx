import { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Palette, 
  Receipt, 
  Save, 
  ArrowLeft,
  Upload,
  Trash2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { rubros, temasPredefinidos } from '@/data/rubros';
import { paises, monedas, tasasIVA, tasasIRPF } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette: Icons.Palette,
  HardHat: Icons.HardHat,
  Stethoscope: Icons.Stethoscope,
  LineChart: Icons.LineChart,
  Code2: Icons.Code2,
  Megaphone: Icons.Megaphone,
  Scale: Icons.Scale,
  Calculator: Icons.Calculator,
  Cog: Icons.Cog,
  GraduationCap: Icons.GraduationCap,
  Sparkles: Icons.Sparkles,
  Car: Icons.Car,
  ShoppingBag: Icons.ShoppingBag,
  UtensilsCrossed: Icons.UtensilsCrossed,
  Camera: Icons.Camera,
  Calendar: Icons.Calendar,
  Briefcase: Icons.Briefcase
};

export function Settings({ onBack }: SettingsProps) {
  const { empresa, updateEmpresa } = useAppStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(empresa?.logoUrl || null);
  
  const [formData, setFormData] = useState({
    nombre: empresa?.nombre || '',
    razonSocial: empresa?.razonSocial || '',
    nifCif: empresa?.nifCif || '',
    email: empresa?.email || '',
    telefono: empresa?.telefono || '',
    direccion: empresa?.direccion || '',
    ciudad: empresa?.ciudad || '',
    codigoPostal: empresa?.codigoPostal || '',
    provincia: empresa?.provincia || '',
    pais: empresa?.pais || 'ES',
    rubroPrincipal: empresa?.rubroPrincipal || 'servicios',
    prefijoFactura: empresa?.prefijoFactura || 'FV',
    ivaDefault: String(empresa?.ivaDefault || 21),
    irpfDefault: String(empresa?.irpfDefault || 0),
    moneda: empresa?.moneda || 'EUR',
    colorPrimario: empresa?.colorPrimario || '#3b82f6',
    colorSecundario: empresa?.colorSecundario || '#6366f1',
    colorDestacado: empresa?.colorDestacado || '#8b5cf6',
    verifactusQrEnabled: empresa?.verifactusQrEnabled ?? true,
    resetAnual: empresa?.resetAnual || false
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El logo no puede superar los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!empresa) return;
    
    updateEmpresa({
      ...formData,
      ivaDefault: parseFloat(formData.ivaDefault),
      irpfDefault: parseFloat(formData.irpfDefault),
      logoUrl: logoPreview || undefined
    });
    
    toast.success('Configuración guardada correctamente');
  };

  // Rubro seleccionado (para uso futuro)
  // const rubroSeleccionado = rubros.find(r => r.id === formData.rubroPrincipal);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Configuración</h1>
      </div>

      {/* Información de la empresa */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Información de la Empresa
          </CardTitle>
          <CardDescription>
            Datos básicos de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre de la empresa</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Mi Empresa S.L."
              />
            </div>
            <div className="space-y-2">
              <Label>Razón Social</Label>
              <Input
                value={formData.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value)}
                placeholder="Mi Empresa Sociedad Limitada"
              />
            </div>
            <div className="space-y-2">
              <Label>NIF/CIF</Label>
              <Input
                value={formData.nifCif}
                onChange={(e) => handleChange('nifCif', e.target.value)}
                placeholder="B12345678"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contacto@miempresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Calle Mayor, 123, 2ºB"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Código Postal</Label>
              <Input
                value={formData.codigoPostal}
                onChange={(e) => handleChange('codigoPostal', e.target.value)}
                placeholder="28001"
              />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                placeholder="Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label>Provincia</Label>
              <Input
                value={formData.provincia}
                onChange={(e) => handleChange('provincia', e.target.value)}
                placeholder="Madrid"
              />
            </div>
            <div className="space-y-2">
              <Label>País</Label>
              <Select 
                value={formData.pais} 
                onValueChange={(v) => handleChange('pais', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paises.map((pais) => (
                    <SelectItem key={pais.codigo} value={pais.codigo}>
                      {pais.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Logo de la Empresa
          </CardTitle>
          <CardDescription>
            Aparecerá en las facturas y documentos PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {logoPreview && (
              <div className="w-24 h-24 rounded-xl border bg-white p-2 flex items-center justify-center flex-shrink-0">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: PNG con fondo transparente, 200x200px, máximo 2MB
              </p>
              {logoPreview && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLogoPreview(null)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Eliminar logo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rubro */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Sector de Actividad
          </CardTitle>
          <CardDescription>
            El rubro determina la terminología y campos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {rubros.map((rubro) => {
              const Icono = iconMap[rubro.icono];
              const seleccionado = formData.rubroPrincipal === rubro.id;
              
              return (
                <div
                  key={rubro.id}
                  className={`cursor-pointer transition-all duration-300 p-4 rounded-xl border-2 ${
                    seleccionado 
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                      : 'border-transparent hover:border-primary/30 bg-muted'
                  }`}
                  onClick={() => handleChange('rubroPrincipal', rubro.id)}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${rubro.color}`}>
                    {Icono && <Icono className="w-5 h-5 text-white" />}
                  </div>
                  <p className="font-medium text-sm">{rubro.nombre}</p>
                  {seleccionado && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Colores */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Colores de la Marca
          </CardTitle>
          <CardDescription>
            Personaliza los colores de tus facturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Object.entries(temasPredefinidos).map(([key, tema]) => (
              <div
                key={key}
                className={`cursor-pointer transition-all p-4 rounded-xl border-2 ${
                  formData.colorPrimario === tema.primario
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-primary/30'
                } bg-muted`}
                onClick={() => {
                  handleChange('colorPrimario', tema.primario);
                  handleChange('colorSecundario', tema.secundario);
                  handleChange('colorDestacado', tema.destacado);
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full shadow-md"
                    style={{ backgroundColor: tema.primario }}
                  />
                  <span className="font-medium">{tema.nombre}</span>
                </div>
                <div className="flex gap-2">
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: tema.primario }}
                  />
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: tema.secundario }}
                  />
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: tema.destacado }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuración fiscal */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Configuración Fiscal
          </CardTitle>
          <CardDescription>
            Valores por defecto para nuevas facturas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Prefijo de factura</Label>
              <Input
                value={formData.prefijoFactura}
                onChange={(e) => handleChange('prefijoFactura', e.target.value)}
                placeholder="FV"
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select 
                value={formData.moneda} 
                onValueChange={(v) => handleChange('moneda', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map((moneda) => (
                    <SelectItem key={moneda.codigo} value={moneda.codigo}>
                      {moneda.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>IVA por defecto (%)</Label>
              <Select 
                value={formData.ivaDefault} 
                onValueChange={(v) => handleChange('ivaDefault', v)}
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
              <Label>IRPF por defecto (%)</Label>
              <Select 
                value={formData.irpfDefault} 
                onValueChange={(v) => handleChange('irpfDefault', v)}
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
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Código QR Verifactus</Label>
                <p className="text-sm text-muted-foreground">
                  Incluir código de verificación en las facturas
                </p>
              </div>
              <Switch
                checked={formData.verifactusQrEnabled}
                onCheckedChange={(checked) => handleChange('verifactusQrEnabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Reset anual de numeración</Label>
                <p className="text-sm text-muted-foreground">
                  Reiniciar la secuencia de facturas cada año
                </p>
              </div>
              <Switch
                checked={formData.resetAnual}
                onCheckedChange={(checked) => handleChange('resetAnual', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón guardar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-72 bg-background border-t p-4 safe-area-pb z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
