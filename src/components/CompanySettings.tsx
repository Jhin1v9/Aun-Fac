import { useState, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Image as ImageIcon, 
  Receipt, 
  Save, 
  Loader2, 
  Trash2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/appStore';
import { paises, monedas, tasasIVA, tasasIRPF } from '@/lib/utils';
import type { Empresa } from '@/types';

interface CompanySettingsProps {
  onBack?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
}

export function CompanySettings({ onBack, onNext, showNavigation = false }: CompanySettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { empresa, setEmpresa } = useAppStore();

  // Estado local del formulario
  const [formData, setFormData] = useState({
    nombre: empresa?.nombre || '',
    nifCif: empresa?.nifCif || '',
    email: empresa?.email || '',
    telefono: empresa?.telefono || '',
    direccion: empresa?.direccion || '',
    codigoPostal: empresa?.codigoPostal || '',
    ciudad: empresa?.ciudad || '',
    provincia: empresa?.provincia || '',
    pais: empresa?.pais || 'ES',
    website: empresa?.website || '',
    instagram: empresa?.instagram || '',
    facebook: empresa?.facebook || '',
    linkedin: empresa?.linkedin || '',
    moneda: empresa?.moneda || 'EUR',
    ivaPorDefecto: empresa?.ivaPorDefecto || 21,
    irpfPorDefecto: empresa?.irpfPorDefecto || 0,
    prefijoFactura: empresa?.prefijoFactura || 'FV',
  });

  const handleChange = (field: string, value: string | number) => {
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const empresaData: Empresa = {
        id: empresa?.id || crypto.randomUUID(),
        nombre: formData.nombre,
        nifCif: formData.nifCif,
        email: formData.email,
        telefono: formData.telefono || '',
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        codigoPostal: formData.codigoPostal,
        provincia: formData.provincia,
        pais: formData.pais,
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        facebook: formData.facebook || undefined,
        linkedin: formData.linkedin || undefined,
        logoUrl: logoPreview || empresa?.logoUrl,
        firmaUrl: empresa?.firmaUrl,
        moneda: formData.moneda as 'EUR' | 'USD' | 'MXN' | 'ARS' | 'COP' | 'CLP' | 'PEN',
        ivaPorDefecto: Number(formData.ivaPorDefecto),
        irpfPorDefecto: Number(formData.irpfPorDefecto),
        prefijoFactura: formData.prefijoFactura,
        secuenciaFactura: empresa?.secuenciaFactura || 1,
        verifactusQrEnabled: empresa?.verifactusQrEnabled ?? true,
        faceEnabled: empresa?.faceEnabled ?? false,
        colorPrimario: empresa?.colorPrimario || '#3b82f6',
        colorSecundario: empresa?.colorSecundario || '#6366f1',
        colorDestacado: empresa?.colorDestacado || '#8b5cf6',
        createdAt: empresa?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setEmpresa(empresaData);
      toast.success('Configuración guardada correctamente');
      
      // Si hay callback onNext, avanzar al siguiente paso
      if (onNext) {
        onNext();
      }
    } catch (error) {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8 pb-24">
      
      {/* Sección 1: Información Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Información Fiscal
          </CardTitle>
          <CardDescription>
            Datos básicos de tu empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la empresa *</Label>
            <Input 
              id="nombre"
              placeholder="Tu Empresa S.L." 
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nifCif">NIF/CIF *</Label>
            <Input 
              id="nifCif"
              placeholder="B12345678" 
              value={formData.nifCif}
              onChange={(e) => handleChange('nifCif', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Para España: B12345678</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="contacto@tuempresa.com" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input 
              id="telefono"
              placeholder="+34 600 000 000" 
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Dirección */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direccion">Calle y número *</Label>
            <Input 
              id="direccion"
              placeholder="Calle Mayor, 123, 2ºB" 
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigoPostal">C.P. *</Label>
              <Input 
                id="codigoPostal"
                placeholder="28001" 
                maxLength={5} 
                value={formData.codigoPostal}
                onChange={(e) => handleChange('codigoPostal', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input 
                id="ciudad"
                placeholder="Madrid" 
                value={formData.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="provincia">Provincia *</Label>
              <Input 
                id="provincia"
                placeholder="Madrid" 
                value={formData.provincia}
                onChange={(e) => handleChange('provincia', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pais">País *</Label>
              <Select 
                value={formData.pais} 
                onValueChange={(v) => handleChange('pais', v)}
              >
                <SelectTrigger id="pais">
                  <SelectValue placeholder="Selecciona" />
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

      {/* Sección 3: Presencia Online */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Presencia Online
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website"
              type="url" 
              placeholder="https://www.tuempresa.com" 
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input 
              id="instagram"
              placeholder="@tuempresa" 
              value={formData.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input 
              id="facebook"
              placeholder="facebook.com/tuempresa" 
              value={formData.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input 
              id="linkedin"
              placeholder="linkedin.com/company/tuempresa" 
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección 4: Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Logo de la Empresa
          </CardTitle>
          <CardDescription>
            Aparecerá en las facturas y documentos PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {(logoPreview || empresa?.logoUrl) && (
              <div className="w-24 h-24 rounded-lg border bg-white p-2 flex items-center justify-center flex-shrink-0">
                <img 
                  src={logoPreview || empresa?.logoUrl} 
                  alt="Logo preview" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: PNG con fondo transparente, 200x200px, máximo 2MB
              </p>
              {(logoPreview || empresa?.logoUrl) && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setLogoPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
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

      {/* Sección 5: Configuración Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Configuración Fiscal por Defecto
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="moneda">Moneda</Label>
            <Select 
              value={formData.moneda} 
              onValueChange={(v) => handleChange('moneda', v)}
            >
              <SelectTrigger id="moneda">
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
            <Label htmlFor="ivaPorDefecto">IVA por defecto (%)</Label>
            <Select 
              value={String(formData.ivaPorDefecto)} 
              onValueChange={(v) => handleChange('ivaPorDefecto', parseFloat(v))}
            >
              <SelectTrigger id="ivaPorDefecto">
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
            <p className="text-xs text-muted-foreground">España: 21% general</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="irpfPorDefecto">IRPF/Retención (%)</Label>
            <Select 
              value={String(formData.irpfPorDefecto)} 
              onValueChange={(v) => handleChange('irpfPorDefecto', parseFloat(v))}
            >
              <SelectTrigger id="irpfPorDefecto">
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
            <p className="text-xs text-muted-foreground">Autónomos ES: 0%, 7%, 15%, 20%</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefijoFactura">Prefijo de factura</Label>
            <Input 
              id="prefijoFactura"
              placeholder="FV" 
              value={formData.prefijoFactura}
              onChange={(e) => handleChange('prefijoFactura', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Ej: FV-2024-00001</p>
          </div>
        </CardContent>
      </Card>

      {/* Botones fijos en el bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-pb z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Botón Atrás - Izquierda */}
          {onBack ? (
            <Button 
              type="button" 
              variant="outline" 
              className="h-12 px-6"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>
          ) : (
            <div className="w-24" /> /* Spacer cuando no hay botón atrás */
          )}
          
          {/* Botón Guardar - Centro */}
          <Button 
            type="submit" 
            className="h-12 px-8" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar
          </Button>
          
          {/* Botón Siguiente - Derecha */}
          {showNavigation && onNext ? (
            <Button 
              type="button" 
              className="h-12 px-6"
              onClick={onNext}
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="w-24" /> /* Spacer cuando no hay botón siguiente */
          )}
        </div>
      </div>
    </form>
  );
}
