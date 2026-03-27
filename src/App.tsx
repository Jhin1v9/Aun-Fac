import { useState, useEffect } from 'react';
import { 
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore } from '@/stores/appStore';
import { Onboarding } from '@/components/Onboarding';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { InvoiceList } from '@/components/InvoiceList';
import { InvoiceForm } from '@/components/InvoiceForm';
import { ClientList } from '@/components/ClientList';
import { CompanySettings } from '@/components/CompanySettings';
import { toast } from 'sonner';

type ViewType = 'dashboard' | 'invoices' | 'clients' | 'settings';
type SubViewType = 'list' | 'form' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [subView, setSubView] = useState<SubViewType>('list');
  
  const { 
    onboardingCompletado, 
    setOnboardingCompletado,
    clientes,
    servicios,
    resetFacturaActual
  } = useAppStore();

  // Datos de ejemplo para demo
  useEffect(() => {
    if (clientes.length === 0) {
      // Crear clientes de ejemplo
      const clientesEjemplo = [
        {
          id: 'cliente-1',
          nombre: 'Empresa Ejemplo S.L.',
          nifCif: 'B12345678',
          direccion: 'Calle Mayor, 123',
          ciudad: 'Madrid',
          codigoPostal: '28001',
          provincia: 'Madrid',
          pais: 'ES',
          telefono: '+34 600 000 001',
          email: 'contacto@ejemplo.com',
          tipoIva: 'general' as const,
          metodoPago: 'transferencia' as const,
          diasPago: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'cliente-2',
          nombre: 'Cliente Particular',
          nifCif: '12345678A',
          direccion: 'Avenida Principal, 45',
          ciudad: 'Barcelona',
          codigoPostal: '08001',
          provincia: 'Barcelona',
          pais: 'ES',
          telefono: '+34 600 000 002',
          email: 'cliente@email.com',
          tipoIva: 'general' as const,
          metodoPago: 'transferencia' as const,
          diasPago: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      useAppStore.getState().setClientes(clientesEjemplo);
    }

    if (servicios.length === 0) {
      // Crear servicios de ejemplo
      const serviciosEjemplo = [
        {
          id: 'servicio-1',
          nombre: 'Consultoría general',
          descripcion: 'Servicio de consultoría empresarial',
          precioPorDefecto: 100,
          ivaRate: 21,
          irpfAplicable: true,
          categoria: 'Consultoría',
          usoCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'servicio-2',
          nombre: 'Desarrollo web',
          descripcion: 'Desarrollo de páginas web',
          precioPorDefecto: 500,
          ivaRate: 21,
          irpfAplicable: true,
          categoria: 'Desarrollo',
          usoCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'servicio-3',
          nombre: 'Diseño gráfico',
          descripcion: 'Servicios de diseño',
          precioPorDefecto: 200,
          ivaRate: 21,
          irpfAplicable: false,
          categoria: 'Diseño',
          usoCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      useAppStore.getState().setServicios(serviciosEjemplo);
    }
  }, [clientes.length, servicios.length]);

  const handleOnboardingComplete = () => {
    setOnboardingCompletado(true);
    toast.success('¡Bienvenido a VERIFACTUS!');
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      setOnboardingCompletado(false);
      setCurrentView('dashboard');
      toast.info('Sesión cerrada');
    }
  };

  const handleNewInvoice = () => {
    resetFacturaActual();
    setSubView('form');
    setCurrentView('invoices');
  };

  const handleViewInvoice = (id: string) => {
    console.log('Ver factura:', id);
    // TODO: Implementar vista de detalle
  };

  const handleBackToList = () => {
    setSubView('list');
  };



  // Renderizar contenido según la vista
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            onNewInvoice={handleNewInvoice}
            onViewInvoices={() => setCurrentView('invoices')}
            onViewClients={() => setCurrentView('clients')}
          />
        );
        
      case 'invoices':
        if (subView === 'form') {
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBackToList}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">Nueva Factura</h1>
              </div>
              <InvoiceForm />
            </div>
          );
        }
        return (
          <InvoiceList 
            onBack={() => setCurrentView('dashboard')}
            onNewInvoice={handleNewInvoice}
            onViewInvoice={handleViewInvoice}
          />
        );
        
      case 'clients':
        return (
          <ClientList 
            onBack={() => setCurrentView('dashboard')}
          />
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Configuración</h1>
            </div>
            <CompanySettings onBack={() => setCurrentView('dashboard')} />
          </div>
        );
        
      default:
        return null;
    }
  };

  // Mostrar onboarding si no está completado
  if (!onboardingCompletado) {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <>
      <Layout 
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
