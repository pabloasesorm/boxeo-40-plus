import React, { useState, useMemo } from 'react';
import type { WeeklyPlan, WorkoutDay, Exercise } from '../types';
import { CheckCircleIcon } from './Icons';
import Timer from './Timer';
import ExerciseModal from './ExerciseModal';

interface WorkoutPlanDisplayProps {
  plan: WeeklyPlan;
  completedDays: Set<number>;
  onMarkComplete: (day: number) => void;
  dayNotes: Record<number, string>;
  onNoteChange: (day: number, text: string) => void;
  planId: string;
}

const ExerciseCard: React.FC<{ exercise: Exercise; onSelect: () => void; }> = ({ exercise, onSelect }) => {
    
    const timerDurations = useMemo(() => {
        const roundMatch = exercise.details.match(/(\d+)\s*minutos? de trabajo, seguido de (\d+)\s*minutos? de descanso/i);
        
        if (roundMatch) {
            return {
                work: { duration: parseInt(roundMatch[1], 10) * 60, label: 'Asalto' },
                rest: { duration: parseInt(roundMatch[2], 10) * 60, label: 'Descanso' },
            };
        }

        const work = exercise.durationSeconds ? { duration: exercise.durationSeconds, label: 'Duración' } : null;
        const rest = exercise.restDurationSeconds ? { duration: exercise.restDurationSeconds, label: 'Descanso Post-Ejercicio' } : null;
        
        return { work, rest };
    }, [exercise.details, exercise.durationSeconds, exercise.restDurationSeconds]);
    
    return (
    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
        <button 
            className="w-full text-left font-bold text-red-400 text-lg hover:text-red-300 transition-colors"
            onClick={onSelect}
        >
          {exercise.name}
        </button>
        {exercise.shortDescription && <p className="text-sm text-zinc-400 italic mb-2">{exercise.shortDescription}</p>}
        <p className="text-zinc-300 whitespace-pre-wrap">{exercise.details}</p>

        {(timerDurations.work || timerDurations.rest) && (
            <div className="mt-4 pt-4 border-t border-zinc-700 flex flex-wrap gap-4 items-center justify-center">
                {timerDurations.work && <Timer initialSeconds={timerDurations.work.duration} label={timerDurations.work.label} />}
                {timerDurations.rest && <Timer initialSeconds={timerDurations.rest.duration} label={timerDurations.rest.label} />}
            </div>
        )}
    </div>
    );
};


const DayCard: React.FC<{ 
    day: WorkoutDay; 
    isCompleted: boolean; 
    onMarkComplete: () => void; 
    note: string;
    onNoteChange: (text: string) => void;
    onExerciseSelect: (exercise: Exercise) => void;
}> = ({ day, isCompleted, onMarkComplete, note, onNoteChange, onExerciseSelect }) => {
  const [isExpanded, setIsExpanded] = useState(day.day === 1);

  return (
    <div className={`bg-zinc-900 rounded-xl overflow-hidden border-2 ${isCompleted ? 'border-green-500' : 'border-zinc-800'} transition-all duration-300`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-6 flex justify-between items-center bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`day-${day.day}-content`}
      >
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-wider text-white">DÍA {day.day}: <span className="text-red-400">{day.focus}</span></h3>
        </div>
        <div className="flex items-center gap-4">
          {isCompleted && <CheckCircleIcon className="w-8 h-8 text-green-500" />}
          <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
             <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </span>
        </div>
      </button>

      {isExpanded && (
        <div id={`day-${day.day}-content`} className="p-6 space-y-6 animate-fade-in-down">
          <div>
            <h4 className="text-xl font-semibold mb-3 text-zinc-300 border-b-2 border-red-500 pb-2">Calentamiento</h4>
            <div className="space-y-3">
              {day.warmup.map((ex, i) => <ExerciseCard key={`warmup-${i}`} exercise={ex} onSelect={() => onExerciseSelect(ex)} />)}
            </div>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-3 text-zinc-300 border-b-2 border-red-500 pb-2">Entrenamiento Principal</h4>
            <div className="space-y-3">
              {day.mainWorkout.map((ex, i) => <ExerciseCard key={`main-${i}`} exercise={ex} onSelect={() => onExerciseSelect(ex)} />)}
            </div>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-3 text-zinc-300 border-b-2 border-red-500 pb-2">Enfriamiento</h4>
            <div className="space-y-3">
              {day.cooldown.map((ex, i) => <ExerciseCard key={`cooldown-${i}`} exercise={ex} onSelect={() => onExerciseSelect(ex)} />)}
            </div>
          </div>
          {isCompleted && (
             <div className="mt-4 pt-4 border-t border-zinc-700">
                <h4 className="text-lg font-semibold mb-2 text-zinc-300">Notas de la Sesión</h4>
                <textarea
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="¿Cómo te sentiste? ¿Algún récord personal? Anótalo aquí..."
                    className="w-full bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-500 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    rows={3}
                />
            </div>
           )}
           <div className="pt-4 text-center">
            <button
                onClick={onMarkComplete}
                disabled={isCompleted}
                className={`w-full max-w-xs text-white font-bold py-3 px-6 rounded-lg text-lg uppercase tracking-wider transition-all duration-300 transform shadow-md focus:outline-none focus:ring-4 ${
                    isCompleted
                    ? 'bg-green-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 hover:scale-105 focus:ring-green-400'
                }`}
            >
                {isCompleted ? 'Completado' : 'Marcar como Completo'}
            </button>
           </div>
        </div>
      )}
    </div>
  );
};


const WorkoutPlanDisplay: React.FC<WorkoutPlanDisplayProps> = ({ plan, completedDays, onMarkComplete, dayNotes, onNoteChange, planId }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  return (
    <div className="space-y-6">
      <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
      {plan.weeklyPlan.sort((a, b) => a.day - b.day).map(day => (
        <DayCard 
            key={day.day} 
            day={day}
            isCompleted={completedDays.has(day.day)}
            onMarkComplete={() => onMarkComplete(day.day)}
            note={dayNotes[day.day] || ''}
            onNoteChange={(text) => onNoteChange(day.day, text)}
            onExerciseSelect={setSelectedExercise}
        />
      ))}
       <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-8 shadow-lg">
        <h3 className="text-2xl font-bold text-red-400 mb-4 tracking-wider uppercase">Principios de Progresión</h3>
        <div className="space-y-4">
          {plan.progressionPrinciples.map((p, i) => (
            <div key={i}>
              <h4 className="font-semibold text-lg text-zinc-200">{p.principle}</h4>
              <p className="text-zinc-400">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanDisplay;
