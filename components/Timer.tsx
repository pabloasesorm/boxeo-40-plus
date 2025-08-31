import React, { useState, useEffect, useRef } from 'react';

// Variable a nivel de módulo para mantener la única instancia de AudioContext.
// Esto asegura que no creemos un nuevo contexto por cada instancia del temporizador.
let audioContext: AudioContext | null = null;

/**
 * Inicializa o reanuda el AudioContext de la API de Web Audio.
 * Esta función DEBE ser llamada en respuesta a un gesto del usuario (p. ej., un evento de clic)
 * para cumplir con las políticas de reproducción automática de los navegadores.
 */
const initAudio = () => {
  if (typeof window === 'undefined') return;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("La API de Web Audio no es compatible con este navegador.", e);
      return; // Si no se puede crear el contexto, no podemos reproducir sonidos.
    }
  }

  // Si el contexto fue creado pero está suspendido, la interacción del usuario puede reanudarlo.
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
};

/**
 * Reproduce un breve sonido de "bip" utilizando la API de Web Audio.
 * El AudioContext debe estar inicializado y en ejecución.
 */
const playBeep = () => {
  // Si no hay contexto o no está en ejecución, no podemos reproducir un sonido.
  if (!audioContext || audioContext.state !== 'running') {
    console.warn("AudioContext no está listo. No se puede reproducir el bip. Podría requerirse interacción del usuario.");
    return;
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Nota La5 para un bip claro
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Establecer volumen
  
  // Desvanecer el sonido rápidamente para evitar un clic brusco
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};


interface TimerProps {
  initialSeconds: number;
  label: string;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, label }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsActive(false);
      playBeep(); // Reproducir el sonido cuando el temporizador finaliza
    }

    // Función de limpieza para limpiar el intervalo cuando el componente se desmonta o las dependencias cambian
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds]);

  // Efecto para reiniciar el estado del temporizador si sus props cambian (p. ej., se genera un nuevo plan)
  useEffect(() => {
    setSeconds(initialSeconds);
    setIsActive(false);
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
  }, [initialSeconds, label]);


  const toggleTimer = () => {
    // Inicializar el contexto de audio en la interacción del usuario (al hacer clic en el botón de inicio/pausa)
    initAudio();

    if (seconds > 0) {
      setIsActive(!isActive);
    }
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setSeconds(initialSeconds);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const remainingSeconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const isCompleted = seconds === 0;

  return (
    <div className={`text-center bg-zinc-700/50 p-3 rounded-lg w-48 flex-shrink-0 ${isCompleted ? 'border border-green-500' : ''}`}>
      <div className="text-sm uppercase tracking-wider text-zinc-400 mb-1">{label}</div>
      <div className="text-4xl font-bold font-mono text-white mb-3 tabular-nums">{formatTime(seconds)}</div>
      <div className="flex justify-center gap-2">
        <button
          onClick={toggleTimer}
          disabled={isCompleted}
          className={`w-1/2 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 ${
            isCompleted
              ? 'bg-zinc-600 cursor-not-allowed'
              : isActive
              ? 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-400'
              : 'bg-green-600 hover:bg-green-500 focus:ring-green-400'
          }`}
          aria-label={isActive ? `Pausar temporizador de ${label}` : `Iniciar temporizador de ${label}`}
        >
          {isActive ? 'Pausar' : 'Iniciar'}
        </button>
        <button
          onClick={resetTimer}
          className="w-1/2 bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-zinc-400"
          aria-label={`Reiniciar temporizador de ${label}`}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;