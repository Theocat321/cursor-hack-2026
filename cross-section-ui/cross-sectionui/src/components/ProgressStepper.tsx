import { STEPS } from '../types';

interface ProgressStepperProps {
  currentStep: number;
  iteration: number;
  onStepClick: (step: number) => void;
  disabled: boolean;
}

export default function ProgressStepper({ currentStep, iteration, onStepClick, disabled }: ProgressStepperProps) {
  return (
    <div className="px-3 py-2">
      {/* Iteration badge */}
      {iteration > 0 && (
        <div className="text-[9px] font-mono text-accent mb-1.5 text-center">
          ITERATION {iteration}
        </div>
      )}

      <div className="flex items-center">
        {STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-initial">
            <button
              onClick={() => onStepClick(i)}
              disabled={disabled}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded transition-colors min-w-0 ${
                i === currentStep
                  ? 'text-accent'
                  : i < currentStep
                    ? 'text-success cursor-pointer hover:bg-success/5'
                    : 'text-muted'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border transition-colors ${
                i === currentStep
                  ? 'border-accent bg-accent/15'
                  : i < currentStep
                    ? 'border-success/50 bg-success/10'
                    : 'border-border bg-surface'
              }`}>
                {i < currentStep ? '✓' : step.icon}
              </div>
              <span className="text-[8px] font-mono uppercase tracking-wider leading-tight text-center whitespace-nowrap">
                {step.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-0.5 ${i < currentStep ? 'bg-success/30' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
