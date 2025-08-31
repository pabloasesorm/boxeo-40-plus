import React from 'react';
import type { Exercise } from '../types';

interface ExerciseModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-zinc-900 border-2 border-red-500 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="modal-title" className="text-3xl font-bold text-red-400 mb-2 tracking-wider uppercase">{exercise.name}</h2>
        {exercise.shortDescription && <p className="text-zinc-400 italic mb-4">{exercise.shortDescription}</p>}
        
        <div className="space-y-4 text-zinc-300">
            <div>
                <h3 className="font-semibold text-zinc-200 text-lg border-b border-zinc-700 pb-1 mb-2">Instrucciones</h3>
                <p className="whitespace-pre-wrap">{exercise.details}</p>
            </div>
            {exercise.explanation && (
                 <div>
                    <h3 className="font-semibold text-zinc-200 text-lg border-b border-zinc-700 pb-1 mb-2">Propósito del Ejercicio</h3>
                    <p className="whitespace-pre-wrap text-zinc-400">{exercise.explanation}</p>
                </div>
            )}
        </div>

        <div className="mt-8 text-right">
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg uppercase tracking-wider transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
