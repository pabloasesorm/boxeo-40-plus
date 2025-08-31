
import React from 'react';

interface ProgressTrackerProps {
  completedDays: Set<number>;
  totalDays: number;
  streak: number;
  includeWildcardInGoal: boolean;
  onToggleWildcard: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ completedDays, totalDays, streak, includeWildcardInGoal, onToggleWildcard }) => {
  const completedCount = Array.from(completedDays).filter(day => day <= totalDays).length;
  const progressPercentage = totalDays > 0 ? (completedCount / totalDays) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8 shadow-lg animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="w-full sm:w-2/3">
          <h3 className="text-2xl font-bold text-red-400 mb-3 tracking-wider uppercase">Progreso Semanal</h3>
          <p className="text-zinc-400 mb-2">Has completado {completedCount} de {totalDays} entrenamientos esta semana.</p>
          <div className="w-full bg-zinc-700 rounded-full h-4 mb-3">
            <div
              className="bg-red-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="wildcard-toggle" className="text-zinc-400 cursor-pointer text-sm">
              Incluir día comodín en el objetivo semanal
            </label>
            <button
                onClick={onToggleWildcard}
                role="switch"
                aria-checked={includeWildcardInGoal}
                id="wildcard-toggle"
                className={`${
                    includeWildcardInGoal ? 'bg-red-600' : 'bg-zinc-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900`}
            >
                <span
                    className={`${
                        includeWildcardInGoal ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
          </div>
        </div>
        <div className="text-center bg-zinc-800 p-4 rounded-lg w-full sm:w-1/3">
          <h4 className="text-xl font-semibold text-zinc-300 uppercase tracking-wider">Racha Actual</h4>
          <p className="text-5xl font-bold text-red-500 my-1">{streak}</p>
          <p className="text-zinc-400">{streak === 1 ? 'Día' : 'Días'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
