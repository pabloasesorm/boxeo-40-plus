
import React, { useState } from 'react';
import { availableEquipment, Equipment, UserProfile } from '../types';

const experienceLevels = [
  { id: 'Principiante', label: 'Principiante', description: 'Estoy empezando o volviendo después de un largo tiempo.' },
  { id: 'Intermedio', label: 'Intermedio', description: 'Entreno regularmente y conozco los movimientos básicos.' },
  { id: 'Avanzado', label: 'Avanzado', description: 'Tengo experiencia y busco llevar mi rendimiento al límite.' },
];

const mainGoals = [
  { id: 'Potencia', label: 'Más Potencia', description: 'Quiero que mis golpes sean más explosivos y contundentes.' },
  { id: 'Resistencia', label: 'Mejorar Resistencia', description: 'Quiero aguantar más asaltos a un ritmo alto sin fatiga.' },
  { id: 'Pérdida de Peso', label: 'Perder Peso', description: 'Quiero optimizar mi composición corporal y quemar grasa.' },
];

interface SelectableCardProps {
  label: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

const SelectableCard: React.FC<SelectableCardProps> = ({ label, description, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full h-full text-left p-5 border-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex flex-col ${
      isSelected 
        ? 'bg-red-900/50 border-red-500 shadow-lg' 
        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
    }`}
    role="radio"
    aria-checked={isSelected}
  >
    <h4 className="font-bold text-xl text-white">{label}</h4>
    <p className="text-zinc-400 mt-1 flex-grow">{description}</p>
  </button>
);

const CheckboxCard: React.FC<{ label: string; isSelected: boolean; onSelect: () => void; }> = ({ label, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full text-center p-4 border-2 rounded-lg transition-all duration-200 ${
      isSelected 
        ? 'bg-red-900/50 border-red-500' 
        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-500'
    }`}
    role="checkbox"
    aria-checked={isSelected}
  >
    <h4 className="font-semibold text-lg text-white">{label}</h4>
  </button>
);

interface UserProfileSetupProps {
  username: string;
  onProfileSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ username, onProfileSave, initialProfile }) => {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(initialProfile?.experience || null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(initialProfile?.goal || null);
  const [selectedEquipment, setSelectedEquipment] = useState<Set<Equipment>>(new Set(initialProfile?.equipment || availableEquipment));

  const handleEquipmentToggle = (item: Equipment) => {
    setSelectedEquipment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExperience && selectedGoal && selectedEquipment.size > 0) {
      onProfileSave({
        experience: selectedExperience,
        goal: selectedGoal,
        equipment: Array.from(selectedEquipment),
      });
    }
  };

  const isFormComplete = selectedExperience && selectedGoal && selectedEquipment.size > 0;

  return (
    <div className="bg-zinc-900 p-8 rounded-xl shadow-2xl border border-zinc-800 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-semibold text-red-400 mb-2 tracking-wide">CONFIGURA TU PERFIL, {username.toUpperCase()}</h2>
        <p className="text-zinc-300 text-lg">
          Para crear el plan perfecto para ti, necesitamos saber un poco más sobre tu nivel y tus metas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div>
          <h3 className="text-2xl font-bold text-zinc-200 mb-4 border-b-2 border-zinc-700 pb-2">1. ¿Cuál es tu nivel de experiencia?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="experience-label">
            {experienceLevels.map((level) => (
              <SelectableCard
                key={level.id}
                label={level.label}
                description={level.description}
                isSelected={selectedExperience === level.id}
                onSelect={() => setSelectedExperience(level.id)}
              />
            ))}
          </div>
        </div>

        <div>
            <h3 className="text-2xl font-bold text-zinc-200 mb-4 border-b-2 border-zinc-700 pb-2">2. ¿Cuál es tu objetivo principal ahora mismo?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="goal-label">
                {mainGoals.map((goal) => (
                <SelectableCard
                    key={goal.id}
                    label={goal.label}
                    description={goal.description}
                    isSelected={selectedGoal === goal.id}
                    onSelect={() => setSelectedGoal(goal.id)}
                />
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-bold text-zinc-200 mb-4 border-b-2 border-zinc-700 pb-2">3. ¿Qué equipamiento tienes disponible?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableEquipment.map((item) => (
                    <CheckboxCard
                        key={item}
                        label={item}
                        isSelected={selectedEquipment.has(item)}
                        onSelect={() => handleEquipmentToggle(item)}
                    />
                ))}
            </div>
            <p className="text-sm text-zinc-500 mt-3">Los ejercicios con peso corporal siempre están disponibles.</p>
        </div>


        <div className="text-center pt-6">
          <button
            type="submit"
            disabled={!isFormComplete}
            className="w-full max-w-md bg-red-600 text-white font-bold py-4 px-8 rounded-lg text-xl uppercase tracking-widest transition-all duration-300 transform shadow-lg focus:outline-none focus:ring-4 focus:ring-red-400 disabled:bg-zinc-700 disabled:cursor-not-allowed disabled:shadow-none hover:enabled:bg-red-500 hover:enabled:scale-105"
          >
            {initialProfile ? 'Actualizar Perfil' : 'Guardar Perfil y Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileSetup;
