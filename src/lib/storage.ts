import { UserProfile, Medication, MealAnalysis } from './types';

// Chaves para localStorage
const STORAGE_KEY = 'cardio-vital-data';
const PROFILE_KEY = 'cardio-vital-profile';
const MEAL_ANALYSIS_KEY = 'cardio-vital-meal-analysis';

// Salvar medicamentos
export function saveMedications(medications: Medication[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
  }
}

// Carregar medicamentos
export function getMedications(): Medication[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

// Salvar perfil do usuário
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
}

// Carregar perfil do usuário
export function getUserProfile(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

// Verificar se onboarding foi completado
export function isOnboardingCompleted(): boolean {
  const profile = getUserProfile();
  return profile?.onboardingCompleted || false;
}

// Salvar análise de refeição
export function saveMealAnalysis(analysis: MealAnalysis): void {
  if (typeof window !== 'undefined') {
    const analyses = getMealAnalyses();
    analyses.unshift(analysis); // Adiciona no início
    // Mantém apenas as últimas 50 análises
    const limitedAnalyses = analyses.slice(0, 50);
    localStorage.setItem(MEAL_ANALYSIS_KEY, JSON.stringify(limitedAnalyses));
  }
}

// Carregar análises de refeições
export function getMealAnalyses(): MealAnalysis[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(MEAL_ANALYSIS_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
}

// Deletar análise de refeição
export function deleteMealAnalysis(id: string): void {
  if (typeof window !== 'undefined') {
    const analyses = getMealAnalyses();
    const filtered = analyses.filter(a => a.id !== id);
    localStorage.setItem(MEAL_ANALYSIS_KEY, JSON.stringify(filtered));
  }
}
