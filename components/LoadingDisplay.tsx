import React, { useState, useEffect } from 'react';
import { BoxingGloveIcon } from './Icons';

const loadingMessages = [
  "Ajustando tu estrategia de combate...",
  "Consultando con los entrenadores de élite...",
  "Diseñando tus asaltos de campeonato...",
  "Analizando tus fortalezas...",
  "Preparando el cuadrilátero...",
];

const LoadingDisplay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-10 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 animate-fade-in">
        <BoxingGloveIcon className="h-24 w-24 mb-6 animate-spin text-red-500" />
        <h2 className="text-4xl font-semibold text-red-400 mb-2 tracking-wide">GENERANDO PLAN...</h2>
        <p className="text-zinc-400 transition-opacity duration-500 ease-in-out h-6">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default LoadingDisplay;
