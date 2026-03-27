import { useState } from 'react';
import { 
  Building2, 
  Palette, 
  Briefcase, 
  FileText, 
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  QrCode,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/appStore';
import { ActivitySectorSelector } from './ActivitySectorSelector';
import { CompanySettings } from './CompanySettings';
import { cn } from '@/lib/utils';
import { temasPredefinidos } from '@/data/sectores';


interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedTema, setSelectedTema] = useState<string>('azul');
  const [verifactusEnabled, setVerifactusEnabled] = useState(true);
  
  const { updateEmpresa, setOnboardingCompletado } = useAppStore();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === 3 && !selectedSector) {
      toast.error('Selecciona un sector de actividad');
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      void completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    // Guardar configuraciones
    if (selectedSector) {
      updateEmpresa({ sectorActividad: selectedSector });
    }
    
    const tema = temasPredefinidos[selectedTema] || temasPredefinidos.azul;
    updateEmpresa({
      colorPrimario: tema.primario,
      colorSecundario: tema.secundario,
      colorDestacado: tema.destacado,
      verifactusQrEnabled: verifactusEnabled,
    });
    
    setOnboardingCompletado(true);
    toast.success('¡Configuración completada!');
    onComplete();
  };

  const handleSelectSector = (sectorId: string) => {
    setSelectedSector(sectorId);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">¡Bienvenido a VERIFACTUS!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                El sistema de facturación profesional diseñado para empresas españolas. 
                En pocos pasos tendrás todo configurado.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Card className="p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-medium">100% Offline</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium">PDFs Profesionales</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Gratis</p>
              </Card>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Datos de tu Empresa</h2>
              <p className="text-sm text-muted-foreground">
                Estos datos aparecerán en tus facturas
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <CompanySettings />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Sector de Actividad</h2>
              <p className="text-sm text-muted-foreground">
                Personaliza VERIFACTUS para tu tipo de negocio
              </p>
            </div>
            <ActivitySectorSelector 
              selectedSector={selectedSector} 
              onSelect={handleSelectSector} 
            />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Personaliza tu Factura</h2>
              <p className="text-sm text-muted-foreground">
                Elige los colores de tu marca
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {Object.entries(temasPredefinidos).map(([key, tema]) => (
                <Card
                  key={key}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedTema === key && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedTema(key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: tema.primario }}
                      />
                      <div>
                        <p className="font-medium text-sm">{tema.nombre}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-3">
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
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Verificación VERIFACTUS</h2>
              <p className="text-sm text-muted-foreground">
                Activa el sistema de verificación oficial español
              </p>
            </div>
            
            <Card 
              className={cn(
                "cursor-pointer transition-all",
                verifactusEnabled && "ring-2 ring-primary border-primary"
              )}
              onClick={() => setVerifactusEnabled(!verifactusEnabled)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Código QR Verifactus</h3>
                      {verifactusEnabled && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Incluye un código QR de verificación en todas tus facturas. 
                      Tus clientes podrán escanearlo para verificar la autenticidad.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Paso {currentStep} de {totalSteps}
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">VERIFACTUS</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Configuración Inicial
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Paso {currentStep} de {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {renderStepContent()}
      </div>
      
      {/* Footer buttons */}
      {currentStep !== 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-pb">
          <div className="max-w-4xl mx-auto flex gap-3">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack}
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Atrás
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="flex-1 h-12"
            >
              {currentStep === totalSteps ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Finalizar
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Siguiente</span>
                  <ArrowRight className="w-5 h-5 sm:ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
