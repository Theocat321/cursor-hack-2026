import type { DashboardState } from '../types';

interface RunTestButtonProps {
  status: DashboardState['status'];
  onClick: () => void;
}

const statusLabels: Record<DashboardState['status'], string> = {
  idle: 'Run Test',
  capturing: 'Screenshotting variants...',
  analysing: 'Running TRIBE v2 brain prediction...',
  comparing: 'Comparing neural responses...',
  done: 'Run Again',
  error: 'Retry',
};

const statusIcons: Record<DashboardState['status'], string> = {
  idle: '▶',
  capturing: '📷',
  analysing: '🧠',
  comparing: '⚡',
  done: '▶',
  error: '⟳',
};

export default function RunTestButton({ status, onClick }: RunTestButtonProps) {
  const isRunning = !['idle', 'done', 'error'].includes(status);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        disabled={isRunning}
        className={`
          px-6 py-3 rounded-lg font-sans font-bold text-sm uppercase tracking-wide
          transition-all duration-200
          ${
            isRunning
              ? 'bg-dash-accent/20 text-dash-accent cursor-wait'
              : 'bg-dash-accent text-white hover:bg-dash-accent/80 cursor-pointer'
          }
        `}
      >
        <span className="mr-2">{statusIcons[status]}</span>
        {statusLabels[status]}
      </button>

      {/* Progress stepper */}
      {isRunning && (
        <div className="flex items-center gap-2 text-xs text-dash-muted">
          {(['capturing', 'analysing', 'comparing'] as const).map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    status === step
                      ? 'bg-dash-accent animate-pulse'
                      : ['capturing', 'analysing', 'comparing'].indexOf(
                            status
                          ) > i
                        ? 'bg-dash-accent'
                        : 'bg-dash-border'
                  }`}
                />
                <span
                  className={
                    status === step ? 'text-dash-accent' : 'text-dash-muted'
                  }
                >
                  {step === 'capturing'
                    ? 'Capture'
                    : step === 'analysing'
                      ? 'Analyse'
                      : 'Compare'}
                </span>
                {i < 2 && <span className="text-dash-border">→</span>}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
