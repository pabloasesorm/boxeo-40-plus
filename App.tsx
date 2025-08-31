
import React, { useState, useCallback, useEffect } from 'react';
import { generateWorkoutPlan } from './services/geminiService';
import type { WeeklyPlan, UserProfile } from './types';
import WorkoutPlanDisplay from './components/WorkoutPlanDisplay';
import { BoxingGloveIcon } from './components/Icons';
import ProgressTracker from './components/ProgressTracker';
import UserProfileSetup from './components/UserProfileSetup';
import LoadingDisplay from './components/LoadingDisplay';

// Define keys for localStorage
const LAST_USER_KEY = 'boxadores40_lastUser';
const USER_DATA_PREFIX = 'boxadores40_userData_';

// Helper to get date string in YYYY-MM-DD format
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
  const [planState, setPlanState] = useState<{ plan: WeeklyPlan; id: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);


  // User Profile state
  const [username, setUsername] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // State for progress tracking
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState<number>(0);
  const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(null);
  const [includeWildcardInGoal, setIncludeWildcardInGoal] = useState<boolean>(false);
  const [dayNotes, setDayNotes] = useState<Record<string, Record<number, string>>>({});


  // Effect to load the last active user on initial mount
  useEffect(() => {
    const lastUser = localStorage.getItem(LAST_USER_KEY);
    if (lastUser) {
        setUsername(lastUser);
    }
    setIsLoading(false);
  }, []);

  // Effect to load a user's data when the username changes
  useEffect(() => {
    if (!username) return; 
    
    try {
        const savedStateJSON = localStorage.getItem(`${USER_DATA_PREFIX}${username}`);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            
            setPlanState(savedState.planState || null);
            setCompletedDays(new Set(savedState.completedDays || []));
            setIncludeWildcardInGoal(savedState.includeWildcardInGoal !== undefined ? savedState.includeWildcardInGoal : false);
            setLastCompletionDate(savedState.lastCompletionDate || null);
            setProfile(savedState.profile || null);
            setDayNotes(savedState.dayNotes || {});

            let currentStreak = savedState.streak || 0;
            if (savedState.lastCompletionDate) {
                const today = new Date(getTodayDateString());
                const lastDate = new Date(savedState.lastCompletionDate);
                const diffTime = today.getTime() - lastDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                    currentStreak = 0;
                }
            }
            setStreak(currentStreak);
        } else {
            // New user, reset everything
            setPlanState(null);
            setCompletedDays(new Set());
            setStreak(0);
            setLastCompletionDate(null);
            setIncludeWildcardInGoal(false);
            setError(null);
            setProfile(null);
            setDayNotes({});
        }
    } catch (e) {
        console.error(`Failed to load state for user ${username}`, e);
        // Reset state for safety in case of corrupted data
        setPlanState(null);
        setCompletedDays(new Set());
        setStreak(0);
        setLastCompletionDate(null);
        setIncludeWildcardInGoal(false);
        setError(null);
        setProfile(null);
        setDayNotes({});
    }
  }, [username]);


  // Effect to save state to localStorage whenever it changes for the current user
  useEffect(() => {
    if (!isLoading && username) {
      try {
        const stateToSave = {
          planState,
          completedDays: Array.from(completedDays),
          streak,
          lastCompletionDate,
          includeWildcardInGoal,
          profile,
          dayNotes,
        };
        localStorage.setItem(`${USER_DATA_PREFIX}${username}`, JSON.stringify(stateToSave));
        localStorage.setItem(LAST_USER_KEY, username);
      } catch (e) {
        console.error(`Failed to save state for user ${username}`, e);
      }
    }
  }, [username, planState, completedDays, streak, lastCompletionDate, includeWildcardInGoal, profile, dayNotes, isLoading]);
  
  const weeklyGoal = includeWildcardInGoal ? 6 : 5;

  const handleGeneratePlan = useCallback(async () => {
    if (!profile) {
        setError("Por favor, completa tu perfil de atleta para generar un plan.");
        return;
    }

    setIsGenerating(true);
    setError(null);
    setPlanState(null); 

    const relevantCompletedCount = Array.from(completedDays).filter((day: number) => day <= weeklyGoal).length;
    if (relevantCompletedCount >= weeklyGoal) {
        setCompletedDays(new Set());
    }

    try {
      if (!process.env.API_KEY) {
        throw new Error("La clave de API no está configurada. Por favor, establece la variable de entorno API_KEY.");
      }
      const generatedPlan = await generateWorkoutPlan(profile);
      const newPlanId = Date.now().toString();
      setPlanState({ plan: generatedPlan, id: newPlanId });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      console.error(e);
      setError(`No se pudo generar el plan. ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [completedDays, weeklyGoal, profile]);

  const handleMarkAsComplete = useCallback((day: number) => {
    setCompletedDays(prev => new Set(prev).add(day));

    const todayStr = getTodayDateString();
    if (lastCompletionDate !== todayStr) {
        if (lastCompletionDate) {
            const lastDate = new Date(lastCompletionDate);
            const today = new Date(todayStr);
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                setStreak(s => s + 1);
            } else {
                setStreak(1);
            }
        } else {
            setStreak(1);
        }
        setLastCompletionDate(todayStr);
    }
  }, [lastCompletionDate]);

  const handleSwitchUser = () => {
    setUsername(null);
    setNameInput('');
    setPlanState(null);
    setCompletedDays(new Set());
    setStreak(0);
    setLastCompletionDate(null);
    setError(null);
    setIncludeWildcardInGoal(false);
    setProfile(null);
    setDayNotes({});
    setIsEditingProfile(false);
  };
  
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUsername = nameInput.trim();
    if (newUsername) {
      setUsername(newUsername);
    }
  };

  const handleProfileSave = (newProfile: UserProfile) => {
    setProfile(newProfile);
    // Clear old plan to encourage generating a new, personalized one
    setPlanState(null);
    setCompletedDays(new Set());
    setIsEditingProfile(false);
  };
  
  const handleNoteChange = (planId: string, day: number, text: string) => {
    setDayNotes(prev => ({
        ...prev,
        [planId]: {
            ...(prev[planId] || {}),
            [day]: text,
        }
    }));
  };

  const plan = planState ? planState.plan : null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
            <BoxingGloveIcon className="h-24 w-24 animate-spin text-red-500" />
        </div>
      );
    }
    
    if (isGenerating) {
        return <LoadingDisplay />;
    }

    if (!username) {
      return (
        <div className="text-center bg-zinc-900 p-10 rounded-xl shadow-2xl border border-zinc-800 animate-fade-in max-w-2xl mx-auto">
            <BoxingGloveIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl font-semibold text-red-400 mb-4 tracking-wide">BIENVENIDO, CAMPEÓN</h2>
            <p className="text-zinc-300 mb-8 text-lg">
                Para personalizar tu experiencia y guardar tu progreso, por favor dinos tu nombre.
            </p>
            <form onSubmit={handleNameSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
                <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Tu Nombre de Boxeador"
                    aria-label="Tu Nombre de Boxeador"
                    required
                    className="w-full sm:w-auto flex-grow bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg transition-colors"
                />
                <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-red-400"
                >
                    Comenzar
                </button>
            </form>
        </div>
      );
    }
    
    if (!profile || isEditingProfile) {
      return <UserProfileSetup username={username} onProfileSave={handleProfileSave} initialProfile={profile} />;
    }

    if (error) {
      return (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-5 rounded-lg text-center" role="alert">
          <strong className="font-bold text-xl block">¡ERROR EN EL CAMPAMENTO!</strong>
          <span className="block sm:inline mt-2">{error}</span>
           <button onClick={handleGeneratePlan} className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg">
            Volver a Intentarlo
          </button>
        </div>
      );
    }

    if (plan && planState) {
      return (
        <div className="animate-fade-in">
            <ProgressTracker 
                completedDays={completedDays}
                totalDays={weeklyGoal}
                streak={streak}
                includeWildcardInGoal={includeWildcardInGoal}
                onToggleWildcard={() => setIncludeWildcardInGoal(prev => !prev)}
            />
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                <button
                    onClick={handleGeneratePlan}
                    className="flex-grow sm:flex-grow-0 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg text-lg uppercase tracking-wider transition-all duration-300 transform hover:scale-105 shadow-md focus:outline-none focus:ring-4 focus:ring-red-400"
                >
                    Generar Nuevo Plan
                </button>
                <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex-grow sm:flex-grow-0 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg text-lg uppercase tracking-wider transition-all duration-300"
                >
                    Editar Perfil
                </button>
                <button
                    onClick={handleSwitchUser}
                    className="flex-grow sm:flex-grow-0 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg text-lg uppercase tracking-wider transition-all duration-300"
                >
                    Cambiar Usuario
                </button>
            </div>
            <WorkoutPlanDisplay 
                plan={plan}
                planId={planState.id}
                completedDays={completedDays}
                onMarkComplete={handleMarkAsComplete}
                dayNotes={dayNotes[planState.id] || {}}
                onNoteChange={(day, text) => handleNoteChange(planState.id, day, text)}
            />
        </div>
      );
    }

    return (
      <div className="text-center bg-zinc-900 p-10 rounded-xl shadow-2xl border border-zinc-800 animate-fade-in">
        <h2 className="text-4xl font-semibold text-red-400 mb-4 tracking-wide">CONSTRUYE TU SEMANA DE COMBATE</h2>
        <p className="max-w-3xl mx-auto text-zinc-300 mb-8 text-lg">
          Obtén un plan de entrenamiento semanal integral diseñado para el boxeador veterano. Optimiza tu fuerza, técnica y resistencia con una rutina inteligente que se adapta a ti.
        </p>
        <div className="flex flex-col items-center gap-4">
            <button
                onClick={handleGeneratePlan}
                className="w-full max-w-sm bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-lg text-xl uppercase tracking-widest transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-400"
                >
                Generar Plan
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
           <div className="flex items-center space-x-4">
            <BoxingGloveIcon className="h-12 w-12 text-red-500" />
            <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-white uppercase">Boxeadores 40+</h1>
                <p className="text-zinc-400 text-sm sm:text-base">{username ? `Tu Campo de Entrenamiento, ${username}`: "Forjado con Coraje y Disciplina"}</p>
            </div>
          </div>
        </header>

        <main>
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

export default App;
