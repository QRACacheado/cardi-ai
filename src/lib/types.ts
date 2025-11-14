// Tipos para o app de saúde cardíaca

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // Horários (ex: ["08:00", "20:00"])
  notes?: string;
  taken: { date: string; time: string }[]; // Histórico de doses tomadas
}

export interface Exercise {
  id: string;
  type: string;
  duration: number; // em minutos
  intensity: 'leve' | 'moderada' | 'intensa';
  date: string;
  notes?: string;
  heartRate?: number;
}

export interface Meal {
  id: string;
  type: 'café da manhã' | 'almoço' | 'jantar' | 'lanche';
  foods: string[];
  calories?: number;
  date: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Tipos para Onboarding
export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  medications: string[];
  medicationCount: number;
  plan: 'essencial' | 'premium' | 'elite';
  onboardingCompleted: boolean;
}

export interface Plan {
  id: 'essencial' | 'premium' | 'elite';
  name: string;
  tagline: string;
  price: number;
  period: string;
  features: string[];
  highlighted: boolean;
  color: string;
}

// Tipos para Análise de Refeições
export interface MealAnalysis {
  id: string;
  mealDescription: string;
  score: number; // 0-100
  estimatedCalories: number;
  positivePoints: string[];
  improvements: string[];
  recommendations: string[];
  date: string;
  timestamp: string;
}
