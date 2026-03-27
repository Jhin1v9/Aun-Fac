import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Building2, 
  Briefcase, 
  Palette, 
  Check,
  ArrowRight,
  ArrowLeft,
  FileText,
  QrCode,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { rubros, temasPredefinidos } from '@/data/rubros';
import { cn } from '@/lib/utils';
import type { RubroId } from '@/types';
import * as Icons from 'lucide-react';

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

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;
  
  // Datos del formulario
  const [empresaData, setEmpresaData] = useState({
    nombre: '',
    razonSocial: '',
    nifCif: '',
    email: '',
    telefono: ''
  });
  const [rubroSeleccionado, setRubroSeleccionado] = useState<RubroId | null>(null);
  const [temaSeleccionado, setTemaSeleccionado] = useState<string>('azul');
  const [verifactusEnabled, setVerifactusEnabled] = useState(true);
  
  const { setEmpresa, setOnboardingCompletado, generarId } = useAppStore();
  
  const handleNext = () => {
    if (step === 2) {
      // Validar datos de empresa
      if (!empresaData.nombre || !empresaData.email) {
        toast.error('Completa los campos obligatorios');
        return;
      }
    }
    if (step === 3 && !rubroSeleccionado) {
      toast.error('Selecciona un sector de actividad');
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const completeOnboarding = () => {
    // Rubro seleccionado para configuración adicional
    // const rubro = rubros.find(r => r.id === rubroSeleccionado);
    const tema = temasPredefinidos[temaSeleccionado as keyof typeof temasPredefinidos] || temasPredefinidos.azul;
    
    setEmpresa({
      id: generarId(),
      nombre: empresaData.nombre,
      razonSocial: empresaData.razonSocial,
      nifCif: empresaData.nifCif,
      email: empresaData.email,
      telefono: empresaData.telefono,
      pais: 'ES',
      rubroPrincipal: rubroSeleccionado || 'servicios',
      colorPrimario: tema.primario,
      colorSecundario: tema.secundario,
      colorDestacado: tema.destacado,
      prefijoFactura: 'FV',
      secuenciaFactura: 1,
      ivaDefault: 21,
      irpfDefault: 0,
      moneda: 'EUR',
      verifactusQrEnabled: verifactusEnabled,
      resetAnual: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    setOnboardingCompletado(true);
    toast.success('¡Configuración completada!');
    onComplete();
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Bienvenido a VERIFACTUS</h1>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                El sistema de facturación inteligente que se adapta a tu sector de actividad. 
                En pocos pasos, tendrás todo listo para emitir facturas profesionales.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                <Check className="w-4 h-4 text-green-500" />
                100% Offline
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                <Check className="w-4 h-4 text-green-500" />
                PDFs Profesionales
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
                <Check className="w-4 h-4 text-green-500" />
                Gratis
              </div>
            </div>
          </motion.div>
        );
        
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Tu Empresa</h2>
              <p className="text-muted-foreground">Información básica de tu negocio</p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                <Input
                  id="nombre"
                  value={empresaData.nombre}
                  onChange={(e) => setEmpresaData({ ...empresaData, nombre: e.target.value })}
                  placeholder="Ej: Mi Empresa S.L."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social</Label>
                <Input
                  id="razonSocial"
                  value={empresaData.razonSocial}
                  onChange={(e) => setEmpresaData({ ...empresaData, razonSocial: e.target.value })}
                  placeholder="Ej: Mi Empresa Sociedad Limitada"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nifCif">NIF/CIF</Label>
                <Input
                  id="nifCif"
                  value={empresaData.nifCif}
                  onChange={(e) => setEmpresaData({ ...empresaData, nifCif: e.target.value })}
                  placeholder="Ej: B12345678"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={empresaData.email}
                  onChange={(e) => setEmpresaData({ ...empresaData, email: e.target.value })}
                  placeholder="Ej: contacto@miempresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={empresaData.telefono}
                  onChange={(e) => setEmpresaData({ ...empresaData, telefono: e.target.value })}
                  placeholder="Ej: +34 600 000 000"
                />
              </div>
            </div>
          </motion.div>
        );
        
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Sector de Actividad</h2>
              <p className="text-muted-foreground">Selecciona el rubro de tu negocio</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {rubros.map((rubro) => {
                const Icono = iconMap[rubro.icono];
                const seleccionado = rubroSeleccionado === rubro.id;
                
                return (
                  <Card
                    key={rubro.id}
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                      "border-2",
                      seleccionado 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-primary/30"
                    )}
                    onClick={() => setRubroSeleccionado(rubro.id)}
                  >
                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-md",
                        rubro.color
                      )}>
                        {Icono && <Icono className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{rubro.nombre}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 hidden sm:block">
                          {rubro.descripcion}
                        </p>
                      </div>
                      {seleccionado && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );
        
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Palette className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Personaliza tu Factura</h2>
              <p className="text-muted-foreground">Elige los colores de tu marca</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {Object.entries(temasPredefinidos).map(([key, tema]) => (
                <Card
                  key={key}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    temaSeleccionado === key && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => setTemaSeleccionado(key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full shadow-md"
                        style={{ backgroundColor: tema.primario }}
                      />
                      <span className="font-medium">{tema.nombre}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );
        
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Verificación VERIFACTUS</h2>
              <p className="text-muted-foreground">Activa el sistema de verificación</p>
            </div>
            
            <Card 
              className={cn(
                "cursor-pointer transition-all max-w-md mx-auto",
                verifactusEnabled && "ring-2 ring-primary border-primary"
              )}
              onClick={() => setVerifactusEnabled(!verifactusEnabled)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">Código QR Verifactus</h3>
                      {verifactusEnabled && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Incluye un código QR de verificación en todas tus facturas. 
                      Tus clientes podrán escanearlo para verificar la autenticidad.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">VERIFACTUS</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Configuración Inicial
          </div>
        </div>
      </header>
      
      {/* Progress */}
      <div className="max-w-4xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Paso {step} de {totalSteps}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 pb-32">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
      
      {/* Footer Buttons */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-pb">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="min-w-[120px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
          
          <Button
            onClick={handleNext}
            className="min-w-[120px]"
          >
            {step === totalSteps ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}
