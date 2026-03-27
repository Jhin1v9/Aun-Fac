import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
  labelShort: string;
}

interface InvoiceStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick: (stepId: number) => void;
  canNavigateTo: (stepId: number) => boolean;
}

export function InvoiceStepper({ currentStep, steps, onStepClick, canNavigateTo }: InvoiceStepperProps) {
  return (
    <nav className="w-full overflow-x-auto pb-2 -mx-4 px-4">
      <div className="flex items-center justify-center min-w-max gap-1 sm:gap-2">
        {steps.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          const isClickable = canNavigateTo(step.id);
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-full transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : isCompleted
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  !isClickable && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
              >
                {/* Número del paso */}
                <span className={cn(
                  "flex items-center justify-center rounded-full text-xs font-bold transition-colors",
                  isActive || isCompleted
                    ? "bg-white/20" 
                    : "bg-muted-foreground/20",
                  "w-5 h-5 sm:w-6 sm:h-6"
                )}>
                  {step.id}
                </span>
                
                {/* Label - versión larga en desktop, corta en mobile */}
                <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">
                  {step.label}
                </span>
                <span className="sm:hidden text-xs font-medium whitespace-nowrap">
                  {step.labelShort}
                </span>
              </button>
              
              {/* Separador */}
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mx-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
