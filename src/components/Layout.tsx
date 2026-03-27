import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

type ViewType = 'dashboard' | 'invoices' | 'clients' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard' as ViewType, label: 'Inicio', icon: LayoutDashboard },
  { id: 'invoices' as ViewType, label: 'Facturas', icon: FileText },
  { id: 'clients' as ViewType, label: 'Clientes', icon: Users },
  { id: 'settings' as ViewType, label: 'Configuración', icon: Settings },
];

export function Layout({ children, currentView, onViewChange, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { empresa } = useAppStore();

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">VERIFACTUS</span>
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
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t">
        {empresa && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate">{empresa.nombre}</p>
            <p className="text-xs text-muted-foreground">{empresa.nifCif}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 border-r bg-card flex-col p-4 z-40">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">VERIFACTUS</span>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4 flex flex-col">
            <NavContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-40 safe-area-pb">
        {navItems.map((item) => {
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
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
