'use client';

import { useState, useEffect } from 'react';
import { Heart, Pill, Activity, Utensils, MessageCircle, Plus, Check, Clock, ChevronRight, ChevronLeft, Sparkles, Crown, Shield, Dumbbell, Timer, Target, Send, Apple, Salad, Coffee, Moon, Globe, TrendingUp, TrendingDown, Minus, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Medication, UserProfile, Plan, MealAnalysis } from '@/lib/types';
import { getMedications, saveMedications, getUserProfile, saveUserProfile, isOnboardingCompleted, getMealAnalyses, saveMealAnalysis, deleteMealAnalysis } from '@/lib/storage';
import { useLanguage } from '@/hooks/useLanguage';
import { Language } from '@/lib/i18n';
import { formatPrice, detectCurrency, getCurrencyInfo } from '@/lib/pricing';

export default function Home() {
  const { language, t, changeLanguage } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [coachMessage, setCoachMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', message: string }>>([]);
  const [mealAnalyses, setMealAnalyses] = useState<MealAnalysis[]>([]);
  const [mealDescription, setMealDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userCurrency, setUserCurrency] = useState<string>('BRL');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);

  // Dados do onboarding
  const [onboardingData, setOnboardingData] = useState({
    age: '',
    weight: '',
    height: '',
    medications: [''],
    medicationCount: '0',
    selectedPlan: 'premium' as 'essencial' | 'premium' | 'elite',
  });

  // Planos disponíveis (agora com traduções)
  const PLANS: Plan[] = [
    {
      id: 'essencial',
      name: t.plans.essencial.name,
      tagline: t.plans.essencial.tagline,
      price: 0,
      period: t.plans.essencial.period,
      features: t.plans.essencial.features,
      highlighted: false,
      color: 'from-gray-500 to-gray-600',
    },
    {
      id: 'premium',
      name: t.plans.premium.name,
      tagline: t.plans.premium.tagline,
      price: 14.99,
      period: t.plans.premium.period,
      features: t.plans.premium.features,
      highlighted: true,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'elite',
      name: t.plans.elite.name,
      tagline: t.plans.elite.tagline,
      price: 99.99,
      period: t.plans.elite.period,
      features: t.plans.elite.features,
      highlighted: false,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  // Verificar se precisa mostrar onboarding
  useEffect(() => {
    const completed = isOnboardingCompleted();
    setShowOnboarding(!completed);
    
    // Detectar moeda do usuário baseado no continente
    const currency = detectCurrency();
    setUserCurrency(currency);
    
    if (completed) {
      const profile = getUserProfile();
      setUserProfile(profile);
      setMedications(getMedications());
      setMealAnalyses(getMealAnalyses());
    }
  }, []);

  // Exercícios personalizados baseados no perfil
  const getPersonalizedExercises = (weight: number, age: number) => {
    const imc = weight / Math.pow(1.70, 2);
    const isOverweight = imc > 25;
    const isSenior = age > 60;

    const exerciseNames: Record<Language, string[]> = {
      pt: ['Caminhada Leve', 'Alongamento Completo', 'Exercícios Respiratórios', 'Bicicleta Ergométrica', 'Natação Leve', 'Yoga para Cardíacos'],
      en: ['Light Walking', 'Full Stretching', 'Breathing Exercises', 'Stationary Bike', 'Light Swimming', 'Yoga for Heart Health'],
      nl: ['Lichte Wandeling', 'Volledige Stretching', 'Ademhalingsoefeningen', 'Hometrainer', 'Licht Zwemmen', 'Yoga voor Hartgezondheid'],
      fr: ['Marche Légère', 'Étirements Complets', 'Exercices Respiratoires', 'Vélo Stationnaire', 'Natation Légère', 'Yoga pour la Santé Cardiaque'],
      de: ['Leichtes Gehen', 'Vollständiges Dehnen', 'Atemübungen', 'Heimtrainer', 'Leichtes Schwimmen', 'Yoga für Herzgesundheit'],
    };

    const exerciseDescriptions: Record<Language, string[]> = {
      pt: [
        'Caminhada em ritmo confortável para aquecimento cardiovascular',
        'Série de alongamentos para melhorar flexibilidade e circulação',
        'Técnicas de respiração profunda para fortalecer o sistema cardiovascular',
        'Pedalada em ritmo moderado, excelente para o coração',
        'Natação suave, ideal para cardíacos (baixo impacto)',
        'Posturas adaptadas para fortalecer o coração sem esforço excessivo',
      ],
      en: [
        'Walking at a comfortable pace for cardiovascular warm-up',
        'Series of stretches to improve flexibility and circulation',
        'Deep breathing techniques to strengthen the cardiovascular system',
        'Moderate-paced cycling, excellent for the heart',
        'Gentle swimming, ideal for heart patients (low impact)',
        'Adapted postures to strengthen the heart without excessive effort',
      ],
      nl: [
        'Wandelen in een comfortabel tempo voor cardiovasculaire opwarming',
        'Reeks stretchoefeningen om flexibiliteit en circulatie te verbeteren',
        'Diepe ademhalingstechnieken om het cardiovasculaire systeem te versterken',
        'Fietsen in matig tempo, uitstekend voor het hart',
        'Zacht zwemmen, ideaal voor hartpatiënten (lage impact)',
        'Aangepaste houdingen om het hart te versterken zonder overmatige inspanning',
      ],
      fr: [
        'Marche à un rythme confortable pour l\'échauffement cardiovasculaire',
        'Série d\'étirements pour améliorer la flexibilité et la circulation',
        'Techniques de respiration profonde pour renforcer le système cardiovasculaire',
        'Cyclisme à rythme modéré, excellent pour le cœur',
        'Natation douce, idéale pour les patients cardiaques (faible impact)',
        'Postures adaptées pour renforcer le cœur sans effort excessif',
      ],
      de: [
        'Gehen in einem komfortablen Tempo zur kardiovaskulären Aufwärmung',
        'Serie von Dehnübungen zur Verbesserung von Flexibilität und Durchblutung',
        'Tiefe Atemtechniken zur Stärkung des Herz-Kreislauf-Systems',
        'Radfahren in moderatem Tempo, ausgezeichnet für das Herz',
        'Sanftes Schwimmen, ideal für Herzpatienten (geringe Belastung)',
        'Angepasste Haltungen zur Stärkung des Herzens ohne übermäßige Anstrengung',
      ],
    };

    const intensityLabels: Record<Language, string[]> = {
      pt: ['Baixa', 'Muito Baixa', 'Muito Baixa', 'Moderada', 'Baixa a Moderada', 'Baixa'],
      en: ['Low', 'Very Low', 'Very Low', 'Moderate', 'Low to Moderate', 'Low'],
      nl: ['Laag', 'Zeer Laag', 'Zeer Laag', 'Matig', 'Laag tot Matig', 'Laag'],
      fr: ['Faible', 'Très Faible', 'Très Faible', 'Modérée', 'Faible à Modérée', 'Faible'],
      de: ['Niedrig', 'Sehr Niedrig', 'Sehr Niedrig', 'Mäßig', 'Niedrig bis Mäßig', 'Niedrig'],
    };

    const durations = [
      isSenior ? '15 min' : '20 min',
      '10 min',
      '5 min',
      isOverweight ? '15 min' : '25 min',
      '20 min',
      '15 min',
    ];

    return exerciseNames[language].map((name, idx) => ({
      id: idx + 1,
      name,
      duration: durations[idx],
      intensity: intensityLabels[language][idx],
      calories: Math.round(weight * [0.3, 0.1, 0.05, 0.5, 0.4, 0.2][idx]),
      description: exerciseDescriptions[language][idx],
      icon: ['🚶', '🧘', '💨', '🚴', '🏊', '🧘‍♂️'][idx],
      recommended: idx < 3 || idx === 4 || idx === 5,
    }));
  };

  // Plano de dieta personalizado
  const getPersonalizedDiet = (weight: number, height: number, age: number) => {
    const heightInMeters = height / 100;
    const imc = weight / Math.pow(heightInMeters, 2);
    const isOverweight = imc > 25;
    const tmb = 10 * weight + 6.25 * height - 5 * age + 5;
    const caloriasDiarias = Math.round(tmb * 1.3);

    const statusLabels: Record<Language, Record<string, string>> = {
      pt: { underweight: 'Abaixo do peso', normal: 'Peso normal', overweight: 'Sobrepeso', obese: 'Obesidade' },
      en: { underweight: 'Underweight', normal: 'Normal weight', overweight: 'Overweight', obese: 'Obesity' },
      nl: { underweight: 'Ondergewicht', normal: 'Normaal gewicht', overweight: 'Overgewicht', obese: 'Obesitas' },
      fr: { underweight: 'Insuffisance pondérale', normal: 'Poids normal', overweight: 'Surpoids', obese: 'Obésité' },
      de: { underweight: 'Untergewicht', normal: 'Normalgewicht', overweight: 'Übergewicht', obese: 'Fettleibigkeit' },
    };

    const statusKey = imc < 18.5 ? 'underweight' : imc < 25 ? 'normal' : imc < 30 ? 'overweight' : 'obese';

    return {
      caloriasDiarias,
      imc: imc.toFixed(1),
      status: statusLabels[language][statusKey],
    };
  };

  // Dicas do Coach AI
  const getCoachTips = (weight: number, age: number, medicationCount: number) => {
    const imc = weight / Math.pow(1.70, 2);
    const isOverweight = imc > 25;
    const isSenior = age > 60;

    const tipsData: Record<Language, Array<{ categoria: string; titulo: string; mensagem: string; dica: string }>> = {
      pt: [
        {
          categoria: '💊 Medicamentos',
          titulo: 'Regularidade é Fundamental',
          mensagem: 'Tomar seus medicamentos nos horários corretos é essencial para o controle da sua condição cardíaca.',
          dica: 'Configure alarmes no celular para cada horário de medicação',
        },
        {
          categoria: '🏃 Exercícios',
          titulo: 'Movimento é Vida',
          mensagem: 'Exercícios leves e regulares fortalecem seu coração e melhoram sua qualidade de vida.',
          dica: 'Comece com 10 minutos de caminhada por dia e aumente gradualmente',
        },
        {
          categoria: '🥗 Alimentação',
          titulo: 'Nutrição Balanceada',
          mensagem: 'Uma dieta equilibrada ajuda a controlar pressão arterial e colesterol.',
          dica: 'Reduza sal e gorduras saturadas, aumente vegetais e frutas',
        },
        {
          categoria: '💧 Hidratação',
          titulo: 'Água é Essencial',
          mensagem: 'Manter-se hidratado ajuda na circulação sanguínea e função cardíaca.',
          dica: 'Beba pelo menos 2 litros de água por dia',
        },
        {
          categoria: '😴 Sono',
          titulo: 'Descanso Adequado',
          mensagem: 'Dormir bem é crucial para a recuperação e saúde do coração.',
          dica: 'Mantenha rotina de sono regular, 7-8 horas por noite',
        },
        {
          categoria: '🧘 Estresse',
          titulo: 'Controle o Estresse',
          mensagem: 'Estresse elevado pode afetar negativamente sua saúde cardíaca.',
          dica: 'Pratique técnicas de relaxamento como meditação ou respiração profunda',
        },
      ],
      en: [
        {
          categoria: '💊 Medications',
          titulo: 'Regularity is Key',
          mensagem: 'Taking your medications at the correct times is essential for managing your heart condition.',
          dica: 'Set phone alarms for each medication time',
        },
        {
          categoria: '🏃 Exercise',
          titulo: 'Movement is Life',
          mensagem: 'Light, regular exercise strengthens your heart and improves your quality of life.',
          dica: 'Start with 10 minutes of walking per day and gradually increase',
        },
        {
          categoria: '🥗 Nutrition',
          titulo: 'Balanced Nutrition',
          mensagem: 'A balanced diet helps control blood pressure and cholesterol.',
          dica: 'Reduce salt and saturated fats, increase vegetables and fruits',
        },
        {
          categoria: '💧 Hydration',
          titulo: 'Water is Essential',
          mensagem: 'Staying hydrated helps blood circulation and heart function.',
          dica: 'Drink at least 2 liters of water per day',
        },
        {
          categoria: '😴 Sleep',
          titulo: 'Adequate Rest',
          mensagem: 'Good sleep is crucial for recovery and heart health.',
          dica: 'Maintain regular sleep routine, 7-8 hours per night',
        },
        {
          categoria: '🧘 Stress',
          titulo: 'Control Stress',
          mensagem: 'High stress can negatively affect your heart health.',
          dica: 'Practice relaxation techniques like meditation or deep breathing',
        },
      ],
      nl: [
        {
          categoria: '💊 Medicijnen',
          titulo: 'Regelmaat is Essentieel',
          mensagem: 'Het innemen van uw medicijnen op de juiste tijden is essentieel voor het beheersen van uw hartaandoening.',
          dica: 'Stel telefoonalarmen in voor elke medicatietijd',
        },
        {
          categoria: '🏃 Oefening',
          titulo: 'Beweging is Leven',
          mensagem: 'Lichte, regelmatige oefening versterkt uw hart en verbetert uw levenskwaliteit.',
          dica: 'Begin met 10 minuten wandelen per dag en verhoog geleidelijk',
        },
        {
          categoria: '🥗 Voeding',
          titulo: 'Evenwichtige Voeding',
          mensagem: 'Een evenwichtig dieet helpt bloeddruk en cholesterol te beheersen.',
          dica: 'Verminder zout en verzadigde vetten, verhoog groenten en fruit',
        },
        {
          categoria: '💧 Hydratatie',
          titulo: 'Water is Essentieel',
          mensagem: 'Gehydrateerd blijven helpt de bloedcirculatie en hartfunctie.',
          dica: 'Drink minstens 2 liter water per dag',
        },
        {
          categoria: '😴 Slaap',
          titulo: 'Adequate Rust',
          mensagem: 'Goede slaap is cruciaal voor herstel en hartgezondheid.',
          dica: 'Handhaaf regelmatige slaaproutine, 7-8 uur per nacht',
        },
        {
          categoria: '🧘 Stress',
          titulo: 'Beheers Stress',
          mensagem: 'Hoge stress kan uw hartgezondheid negatief beïnvloeden.',
          dica: 'Oefen ontspanningstechnieken zoals meditatie of diepe ademhaling',
        },
      ],
      fr: [
        {
          categoria: '💊 Médicaments',
          titulo: 'La Régularité est Essentielle',
          mensagem: 'Prendre vos médicaments aux heures correctes est essentiel pour gérer votre condition cardiaque.',
          dica: 'Configurez des alarmes téléphoniques pour chaque heure de médication',
        },
        {
          categoria: '🏃 Exercice',
          titulo: 'Le Mouvement c\'est la Vie',
          mensagem: 'L\'exercice léger et régulier renforce votre cœur et améliore votre qualité de vie.',
          dica: 'Commencez avec 10 minutes de marche par jour et augmentez progressivement',
        },
        {
          categoria: '🥗 Nutrition',
          titulo: 'Nutrition Équilibrée',
          mensagem: 'Un régime équilibré aide à contrôler la pression artérielle et le cholestérol.',
          dica: 'Réduisez le sel et les graisses saturées, augmentez les légumes et les fruits',
        },
        {
          categoria: '💧 Hydratation',
          titulo: 'L\'Eau est Essentielle',
          mensagem: 'Rester hydraté aide à la circulation sanguine et à la fonction cardiaque.',
          dica: 'Buvez au moins 2 litres d\'eau par jour',
        },
        {
          categoria: '😴 Sommeil',
          titulo: 'Repos Adéquat',
          mensagem: 'Un bon sommeil est crucial pour la récupération et la santé cardiaque.',
          dica: 'Maintenez une routine de sommeil régulière, 7-8 heures par nuit',
        },
        {
          categoria: '🧘 Stress',
          titulo: 'Contrôlez le Stress',
          mensagem: 'Un stress élevé peut affecter négativement votre santé cardiaque.',
          dica: 'Pratiquez des techniques de relaxation comme la méditation ou la respiration profonde',
        },
      ],
      de: [
        {
          categoria: '💊 Medikamente',
          titulo: 'Regelmäßigkeit ist Entscheidend',
          mensagem: 'Die Einnahme Ihrer Medikamente zu den richtigen Zeiten ist entscheidend für die Kontrolle Ihrer Herzerkrankung.',
          dica: 'Stellen Sie Telefonalarme für jede Medikationszeit ein',
        },
        {
          categoria: '🏃 Übung',
          titulo: 'Bewegung ist Leben',
          mensagem: 'Leichte, regelmäßige Bewegung stärkt Ihr Herz und verbessert Ihre Lebensqualität.',
          dica: 'Beginnen Sie mit 10 Minuten Gehen pro Tag und steigern Sie allmählich',
        },
        {
          categoria: '🥗 Ernährung',
          titulo: 'Ausgewogene Ernährung',
          mensagem: 'Eine ausgewogene Ernährung hilft, Blutdruck und Cholesterin zu kontrollieren.',
          dica: 'Reduzieren Sie Salz und gesättigte Fette, erhöhen Sie Gemüse und Obst',
        },
        {
          categoria: '💧 Hydratation',
          titulo: 'Wasser ist Essentiell',
          mensagem: 'Hydratisiert zu bleiben hilft der Blutzirkulation und Herzfunktion.',
          dica: 'Trinken Sie mindestens 2 Liter Wasser pro Tag',
        },
        {
          categoria: '😴 Schlaf',
          titulo: 'Angemessene Ruhe',
          mensagem: 'Guter Schlaf ist entscheidend für Erholung und Herzgesundheit.',
          dica: 'Halten Sie eine regelmäßige Schlafroutine ein, 7-8 Stunden pro Nacht',
        },
        {
          categoria: '🧘 Stress',
          titulo: 'Stress Kontrollieren',
          mensagem: 'Hoher Stress kann Ihre Herzgesundheit negativ beeinflussen.',
          dica: 'Üben Sie Entspannungstechniken wie Meditation oder tiefes Atmen',
        },
      ],
    };

    return tipsData[language].map((tip, idx) => ({
      id: idx + 1,
      ...tip,
      prioridade: idx < 3 ? 'alta' : 'media',
    }));
  };

  // Adicionar campo de medicamento
  const addMedicationField = () => {
    setOnboardingData({
      ...onboardingData,
      medications: [...onboardingData.medications, ''],
    });
  };

  // Remover campo de medicamento
  const removeMedicationField = (index: number) => {
    const newMedications = onboardingData.medications.filter((_, i) => i !== index);
    setOnboardingData({
      ...onboardingData,
      medications: newMedications.length > 0 ? newMedications : [''],
    });
  };

  // Atualizar medicamento específico
  const updateMedicationField = (index: number, value: string) => {
    const newMedications = [...onboardingData.medications];
    newMedications[index] = value;
    setOnboardingData({
      ...onboardingData,
      medications: newMedications,
    });
  };

  // Finalizar onboarding
  const completeOnboarding = () => {
    const profile: UserProfile = {
      age: parseInt(onboardingData.age),
      weight: parseFloat(onboardingData.weight),
      height: parseFloat(onboardingData.height),
      medications: onboardingData.medications.filter(m => m.trim() !== ''),
      medicationCount: onboardingData.medications.filter(m => m.trim() !== '').length,
      plan: onboardingData.selectedPlan,
      onboardingCompleted: true,
    };

    saveUserProfile(profile);
    setUserProfile(profile);
    setShowOnboarding(false);
  };

  // Validação de step
  const canProceedToNextStep = () => {
    if (onboardingStep === 1) {
      return onboardingData.age && onboardingData.weight && onboardingData.height;
    }
    if (onboardingStep === 2) {
      return onboardingData.medications.some(m => m.trim() !== '');
    }
    if (onboardingStep === 3) {
      return onboardingData.medicationCount;
    }
    return true;
  };

  // Adicionar novo medicamento (após onboarding)
  const handleAddMedication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      dosage: formData.get('dosage') as string,
      frequency: formData.get('frequency') as string,
      times: (formData.get('times') as string).split(',').map(t => t.trim()),
      notes: formData.get('notes') as string || undefined,
      taken: [],
    };

    const updatedMedications = [...medications, newMedication];
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
    setIsAddMedicationOpen(false);
    e.currentTarget.reset();
  };

  // Marcar medicamento como tomado
  const markAsTaken = (medicationId: string) => {
    const now = new Date();
    const updatedMedications = medications.map(med => {
      if (med.id === medicationId) {
        return {
          ...med,
          taken: [
            ...med.taken,
            {
              date: now.toISOString().split('T')[0],
              time: now.toTimeString().split(' ')[0].substring(0, 5),
            },
          ],
        };
      }
      return med;
    });
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
  };

  // Verificar se medicamento foi tomado hoje
  const wasTakenToday = (medication: Medication) => {
    const today = new Date().toISOString().split('T')[0];
    return medication.taken.some(t => t.date === today);
  };

  // Deletar medicamento
  const deleteMedication = (medicationId: string) => {
    const updatedMedications = medications.filter(med => med.id !== medicationId);
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
  };

  // Marcar exercício como completo
  const markExerciseComplete = (exerciseId: number) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  // Enviar mensagem para o Coach AI
  const handleCoachMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachMessage.trim()) return;

    const newHistory = [...chatHistory, { role: 'user' as const, message: coachMessage }];
    setChatHistory(newHistory);

    setTimeout(() => {
      const responses = [
        'Great question! Based on your profile, I recommend focusing on low-impact exercises and maintaining medication regularity.',
        'Remember: consistency is more important than intensity. Small daily steps lead to great results!',
        'Your heart health is in good hands! Keep following the plan and don\'t hesitate to ask me anything.',
        'Important tip: monitor your blood pressure regularly and note the values. This helps a lot with medical follow-up.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatHistory([...newHistory, { role: 'assistant', message: randomResponse }]);
    }, 1000);

    setCoachMessage('');
  };

  // Analisar refeição
  const handleMealAnalysis = async () => {
    if (!mealDescription.trim() || isAnalyzing) return;

    setIsAnalyzing(true);

    // Simular análise (em produção, seria uma chamada real para API de IA)
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 60; // Score entre 60-90
      const calories = Math.floor(Math.random() * 400) + 400; // Calorias entre 400-800

      const positivePointsOptions: Record<Language, string[]> = {
        pt: [
          'Boa quantidade de proteínas',
          'Presença de vegetais',
          'Carboidratos complexos',
          'Baixo teor de gordura saturada',
          'Rica em fibras',
        ],
        en: [
          'Good amount of protein',
          'Presence of vegetables',
          'Complex carbohydrates',
          'Low saturated fat content',
          'Rich in fiber',
        ],
        nl: [
          'Goede hoeveelheid eiwitten',
          'Aanwezigheid van groenten',
          'Complexe koolhydraten',
          'Laag verzadigd vetgehalte',
          'Rijk aan vezels',
        ],
        fr: [
          'Bonne quantité de protéines',
          'Présence de légumes',
          'Glucides complexes',
          'Faible teneur en graisses saturées',
          'Riche en fibres',
        ],
        de: [
          'Gute Proteinmenge',
          'Vorhandensein von Gemüse',
          'Komplexe Kohlenhydrate',
          'Niedriger Gehalt an gesättigten Fettsäuren',
          'Reich an Ballaststoffen',
        ],
      };

      const improvementsOptions: Record<Language, string[]> = {
        pt: [
          'Reduza o sal',
          'Adicione mais vegetais verdes',
          'Evite frituras',
          'Prefira grãos integrais',
          'Reduza açúcar',
        ],
        en: [
          'Reduce salt',
          'Add more green vegetables',
          'Avoid fried foods',
          'Prefer whole grains',
          'Reduce sugar',
        ],
        nl: [
          'Verminder zout',
          'Voeg meer groene groenten toe',
          'Vermijd gefrituurde gerechten',
          'Geef de voorkeur aan volkoren granen',
          'Verminder suiker',
        ],
        fr: [
          'Réduisez le sel',
          'Ajoutez plus de légumes verts',
          'Évitez les fritures',
          'Préférez les grains entiers',
          'Réduisez le sucre',
        ],
        de: [
          'Salz reduzieren',
          'Mehr grünes Gemüse hinzufügen',
          'Frittierte Speisen vermeiden',
          'Vollkornprodukte bevorzugen',
          'Zucker reduzieren',
        ],
      };

      const recommendationsOptions: Record<Language, string[]> = {
        pt: [
          'Beba mais água durante o dia',
          'Adicione uma porção de frutas',
          'Inclua mais fibras na próxima refeição',
        ],
        en: [
          'Drink more water during the day',
          'Add a serving of fruit',
          'Include more fiber in the next meal',
        ],
        nl: [
          'Drink meer water gedurende de dag',
          'Voeg een portie fruit toe',
          'Neem meer vezels op in de volgende maaltijd',
        ],
        fr: [
          'Buvez plus d\'eau pendant la journée',
          'Ajoutez une portion de fruits',
          'Incluez plus de fibres dans le prochain repas',
        ],
        de: [
          'Trinken Sie tagsüber mehr Wasser',
          'Fügen Sie eine Portion Obst hinzu',
          'Nehmen Sie mehr Ballaststoffe in die nächste Mahlzeit auf',
        ],
      };

      const analysis: MealAnalysis = {
        id: Date.now().toString(),
        mealDescription: mealDescription,
        score,
        estimatedCalories: calories,
        positivePoints: positivePointsOptions[language].slice(0, 3),
        improvements: improvementsOptions[language].slice(0, 2),
        recommendations: recommendationsOptions[language],
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      };

      saveMealAnalysis(analysis);
      setMealAnalyses([analysis, ...mealAnalyses]);
      setMealDescription('');
      setIsAnalyzing(false);
    }, 2000);
  };

  // Deletar análise de refeição
  const handleDeleteMealAnalysis = (analysisId: string) => {
    deleteMealAnalysis(analysisId);
    setMealAnalyses(mealAnalyses.filter(a => a.id !== analysisId));
  };

  // Verificar se feature está disponível no plano
  const hasFeatureAccess = (feature: 'medications' | 'exercises' | 'diet' | 'coach' | 'mealAnalysis') => {
    if (!userProfile) return false;
    if (feature === 'medications') return true;
    if (feature === 'mealAnalysis') return userProfile.plan === 'premium' || userProfile.plan === 'elite';
    return userProfile.plan === 'premium' || userProfile.plan === 'elite';
  };

  // Alterar plano do usuário
  const handleChangePlan = (newPlan: 'essencial' | 'premium' | 'elite') => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      plan: newPlan,
    };
    
    saveUserProfile(updatedProfile);
    setUserProfile(updatedProfile);
    setIsUpgradeDialogOpen(false);
  };

  // Renderizar onboarding
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 rounded-2xl">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {t.appName}
            </CardTitle>
            <CardDescription className="text-base">
              {t.appTagline}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step <= onboardingStep
                      ? 'bg-gradient-to-r from-red-500 to-pink-600'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Dados Pessoais */}
            {onboardingStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{t.onboarding.step1Title}</h3>
                  <p className="text-gray-600">{t.onboarding.step1Subtitle}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base">{t.onboarding.age}</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder={t.onboarding.agePlaceholder}
                      value={onboardingData.age}
                      onChange={(e) => setOnboardingData({ ...onboardingData, age: e.target.value })}
                      className="text-lg h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-base">{t.onboarding.weight}</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder={t.onboarding.weightPlaceholder}
                        value={onboardingData.weight}
                        onChange={(e) => setOnboardingData({ ...onboardingData, weight: e.target.value })}
                        className="text-lg h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-base">{t.onboarding.height}</Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder={t.onboarding.heightPlaceholder}
                        value={onboardingData.height}
                        onChange={(e) => setOnboardingData({ ...onboardingData, height: e.target.value })}
                        className="text-lg h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medicamentos */}
            {onboardingStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{t.onboarding.step2Title}</h3>
                  <p className="text-gray-600">{t.onboarding.step2Subtitle}</p>
                </div>

                <div className="space-y-3">
                  {onboardingData.medications.map((med, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`${t.onboarding.medicationPlaceholder} ${index + 1}`}
                        value={med}
                        onChange={(e) => updateMedicationField(index, e.target.value)}
                        className="text-base h-12"
                      />
                      {onboardingData.medications.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeMedicationField(index)}
                          className="h-12 px-3"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedicationField}
                    className="w-full h-12 border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.onboarding.addMedication}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>{t.common.tip}:</strong> {t.onboarding.medicationTip}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Quantidade de Medicamentos */}
            {onboardingStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {language === 'pt' ? 'Quantos medicamentos você toma?' :
                     language === 'en' ? 'How many medications do you take?' :
                     language === 'nl' ? 'Hoeveel medicijnen neemt u?' :
                     language === 'fr' ? 'Combien de médicaments prenez-vous?' :
                     'Wie viele Medikamente nehmen Sie?'}
                  </h3>
                  <p className="text-gray-600">
                    {language === 'pt' ? 'Isso nos ajuda a personalizar suas recomendações' :
                     language === 'en' ? 'This helps us personalize your recommendations' :
                     language === 'nl' ? 'Dit helpt ons uw aanbevelingen te personaliseren' :
                     language === 'fr' ? 'Cela nous aide à personnaliser vos recommandations' :
                     'Dies hilft uns, Ihre Empfehlungen zu personalisieren'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {['1-2', '3-5', '6+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setOnboardingData({ ...onboardingData, medicationCount: range })}
                      className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                        onboardingData.medicationCount === range
                          ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">💊</div>
                      <div className="text-2xl font-bold text-gray-900">{range}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {language === 'pt' ? 'medicamentos' :
                         language === 'en' ? 'medications' :
                         language === 'nl' ? 'medicijnen' :
                         language === 'fr' ? 'médicaments' :
                         'Medikamente'}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ⚕️ <strong>
                      {language === 'pt' ? 'Importante' :
                       language === 'en' ? 'Important' :
                       language === 'nl' ? 'Belangrijk' :
                       language === 'fr' ? 'Important' :
                       'Wichtig'}:
                    </strong>{' '}
                    {language === 'pt' ? 'Sempre consulte seu médico antes de fazer mudanças na medicação' :
                     language === 'en' ? 'Always consult your doctor before making changes to medication' :
                     language === 'nl' ? 'Raadpleeg altijd uw arts voordat u wijzigingen aanbrengt in medicatie' :
                     language === 'fr' ? 'Consultez toujours votre médecin avant de modifier les médicaments' :
                     'Konsultieren Sie immer Ihren Arzt, bevor Sie Änderungen an Medikamenten vornehmen'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Seleção de Plano */}
            {onboardingStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{t.onboarding.step3Title}</h3>
                  <p className="text-gray-600">{t.onboarding.step3Subtitle}</p>
                </div>

                {/* Language Selector - DISCRETO NO CANTO */}
                <div className="flex justify-end">
                  <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs border-gray-300">
                      <Globe className="w-3 h-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">🇧🇷 PT</SelectItem>
                      <SelectItem value="en">🇺🇸 EN</SelectItem>
                      <SelectItem value="nl">🇳🇱 NL</SelectItem>
                      <SelectItem value="fr">🇫🇷 FR</SelectItem>
                      <SelectItem value="de">🇩🇪 DE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setOnboardingData({ ...onboardingData, selectedPlan: plan.id })}
                      className={`relative cursor-pointer rounded-xl border-2 transition-all hover:shadow-lg ${
                        onboardingData.selectedPlan === plan.id
                          ? 'border-red-500 shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.highlighted ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                    >
                      {plan.highlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {t.onboarding.mostPopular}
                          </Badge>
                        </div>
                      )}

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {plan.id === 'essencial' && <Shield className="w-5 h-5 text-gray-600" />}
                              {plan.id === 'premium' && <Sparkles className="w-5 h-5 text-purple-600" />}
                              {plan.id === 'elite' && <Crown className="w-5 h-5 text-amber-600" />}
                              <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{plan.tagline}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {plan.price === 0 ? t.common.free : formatPrice(plan.price)}
                            </div>
                            <div className="text-xs text-gray-600">{plan.period}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {onboardingData.selectedPlan === plan.id && (
                          <div className="pt-2">
                            <Badge className="bg-green-500 w-full justify-center py-2">
                              <Check className="w-4 h-4 mr-1" />
                              {t.onboarding.planSelected}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    💰 <strong>{PLANS[2].name}:</strong> {t.onboarding.eliteTip}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {onboardingStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="flex-1 h-12"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t.onboarding.back}
                </Button>
              )}

              {onboardingStep < 4 ? (
                <Button
                  onClick={() => setOnboardingStep(onboardingStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 to-pink-600"
                >
                  {t.onboarding.continue}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={completeOnboarding}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 to-pink-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {t.onboarding.startNow}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // App principal (após onboarding)
  const exercises = userProfile ? getPersonalizedExercises(userProfile.weight, userProfile.age) : [];
  const dietPlan = userProfile ? getPersonalizedDiet(userProfile.weight, userProfile.height, userProfile.age) : null;
  const coachTips = userProfile ? getCoachTips(userProfile.weight, userProfile.age, userProfile.medicationCount) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-red-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-2 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.appName}</h1>
                <p className="text-sm text-gray-600">{t.appTagline}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Seletor de língua DISCRETO */}
              <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
                <SelectTrigger className="w-[90px] h-9 text-xs border-gray-300">
                  <Globe className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">🇧🇷 PT</SelectItem>
                  <SelectItem value="en">🇺🇸 EN</SelectItem>
                  <SelectItem value="nl">🇳🇱 NL</SelectItem>
                  <SelectItem value="fr">🇫🇷 FR</SelectItem>
                  <SelectItem value="de">🇩🇪 DE</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setIsUpgradeDialogOpen(true)}
                className={`bg-gradient-to-r ${PLANS.find(p => p.id === userProfile?.plan)?.color} h-9 px-3 flex items-center text-xs`}
              >
                {PLANS.find(p => p.id === userProfile?.plan)?.name}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dialog de Alteração de Plano */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {language === 'pt' ? 'Alterar Plano' :
               language === 'en' ? 'Change Plan' :
               language === 'nl' ? 'Plan Wijzigen' :
               language === 'fr' ? 'Changer de Plan' :
               'Plan Ändern'}
            </DialogTitle>
            <DialogDescription>
              {language === 'pt' ? 'Escolha o plano que melhor atende suas necessidades' :
               language === 'en' ? 'Choose the plan that best suits your needs' :
               language === 'nl' ? 'Kies het plan dat het beste bij uw behoeften past' :
               language === 'fr' ? 'Choisissez le plan qui correspond le mieux à vos besoins' :
               'Wählen Sie den Plan, der Ihren Bedürfnissen am besten entspricht'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleChangePlan(plan.id)}
                className={`relative cursor-pointer rounded-xl border-2 transition-all hover:shadow-lg ${
                  userProfile?.plan === plan.id
                    ? 'border-red-500 bg-red-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.highlighted ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t.onboarding.mostPopular}
                    </Badge>
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {plan.id === 'essencial' && <Shield className="w-5 h-5 text-gray-600" />}
                        {plan.id === 'premium' && <Sparkles className="w-5 h-5 text-purple-600" />}
                        {plan.id === 'elite' && <Crown className="w-5 h-5 text-amber-600" />}
                        <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{plan.tagline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {plan.price === 0 ? t.common.free : formatPrice(plan.price)}
                      </div>
                      <div className="text-xs text-gray-600">{plan.period}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {userProfile?.plan === plan.id && (
                    <div className="pt-2">
                      <Badge className="bg-green-500 w-full justify-center py-2">
                        <Check className="w-4 h-4 mr-1" />
                        {language === 'pt' ? 'Plano Atual' :
                         language === 'en' ? 'Current Plan' :
                         language === 'nl' ? 'Huidig Plan' :
                         language === 'fr' ? 'Plan Actuel' :
                         'Aktueller Plan'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-sm h-auto">
            <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Heart className="w-5 h-5" />
              <span className="text-xs font-medium">{t.nav.home}</span>
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-red-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              <Pill className="w-5 h-5" />
              <span className="text-xs font-medium">{t.nav.medications}</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white" disabled={!hasFeatureAccess('exercises')}>
              <Activity className="w-5 h-5" />
              <span className="text-xs font-medium">{t.nav.exercises}</span>
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white" disabled={!hasFeatureAccess('diet')}>
              <Utensils className="w-5 h-5" />
              <span className="text-xs font-medium">{t.nav.diet}</span>
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white" disabled={!hasFeatureAccess('coach')}>
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs font-medium">{t.nav.coach}</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Pill className="w-4 h-4" />
                    {t.dashboard.medicationsToday}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{medications.length}</div>
                  <p className="text-xs text-red-100 mt-1">
                    {medications.filter(m => wasTakenToday(m)).length} {t.dashboard.taken}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {t.dashboard.exercises}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedExercises.length}</div>
                  <p className="text-xs text-blue-100 mt-1">{t.dashboard.completedToday}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    {t.dashboard.caloriesGoal}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dietPlan?.caloriasDiarias || 0}</div>
                  <p className="text-xs text-green-100 mt-1">{t.dashboard.caloriesPerDay}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {t.dashboard.bmi}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dietPlan?.imc || 0}</div>
                  <p className="text-xs text-purple-100 mt-1">{dietPlan?.status || t.dashboard.calculating}</p>
                </CardContent>
              </Card>
            </div>

            {/* Próximos Remédios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  {t.dashboard.nextMedications}
                </CardTitle>
                <CardDescription>{t.dashboard.medicationsForToday}</CardDescription>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t.dashboard.noMedications}</p>
                    <Button 
                      onClick={() => setActiveTab('medications')} 
                      className="mt-4 bg-gradient-to-r from-red-500 to-pink-600"
                    >
                      {t.dashboard.addFirstMedication}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medications.map(med => (
                      <div 
                        key={med.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          wasTakenToday(med) 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{med.name}</h4>
                          <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                          <div className="flex gap-2 mt-1">
                            {med.times.map((time, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {wasTakenToday(med) ? (
                          <Badge className="bg-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            {t.dashboard.taken}
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => markAsTaken(med.id)}
                            className="bg-gradient-to-r from-red-500 to-pink-600"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {t.dashboard.mark}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.medications.title}</h2>
                <p className="text-gray-600">{t.medications.subtitle}</p>
              </div>
              <Dialog open={isAddMedicationOpen} onOpenChange={setIsAddMedicationOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-500 to-pink-600">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.medications.addMedication}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{t.medications.addNew}</DialogTitle>
                    <DialogDescription>
                      {t.medications.fillInfo}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMedication} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.medications.name}</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder={t.medications.namePlaceholder}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">{t.medications.dosage}</Label>
                      <Input 
                        id="dosage" 
                        name="dosage" 
                        placeholder={t.medications.dosagePlaceholder}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">{t.medications.frequency}</Label>
                      <Input 
                        id="frequency" 
                        name="frequency" 
                        placeholder={t.medications.frequencyPlaceholder}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="times">{t.medications.times}</Label>
                      <Input 
                        id="times" 
                        name="times" 
                        placeholder={t.medications.timesPlaceholder}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t.medications.notes}</Label>
                      <Textarea 
                        id="notes" 
                        name="notes" 
                        placeholder={t.medications.notesPlaceholder}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600"
                    >
                      {t.medications.save}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {medications.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t.medications.noMedicationsYet}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {t.medications.noMedicationsDescription}
                  </p>
                  <Button 
                    onClick={() => setIsAddMedicationOpen(true)}
                    className="bg-gradient-to-r from-red-500 to-pink-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t.dashboard.addFirstMedication}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {medications.map(med => (
                  <Card key={med.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{med.name}</CardTitle>
                          <CardDescription>{med.dosage}</CardDescription>
                        </div>
                        {wasTakenToday(med) && (
                          <Badge className="bg-green-500">
                            <Check className="w-3 h-3 mr-1" />
                            {t.medications.takenToday}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t.medications.frequency}</p>
                        <p className="text-sm text-gray-600">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">{t.medications.times}</p>
                        <div className="flex flex-wrap gap-2">
                          {med.times.map((time, idx) => (
                            <Badge key={idx} variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {med.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">{t.medications.notes}</p>
                          <p className="text-sm text-gray-600">{med.notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => markAsTaken(med.id)}
                          disabled={wasTakenToday(med)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {wasTakenToday(med) ? t.medications.alreadyTaken : t.medications.markAsTaken}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => deleteMedication(med.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          {t.medications.remove}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            {!hasFeatureAccess('exercises') ? (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Crown className="w-16 h-16 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'pt' ? 'Recurso Premium' :
                     language === 'en' ? 'Premium Feature' :
                     language === 'nl' ? 'Premium Functie' :
                     language === 'fr' ? 'Fonctionnalité Premium' :
                     'Premium-Funktion'}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {language === 'pt' ? 'Faça upgrade para acessar exercícios personalizados' :
                     language === 'en' ? 'Upgrade to access personalized exercises' :
                     language === 'nl' ? 'Upgrade om toegang te krijgen tot gepersonaliseerde oefeningen' :
                     language === 'fr' ? 'Mettez à niveau pour accéder aux exercices personnalisés' :
                     'Upgrade für personalisierten Übungszugang'}
                  </p>
                  <Button 
                    onClick={() => setIsUpgradeDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {language === 'pt' ? 'Fazer Upgrade' :
                     language === 'en' ? 'Upgrade Now' :
                     language === 'nl' ? 'Nu Upgraden' :
                     language === 'fr' ? 'Mettre à Niveau' :
                     'Jetzt Upgraden'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.exercises.title}</h2>
                  <p className="text-gray-600">{t.exercises.subtitle}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {exercises.map((exercise) => (
                    <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{exercise.icon}</div>
                            <div>
                              <CardTitle className="text-lg">{exercise.name}</CardTitle>
                              <CardDescription>{exercise.description}</CardDescription>
                            </div>
                          </div>
                          {exercise.recommended && (
                            <Badge className="bg-blue-500">
                              {t.exercises.recommended}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <Timer className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                            <div className="text-sm font-semibold text-gray-900">{exercise.duration}</div>
                            <div className="text-xs text-gray-600">{t.exercises.duration}</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <Target className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                            <div className="text-sm font-semibold text-gray-900">{exercise.intensity}</div>
                            <div className="text-xs text-gray-600">{t.exercises.intensity}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3">
                            <Activity className="w-5 h-5 mx-auto mb-1 text-green-600" />
                            <div className="text-sm font-semibold text-gray-900">{exercise.calories}</div>
                            <div className="text-xs text-gray-600">{t.exercises.calories}</div>
                          </div>
                        </div>

                        <Button
                          onClick={() => markExerciseComplete(exercise.id)}
                          disabled={completedExercises.includes(exercise.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-600"
                        >
                          {completedExercises.includes(exercise.id) ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              {t.exercises.completed}
                            </>
                          ) : (
                            <>
                              <Dumbbell className="w-4 h-4 mr-2" />
                              {t.exercises.markComplete}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Diet Tab */}
          <TabsContent value="diet" className="space-y-6">
            {!hasFeatureAccess('diet') ? (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Crown className="w-16 h-16 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'pt' ? 'Recurso Premium' :
                     language === 'en' ? 'Premium Feature' :
                     language === 'nl' ? 'Premium Functie' :
                     language === 'fr' ? 'Fonctionnalité Premium' :
                     'Premium-Funktion'}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {language === 'pt' ? 'Faça upgrade para acessar plano de dieta personalizado' :
                     language === 'en' ? 'Upgrade to access personalized diet plan' :
                     language === 'nl' ? 'Upgrade om toegang te krijgen tot gepersonaliseerd dieetplan' :
                     language === 'fr' ? 'Mettez à niveau pour accéder au plan alimentaire personnalisé' :
                     'Upgrade für personalisierten Ernährungsplan'}
                  </p>
                  <Button 
                    onClick={() => setIsUpgradeDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {language === 'pt' ? 'Fazer Upgrade' :
                     language === 'en' ? 'Upgrade Now' :
                     language === 'nl' ? 'Nu Upgraden' :
                     language === 'fr' ? 'Mettre à Niveau' :
                     'Jetzt Upgraden'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.diet.title}</h2>
                  <p className="text-gray-600">{t.diet.subtitle}</p>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {t.diet.dailyGoal}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dietPlan?.caloriasDiarias}</div>
                      <p className="text-xs text-green-100 mt-1">{t.diet.caloriesPerDay}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {t.diet.yourBMI}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{dietPlan?.imc}</div>
                      <p className="text-xs text-blue-100 mt-1">{dietPlan?.status}</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        {t.diet.meals}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">5-6</div>
                      <p className="text-xs text-purple-100 mt-1">{t.diet.mealsPerDay}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Analisador de Refeições - PREMIUM */}
                {hasFeatureAccess('mealAnalysis') && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        {language === 'pt' ? 'Analisador de Refeições AI' : 
                         language === 'en' ? 'AI Meal Analyzer' :
                         language === 'nl' ? 'AI Maaltijdanalyse' :
                         language === 'fr' ? 'Analyseur de Repas IA' :
                         'KI-Mahlzeitenanalyse'}
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                          Premium
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {language === 'pt' ? 'Descreva o que você comeu e receba uma análise completa da sua refeição' :
                         language === 'en' ? 'Describe what you ate and receive a complete analysis of your meal' :
                         language === 'nl' ? 'Beschrijf wat je hebt gegeten en ontvang een volledige analyse van je maaltijd' :
                         language === 'fr' ? 'Décrivez ce que vous avez mangé et recevez une analyse complète de votre repas' :
                         'Beschreiben Sie, was Sie gegessen haben, und erhalten Sie eine vollständige Analyse Ihrer Mahlzeit'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder={language === 'pt' ? 'Ex: Arroz, feijão, frango grelhado e salada...' :
                                     language === 'en' ? 'Ex: Rice, beans, grilled chicken and salad...' :
                                     language === 'nl' ? 'Bijv: Rijst, bonen, gegrilde kip en salade...' :
                                     language === 'fr' ? 'Ex: Riz, haricots, poulet grillé et salade...' :
                                     'Z.B: Reis, Bohnen, gegrilltes Hähnchen und Salat...'}
                          value={mealDescription}
                          onChange={(e) => setMealDescription(e.target.value)}
                          className="flex-1 min-h-[100px]"
                        />
                      </div>
                      <Button
                        onClick={handleMealAnalysis}
                        disabled={!mealDescription.trim() || isAnalyzing}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            {language === 'pt' ? 'Analisando...' :
                             language === 'en' ? 'Analyzing...' :
                             language === 'nl' ? 'Analyseren...' :
                             language === 'fr' ? 'Analyse...' :
                             'Analysieren...'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {language === 'pt' ? 'Analisar Refeição' :
                             language === 'en' ? 'Analyze Meal' :
                             language === 'nl' ? 'Maaltijd Analyseren' :
                             language === 'fr' ? 'Analyser le Repas' :
                             'Mahlzeit Analysieren'}
                          </>
                        )}
                      </Button>

                      {/* Histórico de Análises */}
                      {mealAnalyses.length > 0 && (
                        <div className="space-y-3 mt-6">
                          <h4 className="font-semibold text-gray-900">
                            {language === 'pt' ? 'Análises Recentes' :
                             language === 'en' ? 'Recent Analyses' :
                             language === 'nl' ? 'Recente Analyses' :
                             language === 'fr' ? 'Analyses Récentes' :
                             'Neueste Analysen'}
                          </h4>
                          {mealAnalyses.map((analysis) => (
                            <Card key={analysis.id} className="border-2 border-gray-200">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <CardTitle className="text-base">{analysis.mealDescription}</CardTitle>
                                    <CardDescription className="text-xs">
                                      {new Date(analysis.timestamp).toLocaleDateString(language)}
                                    </CardDescription>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMealAnalysis(analysis.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Score Visual */}
                                <div className="flex items-center gap-4">
                                  <div className="relative w-20 h-20">
                                    <svg className="w-20 h-20 transform -rotate-90">
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        fill="none"
                                      />
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke={analysis.score >= 80 ? '#10b981' : analysis.score >= 60 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(analysis.score / 100) * 201} 201`}
                                        strokeLinecap="round"
                                      />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-xl font-bold text-gray-900">{analysis.score}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Star className={`w-5 h-5 ${analysis.score >= 80 ? 'text-green-500' : analysis.score >= 60 ? 'text-amber-500' : 'text-red-500'}`} />
                                      <span className="font-semibold text-gray-900">
                                        {analysis.score >= 80 ? (language === 'pt' ? 'Excelente!' : language === 'en' ? 'Excellent!' : language === 'nl' ? 'Uitstekend!' : language === 'fr' ? 'Excellent!' : 'Ausgezeichnet!') :
                                         analysis.score >= 60 ? (language === 'pt' ? 'Bom' : language === 'en' ? 'Good' : language === 'nl' ? 'Goed' : language === 'fr' ? 'Bon' : 'Gut') :
                                         (language === 'pt' ? 'Pode Melhorar' : language === 'en' ? 'Can Improve' : language === 'nl' ? 'Kan Verbeteren' : language === 'fr' ? 'Peut Améliorer' : 'Kann Verbessern')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {language === 'pt' ? `~${analysis.estimatedCalories} calorias` :
                                       language === 'en' ? `~${analysis.estimatedCalories} calories` :
                                       language === 'nl' ? `~${analysis.estimatedCalories} calorieën` :
                                       language === 'fr' ? `~${analysis.estimatedCalories} calories` :
                                       `~${analysis.estimatedCalories} Kalorien`}
                                    </p>
                                  </div>
                                </div>

                                {/* Pontos Positivos */}
                                <div className="space-y-2">
                                  <h5 className="text-sm font-semibold text-green-700 flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    {language === 'pt' ? 'Pontos Positivos' :
                                     language === 'en' ? 'Positive Points' :
                                     language === 'nl' ? 'Positieve Punten' :
                                     language === 'fr' ? 'Points Positifs' :
                                     'Positive Punkte'}
                                  </h5>
                                  <ul className="space-y-1">
                                    {analysis.positivePoints.map((point, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Melhorias */}
                                <div className="space-y-2">
                                  <h5 className="text-sm font-semibold text-amber-700 flex items-center gap-1">
                                    <TrendingDown className="w-4 h-4" />
                                    {language === 'pt' ? 'Pode Melhorar' :
                                     language === 'en' ? 'Can Improve' :
                                     language === 'nl' ? 'Kan Verbeteren' :
                                     language === 'fr' ? 'Peut Améliorer' :
                                     'Kann Verbessern'}
                                  </h5>
                                  <ul className="space-y-1">
                                    {analysis.improvements.map((improvement, idx) => (
                                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <Minus className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span>{improvement}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {/* Recomendações */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <h5 className="text-sm font-semibold text-blue-900 mb-2">
                                    💡 {language === 'pt' ? 'Recomendações' :
                                        language === 'en' ? 'Recommendations' :
                                        language === 'nl' ? 'Aanbevelingen' :
                                        language === 'fr' ? 'Recommandations' :
                                        'Empfehlungen'}
                                  </h5>
                                  <ul className="space-y-1">
                                    {analysis.recommendations.map((rec, idx) => (
                                      <li key={idx} className="text-xs text-blue-800">• {rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recomendações de Refeições */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-green-600" />
                      {t.diet.recommendations}
                    </CardTitle>
                    <CardDescription>{t.diet.recommendationsSubtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        { icon: '🥗', title: t.diet.breakfast, desc: t.diet.breakfastDesc },
                        { icon: '🍎', title: t.diet.morningSnack, desc: t.diet.morningSnackDesc },
                        { icon: '🍗', title: t.diet.lunch, desc: t.diet.lunchDesc },
                        { icon: '🥤', title: t.diet.afternoonSnack, desc: t.diet.afternoonSnackDesc },
                        { icon: '🐟', title: t.diet.dinner, desc: t.diet.dinnerDesc },
                      ].map((meal, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="text-3xl">{meal.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{meal.title}</h4>
                            <p className="text-sm text-gray-600">{meal.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <p className="text-sm text-blue-800">
                        💧 <strong>{t.diet.hydration}:</strong> {t.diet.hydrationTip}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Coach Tab */}
          <TabsContent value="coach" className="space-y-6">
            {!hasFeatureAccess('coach') ? (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Crown className="w-16 h-16 text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {language === 'pt' ? 'Recurso Premium' :
                     language === 'en' ? 'Premium Feature' :
                     language === 'nl' ? 'Premium Functie' :
                     language === 'fr' ? 'Fonctionnalité Premium' :
                     'Premium-Funktion'}
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    {language === 'pt' ? 'Faça upgrade para conversar com seu Coach AI' :
                     language === 'en' ? 'Upgrade to chat with your AI Coach' :
                     language === 'nl' ? 'Upgrade om te chatten met uw AI Coach' :
                     language === 'fr' ? 'Mettez à niveau pour discuter avec votre Coach IA' :
                     'Upgrade um mit Ihrem KI-Coach zu chatten'}
                  </p>
                  <Button 
                    onClick={() => setIsUpgradeDialogOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {language === 'pt' ? 'Fazer Upgrade' :
                     language === 'en' ? 'Upgrade Now' :
                     language === 'nl' ? 'Nu Upgraden' :
                     language === 'fr' ? 'Mettre à Niveau' :
                     'Jetzt Upgraden'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.coach.title}</h2>
                  <p className="text-gray-600">{t.coach.subtitle}</p>
                </div>

                {/* DICAS DO COACH */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {coachTips.map((tip) => (
                    <Card key={tip.id} className="hover:shadow-lg transition-shadow border-2 border-purple-100">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="text-2xl">{tip.categoria.split(' ')[0]}</span>
                          <span className="text-gray-900">{tip.categoria.split(' ').slice(1).join(' ')}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 text-sm">{tip.titulo}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{tip.mensagem}</p>
                        </div>
                        <div className="pt-3 border-t border-purple-100 bg-purple-50 rounded-lg p-3 -mx-3">
                          <p className="text-xs font-medium text-purple-900">
                            <span className="text-base mr-1">💡</span>
                            <strong>
                              {language === 'pt' ? 'Dica' :
                               language === 'en' ? 'Tip' :
                               language === 'nl' ? 'Tip' :
                               language === 'fr' ? 'Conseil' :
                               'Tipp'}:
                            </strong> {tip.dica}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                      {t.coach.chatTitle}
                    </CardTitle>
                    <CardDescription>{t.coach.chatSubtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-[400px] overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
                      {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <MessageCircle className="w-12 h-12 mb-3" />
                          <p className="text-sm">{t.coach.startConversation}</p>
                        </div>
                      ) : (
                        chatHistory.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.role === 'user'
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleCoachMessage} className="flex gap-2">
                      <Input
                        value={coachMessage}
                        onChange={(e) => setCoachMessage(e.target.value)}
                        placeholder={t.coach.messagePlaceholder}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        disabled={!coachMessage.trim()}
                        className="bg-gradient-to-r from-purple-500 to-pink-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
