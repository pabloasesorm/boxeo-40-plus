import React from 'react';

interface CoreAthleteRoutineModalProps {
  onClose: () => void;
}

const CoreAthleteRoutineModal: React.FC<CoreAthleteRoutineModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-zinc-900 border-2 border-red-500 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 id="modal-title" className="text-4xl font-bold text-red-400 mb-4 tracking-wider uppercase">Rutina Destacada: Explosividad Atlética</h2>
        <p className="text-zinc-400 mb-6">
          Esta rutina está diseñada para maximizar tu poder de golpe y agilidad. Realízala una o dos veces por semana en lugar de tu sesión de fuerza habitual.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-zinc-200 border-b-2 border-zinc-700 pb-2">Circuito de Potencia (Realizar 3-4 rondas)</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
                <li><span className="font-bold text-red-400">Saltos al Cajón:</span> 5 repeticiones (enfócate en la altura y la explosividad).</li>
                <li><span className="font-bold text-red-400">Lanzamiento de Balón Medicinal:</span> 8 repeticiones (lanza con fuerza contra una pared).</li>
                <li><span className="font-bold text-red-400">Flexiones Pliométricas:</span> 10 repeticiones (empuja con suficiente fuerza para que las manos se despeguen del suelo).</li>
                <li><span className="font-bold text-red-400">Sprints Cortos:</span> 30 segundos de sprint en el sitio o en una cinta.</li>
            </ul>
            <p className="text-sm text-zinc-500 mt-2">Descansa 90 segundos entre cada ronda.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-zinc-200 border-b-2 border-zinc-700 pb-2">Trabajo de Core</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-300">
                <li><span className="font-bold text-red-400">Giros Rusos con Peso:</span> 3 series de 15 repeticiones por lado.</li>
                <li><span className="font-bold text-red-400">Plancha con Alcance:</span> 3 series de 10 repeticiones por brazo.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-right">
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg uppercase tracking-wider transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoreAthleteRoutineModal;