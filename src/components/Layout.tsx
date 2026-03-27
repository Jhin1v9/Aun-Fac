import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Plus,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

type ViewType = 'dashboard' | 'invoices' | 'clients' | 'services' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onNewInvoice: () => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
  { id: 'invoices' as ViewType, label: 'Facturas', icon: FileText },
  { id: 'clients' as ViewType, label: 'Clientes', icon: Users },
  { id: 'services' as ViewType, label: 'Servicios', icon: Briefcase },
  { id: 'settings' as ViewType, label: 'Configuración', icon: Settings },
];

export function Layout({ 
  children, 
  currentView, 
  onViewChange, 
  onNewInvoice, 
  onLogout 
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { empresa } = useAppStore();

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
          <FileText className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight">VERIFACTUS</span>
          {empresa && (
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
              {empresa.nombre}
            </p>
          )}
        </div>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-6 border-t space-y-3">
        <Button 
          className="w-full"
          onClick={() => {
            onNewInvoice();
            setMobileMenuOpen(false);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 border-r bg-card flex-col p-5 z-40">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">VERIFACTUS</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onNewInvoice}>
            <Plus className="w-4 h-4" />
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-5 flex flex-col">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-40 safe-area-pb">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
