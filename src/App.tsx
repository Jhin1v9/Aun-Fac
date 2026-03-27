import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useAppStore } from '@/store/appStore';
import { Onboarding } from '@/components/Onboarding';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { InvoiceList } from '@/components/InvoiceList';
import { InvoiceForm } from '@/components/InvoiceForm';
import { ClientList } from '@/components/ClientList';
import { ServiceList } from '@/components/ServiceList';
import { Settings } from '@/components/Settings';
import { toast } from 'sonner';

type ViewType = 'dashboard' | 'invoices' | 'clients' | 'services' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  
  const { 
    onboardingCompletado, 
    setOnboardingCompletado,
    clientes,
    servicios,
    addCliente,
    addServicio,
    generarId
  } = useAppStore();

  // Datos de ejemplo para demo
  useEffect(() => {
    if (!onboardingCompletado) return;
    
    if (clientes.length === 0) {
      // Crear clientes de ejemplo
      const clientesEjemplo = [
        {
          id: generarId(),
          nombre: 'Empresa Ejemplo S.L.',
          nifCif: 'B12345678',
          direccion: 'Calle Mayor, 123',
          ciudad: 'Madrid',
          codigoPostal: '28001',
          provincia: 'Madrid',
          pais: 'ES',
          telefono: '+34 600 000 001',
          email: 'contacto@ejemplo.com',
          totalFacturado: 2500,
          facturasCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: generarId(),
          nombre: 'Cliente Particular',
          nifCif: '12345678A',
          direccion: 'Avenida Principal, 45',
          ciudad: 'Barcelona',
          codigoPostal: '08001',
          provincia: 'Barcelona',
          pais: 'ES',
          telefono: '+34 600 000 002',
          email: 'cliente@email.com',
          totalFacturado: 800,
          facturasCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: generarId(),
          nombre: 'Constructora ABC',
          nifCif: 'B87654321',
          direccion: 'Polígono Industrial, 12',
          ciudad: 'Valencia',
          codigoPostal: '46001',
          provincia: 'Valencia',
          pais: 'ES',
          telefono: '+34 600 000 003',
          email: 'info@constructoraabc.com',
          totalFacturado: 15000,
          facturasCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      clientesEjemplo.forEach(c => addCliente(c));
    }

    if (servicios.length === 0) {
      // Crear servicios de ejemplo
      const serviciosEjemplo = [
        {
          id: generarId(),
          nombre: 'Consultoría general',
          descripcion: 'Servicio de consultoría empresarial',
          precio: 100,
          iva: 21,
          irpf: 0,
          categoria: 'Consultoría',
          duracion: 60,
          usoCount: 5,
          esPaquete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: generarId(),
          nombre: 'Desarrollo web',
          descripcion: 'Desarrollo de páginas web',
          precio: 500,
          iva: 21,
          irpf: 0,
          categoria: 'Desarrollo',
          duracion: 480,
          usoCount: 3,
          esPaquete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: generarId(),
          nombre: 'Diseño gráfico',
          descripcion: 'Servicios de diseño profesional',
          precio: 200,
          iva: 21,
          irpf: 0,
          categoria: 'Diseño',
          duracion: 120,
          usoCount: 2,
          esPaquete: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: generarId(),
          nombre: 'Pack Marketing Digital',
          descripcion: 'Gestión de redes + SEO + Ads',
          precio: 800,
          iva: 21,
          irpf: 0,
          categoria: 'Marketing',
          duracion: 0,
          usoCount: 1,
          esPaquete: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      serviciosEjemplo.forEach(s => addServicio(s));
    }
  }, [onboardingCompletado]);

  const handleOnboardingComplete = () => {
    setOnboardingCompletado(true);
    toast.success('¡Bienvenido a VERIFACTUS!');
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión? Se perderán los datos no guardados.')) {
      setOnboardingCompletado(false);
      setCurrentView('dashboard');
      toast.info('Sesión cerrada');
    }
  };

  const handleNewInvoice = () => {
    setShowInvoiceForm(true);
  };

  const handleCancelInvoice = () => {
    setShowInvoiceForm(false);
  };

  const handleSaveInvoice = () => {
    setShowInvoiceForm(false);
    setCurrentView('invoices');
  };

  // Renderizar contenido según la vista
  const renderContent = () => {
    if (showInvoiceForm) {
      return (
        <InvoiceForm 
          onCancel={handleCancelInvoice}
          onSave={handleSaveInvoice}
        />
      );
    }

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
        return (
          <InvoiceList 
            onBack={() => setCurrentView('dashboard')}
            onNewInvoice={handleNewInvoice}
          />
        );
        
      case 'clients':
        return (
          <ClientList 
            onBack={() => setCurrentView('dashboard')}
          />
        );
        
      case 'services':
        return (
          <ServiceList 
            onBack={() => setCurrentView('dashboard')}
          />
        );
        
      case 'settings':
        return (
          <Settings onBack={() => setCurrentView('dashboard')} />
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
        onNewInvoice={handleNewInvoice}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
