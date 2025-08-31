
import { GoogleGenAI, Type } from '@google/genai';
import type { WeeklyPlan, Equipment, UserProfile } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const equipmentDescriptions: Record<Equipment, string> = {
    'Clubbells': 'Para ejercicios balísticos, de agarre y movilidad de hombros.',
    'Kettlebells': "Para potencia explosiva y fuerza total. Se puede usar una gran variedad de ejercicios como: Swing, Goblet Squat, Peso Muerto, Remo, Press, Levantada Turca (TGU), Halo, Alrededor del Cuerpo, El Ocho, y Caminata del Granjero/Valija (Farmer's/Suitcase Carry).",
    'Dumbbells': 'Para fuerza bilateral y unilateral.',
    'Resistance Bands': 'Para calentamiento, activación y resistencia.'
};

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Nombre del ejercicio (ej. 'Saltar la Cuerda', 'Sombra con Pesas')." },
        shortDescription: { type: Type.STRING, description: "Descripción muy breve o un consejo clave (ej. 'Prioriza un movimiento fluido y controlado')." },
        details: { type: Type.STRING, description: "Instrucciones detalladas sobre cómo realizar el ejercicio, incluyendo OBLIGATORIAMENTE: series, repeticiones y tiempo de descanso entre series (ej. '3 series de 8-10 repeticiones por cada lado. Descanso entre series: 90 segundos')." },
        durationSeconds: { type: Type.NUMBER, description: "Duración total del ejercicio en segundos, si aplica (para planchas, saltar cuerda, etc.)." },
        restDurationSeconds: { type: Type.NUMBER, description: "Duración del descanso después de completar todas las series del ejercicio, si aplica." },
        explanation: { type: Type.STRING, description: "Una explicación detallada del propósito del ejercicio: qué músculos trabaja, por qué es beneficioso para un boxeador y cuál es su transferencia a una pelea real. Debe ser conciso pero informativo." }
    },
    required: ['name', 'details', 'explanation']
};

const workoutDaySchema = {
    type: Type.OBJECT,
    properties: {
        day: { type: Type.NUMBER, description: "Número del día de la semana (1 a 6). No crees más de 6 días de entrenamiento." },
        focus: { type: Type.STRING, description: "El enfoque principal del entrenamiento del día (ej. 'Fuerza y Potencia', 'Técnica y Velocidad', 'Resistencia Cardiovascular')." },
        warmup: {
            type: Type.ARRAY,
            description: "Lista de ejercicios de calentamiento.",
            items: exerciseSchema
        },
        mainWorkout: {
            type: Type.ARRAY,
            description: "Lista de ejercicios del entrenamiento principal.",
            items: exerciseSchema
        },
        cooldown: {
            type: Type.ARRAY,
            description: "Lista de ejercicios de enfriamiento.",
            items: exerciseSchema
        },
    },
    required: ['day', 'focus', 'warmup', 'mainWorkout', 'cooldown']
};

const progressionPrincipleSchema = {
    type: Type.OBJECT,
    properties: {
        principle: { type: Type.STRING, description: "Nombre del principio de progresión (ej. 'Sobrecarga Progresiva')." },
        description: { type: Type.STRING, description: "Explicación de cómo aplicar este principio durante la semana." }
    },
    required: ['principle', 'description']
};


const weeklyPlanSchema = {
  type: Type.OBJECT,
  properties: {
    weeklyPlan: {
      type: Type.ARRAY,
      description: "Un plan de entrenamiento de 6 días para la semana. El sexto día es un comodín opcional. No incluyas días de descanso.",
      items: workoutDaySchema
    },
    progressionPrinciples: {
      type: Type.ARRAY,
      description: "Principios clave para que el atleta progrese semana a semana.",
      items: progressionPrincipleSchema
    }
  },
  required: ['weeklyPlan', 'progressionPrinciples']
};


export async function generateWorkoutPlan(profile: UserProfile): Promise<WeeklyPlan> {
  const equipmentList = profile.equipment.map((item, index) => {
    return `${index + 1}.  **${item}:** ${equipmentDescriptions[item]}`;
  }).join('\n');

  const finalEquipmentPrompt = profile.equipment.length > 0
    ? `${equipmentList}\n    *   También se permiten ejercicios con **peso corporal**.`
    : `*   El atleta SOLO tiene acceso a ejercicios con **peso corporal**. TODOS los ejercicios deben basarse en peso corporal.`;

  const prompt = `
    Eres un entrenador de boxeo de élite y especialista en biomecánica. Tu tarea es diseñar un plan de entrenamiento personalizado de 6 días para un boxeador veterano (más de 40 años), priorizando la prevención de lesiones.

    **PERFIL DEL ATLETA:**
    *   **Nivel de Experiencia:** ${profile.experience}
    *   **Objetivo Principal:** ${profile.goal}

    **INSTRUCCIONES DE ADAPTACIÓN (MUY IMPORTANTE):**
    El plan debe adaptarse rigurosamente al perfil del atleta. Sigue estas directrices:
    *   **Si el nivel es 'Principiante':** Enfócate en la técnica fundamental, acondicionamiento general y evita ejercicios demasiado complejos o de alto impacto. Simplifica las combinaciones.
    *   **Si el nivel es 'Intermedio':** Introduce combinaciones más complejas, aumenta la intensidad de los drills y asume una base de conocimiento sólida.
    *   **Si el nivel es 'Avanzado':** Desafía al atleta con ejercicios pliométricos avanzados, drills de alta velocidad y combinaciones tácticas complejas.
    *   **Si el objetivo es 'Potencia':** Prioriza ejercicios balísticos, pliométricos y de fuerza máxima (bajas repeticiones, alta intensidad) en los días de fuerza.
    *   **Si el objetivo es 'Resistencia':** Incorpora más asaltos en los días de técnica, utiliza intervalos de alta intensidad (HIIT) y considera reducir ligeramente los descansos.
    *   **Si el objetivo es 'Pérdida de Peso':** Aumenta el volumen total del entrenamiento (más series o repeticiones), mantén los descansos cortos para elevar el ritmo cardíaco y enfócate en un acondicionamiento metabólico intenso.

    **REGLA CRÍTICA DE EQUIPAMIENTO:** El atleta SOLO tiene acceso al siguiente equipamiento. Todos los ejercicios de fuerza y acondicionamiento DEBEN usar EXCLUSIVAMENTE estos elementos. No inventes ni sugieras ejercicios con otro material.
    ${finalEquipmentPrompt}

    **Estructura del Plan Semanal (6 Días) con Enfoque Específico:**
    Genera un plan de EXACTAMENTE 6 días de entrenamiento, estructurado de la siguiente manera. No incluyas días de descanso en la respuesta JSON.

    *   **Día 1: Tren Superior - Fuerza y Movilidad.** El entrenamiento debe ser integral, trabajando las cadenas musculares del torso (anterior, posterior, y cruzadas/espiral). Construye el entrenamiento principal seleccionando 4-5 ejercicios de las siguientes categorías, asegurando un equilibrio entre empuje, tracción y rotación.
        *   **Ejercicios de Empuje (Selecciona 1-2):** Flexiones (variaciones: con banda, declinadas), Press de Suelo (Floor Press) con mancuernas o kettlebells, Press por encima de la cabeza (Overhead Press) con mancuernas o kettlebells.
        *   **Ejercicios de Tracción (Selecciona 1-2):** Remo con mancuerna a una mano (Dumbbell Row), Remo Gorila con kettlebells (Gorilla Row), Pull-aparts con bandas elásticas, Remos con bandas elásticas.
        *   **Movilidad y Core Rotacional (Selecciona 1-2):** Halos con kettlebell, Windmill con kettlebell, Clubbell Shield Cast, Clubbell Gamma Cast, Renegade Rows con mancuernas.
        *   **Ejercicios Balísticos Específicos de Boxeo (Selecciona solo UNO de la siguiente lista para todo el día):**
            *   'Lanzamiento de Kettlebell Frontal (Simulación de Golpe)': Agarrar la pesa rusa, lanzarla hacia adelante en un solo movimiento fluido y explosivo (simulando un golpe recto) sin soltarla, y traerla de vuelta rápidamente al pecho.
            *   'Elevación de Kettlebell para Gancho': Sostener la pesa rusa sobre el antebrazo y levantarla imitando el movimiento de un gancho.
            *   'Clubbell Swing (simulando uppercut)': Realizar un swing con la maza que termine en una posición similar a un uppercut.
        *   **Regla específica para este día: No incluyas 'Kettlebell Swings' tradicionales (de dos manos o a una mano para la cadera) ni planchas estáticas.** El objetivo es construir un torso fuerte, resistente y móvil para el boxeo.
    
    *   **Día 2: Fuerza del Tren Inferior (Levantamiento Pesado).** El enfoque es la fuerza máxima y la hipertrofia funcional para las piernas. Diseña un entrenamiento principal con 4-5 ejercicios, seleccionando de las siguientes categorías para crear una sesión equilibrada.
        *   **Calentamiento:** Diseña un calentamiento dinámico adecuado, que incluya movimientos como 'Balanceos de Pierna', 'Círculos de Cadera', 'Sentadilla sin Peso' y 'Activación de Glúteos con Banda'.
        *   **Entrenamiento Principal (selecciona 4-5 ejercicios en total):**
            *   **Movimiento Principal de Sentadilla (Selecciona UNO):** Sentadilla Goblet con Kettlebell, Sentadilla Frontal con dos Kettlebells, Sentadilla con Mancuernas.
            *   **Movimiento Principal de Bisagra de Cadera (Selecciona UNO):** Peso Muerto Rumano (RDL) con mancuernas o kettlebells, Kettlebell Swing (a dos manos o una mano), Puente de Glúteos con peso (mancuerna o kettlebell).
            *   **Movimiento Unilateral (Selecciona UNO):** Zancadas (hacia atrás, adelante o laterales) con mancuernas o kettlebells, Sentadilla Búlgara con mancuernas (si se asume un banco/silla), Step-ups con peso.
            *   **Ejercicios Accesorios (Selecciona 1-2):** Paseo del Monstruo con Banda, Abducción de cadera con banda, Elevación de pantorrillas con peso.
        *   **Enfriamiento:** Estiramientos estáticos para los principales músculos de las piernas (cuádriceps, isquiotibiales, glúteos, pantorrillas).

    *   **Día 3: Técnica de Boxeo y Velocidad de Manos.** El enfoque es 'Técnica y Velocidad'.
        *   **Calentamiento:** 'Rotación de Brazos Amplios' (2x10 adelante/atrás), 'Círculos de Muñeca y Tobillo' (30s/dirección), 'Círculos de Cadera de Pie' (2x10/lado), 'Salto de Cuerda (Imaginaria)' (3 min), y 'Balanceos de Pierna Hacia Adelante y Atrás' (2x10).
        *   **Entrenamiento Principal:** DEBE estar estructurado en **asaltos (rounds) que imitan una pelea real**. Genera entre 5 y 6 ejercicios. Cada ejercicio representa un asalto.
            *   **Formato de cada ejercicio/asalto:** El campo 'details' debe especificar **'1 asalto de 3 minutos de trabajo, seguido de 1 minuto de descanso.'**.
            *   **Contenido:** Los ejercicios deben ser drills enfocados en velocidad de manos y técnica fundamental. Ejemplos: 'Asalto 1: Jab Rápido y Retroceso', 'Asalto 2: Doble Jab y Cross', 'Asalto 3: Velocidad en Golpes Rectos (1-2-1-2)', 'Asalto 4: Sombra con Desplazamiento Lateral y Contraataque'. El objetivo es mantener una alta cadencia de golpes con buena forma.
        *   **Enfriamiento:** 'Rotación de Columna Tumbado' (30-45s/lado), 'Estiramiento de Muñecas' (30s/posición), y 'Estiramiento de Isquiotibiales Tumbado' (30-45s/pierna).

    *   **Día 4: Sprints y Potencia Explosiva.** Este día se centra en la velocidad máxima y la potencia pliométrica. El enfoque debe ser 'Sprints y Potencia Explosiva'.
        *   **Calentamiento:** Un calentamiento progresivo para preparar el sistema neuromuscular. Debe incluir: 'Rodillas Arriba (High Knees)' (2x30s), 'Talones a los Glúteos (Butt Kicks)' (2x30s), y luego '5 Sprints Progresivos de 30 metros', comenzando al 50% y aumentando la velocidad en cada uno hasta alcanzar un máximo del 80%.
        *   **Entrenamiento Principal (Pliometría):** Un bloque enfocado en la reactividad. Selecciona 2-3 ejercicios de la siguiente lista: 'Jumping Jacks', 'Saltos de Rana (Frog Jumps)', 'Sentadillas con Salto (Jump Squats)', 'Flexiones Pliométricas', 'Broad Jumps (Salto de longitud sin carrera)', 'Tuck Jumps (Saltos con rodillas al pecho)'. Realiza 3 series de 8-12 repeticiones (o 30-40 para Jumping Jacks). Descanso de 60-90 segundos entre series.
        *   **Sprints a Máxima Velocidad:** La parte final y más intensa. Debe consistir en '2 Sprints de 40 metros a máxima velocidad'. **El campo 'details' debe especificar OBLIGATORIAMENTE: 'Realiza 2 sprints a máxima intensidad. Descansa exactamente 120 segundos entre cada sprint para una recuperación completa.'**.
        *   **Enfriamiento:** Estiramientos estáticos largos para los músculos trabajados: cuádriceps, isquiotibiales, glúteos y pantorrillas.

    *   **Día 5: Combinaciones de Boxeo y Juego de Piernas.** El enfoque es 'Combinaciones y Juego de Piernas'.
        *   **Calentamiento:** 'Salto de Cuerda (variaciones)' (4 min), 'Sombra con Movilidad de Hombros' (2 min), 'Puente de Glúteos Dinámico' (10/lado), y 'Rotaciones Torácicas Sentado' (10/lado).
        *   **Entrenamiento Principal:** DEBE estar estructurado en **asaltos (rounds) que imitan una pelea real**. Genera entre 5 y 6 ejercicios. Cada ejercicio representa un asalto.
            *   **Formato de cada ejercicio/asalto:** El campo 'details' debe especificar **'1 asalto de 3 minutos de trabajo, seguido de 1 minuto de descanso.'**.
            *   **Contenido:** Los ejercicios deben ser drills que integren combinaciones avanzadas con movimientos de pies. Ejemplos: 'Asalto 1: Sombra con Pivotes y Cambios de Ángulo', 'Asalto 2: Combinación 1-2-Gancho al Cuerpo con Salida Lateral', 'Asalto 3: Fintas y Cross de Contraataque', 'Asalto 4: Drill de Entradas y Salidas con Combinaciones de 3 Golpes'. No incluyas ejercicios de fuerza como flexiones o desplantes en esta sección.
        *   **Enfriamiento:** 'Estiramiento de Psoas' (60s), 'Estiramiento de Rotadores de Cadera' (60s/lado), y 'Estiramiento de Columna (Gato-Vaca)' (60s).
    
    *   **Día 6: DÍA COMODÍN - Recuperación Activa y Movilidad.** Este día es opcional, enfocado en la recuperación. El enfoque DEBE ser 'DÍA COMODÍN: Recuperación y Movilidad'.
        *   **Calentamiento:** 'Caminata Lenta' (5 min), 'Balanceos Suaves de Brazos y Piernas' (2 min), 'Inclinaciones Laterales de Tronco' (10/lado).
        *   **Entrenamiento Principal:** Movimientos controlados y de bajo impacto. Incluye 'CARs (Controlled Articular Rotations)' para todas las articulaciones principales (3 series de 5 repeticiones), 'Dead Bug' (3x10/lado), 'Bird-Dog' (3x10/lado), 'Puente de Glúteos' (3x15), y 'Rotaciones Torácicas (Libro Abierto)' (3x8-10/lado). Puedes incluir ejercicios de clubbell muy ligeros como 'Pull Over' o 'Press Out' para movilidad.
        *   **Enfriamiento:** Estiramientos de larga duración (60-90 segundos por estiramiento), enfocándose en 'Psoas', 'Isquiotibiales', 'Cadera (Figura 4)', 'Pecho en la pared', y 'Columna Torácica (Rotación en cuatro patas)'.

    **Principios de Progresión:**
    Incluye 2-3 principios de progresión que el atleta debe seguir para mejorar semana a semana. Explica cómo aplicarlos. Ejemplos: Sobrecarga Progresiva, Principio de Variación, Manejo de la Fatiga.

    **REGLA FINAL:** Asegúrate de que la salida sea un único objeto JSON válido que cumpla con el esquema proporcionado. Cada ejercicio, sin excepción, debe tener un campo 'explanation' no vacío.
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: weeklyPlanSchema,
        }
    });

    const jsonText = response.text.trim();
    const planData = JSON.parse(jsonText) as WeeklyPlan;
    
    // Basic validation to ensure the structure is roughly correct
    if (!planData.weeklyPlan || !planData.progressionPrinciples) {
        throw new Error("La respuesta de la IA no tiene la estructura esperada.");
    }

    return planData;
  } catch (error) {
    console.error("Error al generar o procesar el plan de entrenamiento:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("La respuesta de la IA no era un JSON válido. Inténtalo de nuevo.");
    }
    throw error;
  }
}