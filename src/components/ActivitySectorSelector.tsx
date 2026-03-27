import { Check, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { sectoresActividad } from '@/data/sectores';
import * as Icons from 'lucide-react';

interface ActivitySectorSelectorProps {
  selectedSector: string | null;
  onSelect: (sectorId: string) => void;
}

// Mapeo de iconos
const iconMap: Record<string, LucideIcon> = {
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
  Briefcase: Icons.Briefcase,
};

export function ActivitySectorSelector({ selectedSector, onSelect }: ActivitySectorSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Sector de Actividad</h3>
        <p className="text-sm text-muted-foreground">
          Selecciona el sector que mejor describe tu negocio
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {sectoresActividad.map((sector) => {
          const Icono = iconMap[sector.icono];
          const seleccionado = selectedSector === sector.id;
          
          return (
            <Card
              key={sector.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 overflow-hidden group",
                "hover:shadow-lg hover:-translate-y-1",
                "border-2",
                seleccionado 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-transparent hover:border-primary/30"
              )}
              onClick={() => onSelect(sector.id)}
            >
              {/* Fondo gradiente cuando está seleccionado */}
              {seleccionado && (
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", sector.gradiente)} />
              )}
              
              <CardContent className="relative p-4 sm:p-5 flex flex-col items-center text-center gap-3">
                {/* Icono */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110",
                  sector.color
                )}>
                  {Icono && <Icono className="w-6 h-6 text-white" />}
                </div>
                
                {/* Texto */}
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    {sector.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">
                    {sector.descripcion}
                  </p>
                </div>
              </CardContent>
              
              {/* Checkmark cuando está seleccionado */}
              {seleccionado && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
