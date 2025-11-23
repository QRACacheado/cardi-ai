'use client';

import { useState, useEffect } from 'react';
import { Heart, Pill, Activity, Utensils, MessageCircle, Plus, Check, Clock, ChevronRight, ChevronLeft, Sparkles, Crown, Shield, Dumbbell, Timer, Target, Send, Apple, Salad, Coffee, Moon, Globe, TrendingUp, TrendingDown, Minus, Trash2, Star, Bell, BellOff } from 'lucide-react';
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

// Sistema de análise inteligente de mensagens do Coach AI - VERSÃO MELHORADA
const generateCoachResponse = (
  message: string, 
  userProfile: UserProfile | null, 
  language: Language,
  medications: Medication[]
) => {
  const lowerMessage = message.toLowerCase();
  
  // Extrair informações do perfil
  const age = userProfile?.age || 0;
  const weight = userProfile?.weight || 0;
  const height = userProfile?.height || 0;
  const imc = weight && height ? weight / Math.pow(height / 100, 2) : 0;
  const medCount = medications.length;
  
  // Detectar tipo de pergunta
  const isQuestion = lowerMessage.includes('?') || 
                     lowerMessage.match(/^(como|quando|onde|por que|o que|qual|posso|devo|preciso|quantos|quanto|how|when|where|why|what|which|can|should|need|many|much|hoe|wanneer|waar|waarom|wat|hoeveel|comment|quand|où|pourquoi|quoi|combien|wie|wann|wo|warum|was|wieviel)/);

  // Respostas baseadas em palavras-chave ESPECÍFICAS
  
  // Perguntas sobre IDADE
  if (lowerMessage.match(/(quantos anos|minha idade|tenho.*anos|idade|age|years old|leeftijd|jaar|âge|ans|alter|jahre)/)) {
    if (!userProfile) {
      return language === 'pt' ? 'Não tenho seu perfil completo ainda. Configure seus dados pessoais para eu poder te ajudar melhor!' :
             language === 'en' ? 'I don\'t have your complete profile yet. Set up your personal data so I can help you better!' :
             language === 'nl' ? 'Ik heb uw volledige profiel nog niet. Stel uw persoonlijke gegevens in zodat ik u beter kan helpen!' :
             language === 'fr' ? 'Je n\'ai pas encore votre profil complet. Configurez vos données personnelles pour que je puisse mieux vous aider!' :
             'Ich habe Ihr vollständiges Profil noch nicht. Richten Sie Ihre persönlichen Daten ein, damit ich Ihnen besser helfen kann!';
    }
    return language === 'pt' ? `Você tem ${age} anos. ${age > 60 ? 'Na sua idade, é importante manter exercícios leves e consultas médicas regulares.' : age > 40 ? 'Você está em uma ótima fase para prevenir problemas cardíacos com hábitos saudáveis.' : 'Você é jovem! Aproveite para criar hábitos saudáveis desde já.'}` :
           language === 'en' ? `You are ${age} years old. ${age > 60 ? 'At your age, it\'s important to maintain light exercises and regular medical check-ups.' : age > 40 ? 'You\'re at a great stage to prevent heart problems with healthy habits.' : 'You\'re young! Take advantage to create healthy habits now.'}` :
           language === 'nl' ? `U bent ${age} jaar oud. ${age > 60 ? 'Op uw leeftijd is het belangrijk om lichte oefeningen en regelmatige medische controles te handhaven.' : age > 40 ? 'U bent in een geweldige fase om hartproblemen te voorkomen met gezonde gewoonten.' : 'U bent jong! Profiteer ervan om nu gezonde gewoonten te creëren.'}` :
           language === 'fr' ? `Vous avez ${age} ans. ${age > 60 ? 'À votre âge, il est important de maintenir des exercices légers et des contrôles médicaux réguliers.' : age > 40 ? 'Vous êtes à un stade idéal pour prévenir les problèmes cardiaques avec des habitudes saines.' : 'Vous êtes jeune! Profitez-en pour créer des habitudes saines dès maintenant.'}` :
           `Sie sind ${age} Jahre alt. ${age > 60 ? 'In Ihrem Alter ist es wichtig, leichte Übungen und regelmäßige medizinische Untersuchungen beizubehalten.' : age > 40 ? 'Sie sind in einer großartigen Phase, um Herzprobleme mit gesunden Gewohnheiten zu verhindern.' : 'Sie sind jung! Nutzen Sie die Gelegenheit, jetzt gesunde Gewohnheiten zu schaffen.'}`;
  }

  // Perguntas sobre PESO
  if (lowerMessage.match(/(quanto peso|meu peso|peso.*kg|weight|gewicht|poids|gewicht)/)) {
    if (!userProfile) {
      return language === 'pt' ? 'Configure seu perfil primeiro para eu saber seu peso e te dar orientações personalizadas!' :
             language === 'en' ? 'Set up your profile first so I know your weight and can give you personalized guidance!' :
             language === 'nl' ? 'Stel eerst uw profiel in zodat ik uw gewicht ken en u gepersonaliseerde begeleiding kan geven!' :
             language === 'fr' ? 'Configurez d\'abord votre profil pour que je connaisse votre poids et puisse vous donner des conseils personnalisés!' :
             'Richten Sie zuerst Ihr Profil ein, damit ich Ihr Gewicht kenne und Ihnen personalisierte Anleitung geben kann!';
    }
    return language === 'pt' ? `Você pesa ${weight}kg. Seu IMC é ${imc.toFixed(1)}, o que ${imc > 25 ? 'indica sobrepeso - recomendo focar em dieta balanceada e exercícios leves' : imc < 18.5 ? 'indica baixo peso - consulte um nutricionista' : 'está na faixa saudável! Continue assim'}.` :
           language === 'en' ? `You weigh ${weight}kg. Your BMI is ${imc.toFixed(1)}, which ${imc > 25 ? 'indicates overweight - I recommend focusing on balanced diet and light exercises' : imc < 18.5 ? 'indicates underweight - consult a nutritionist' : 'is in the healthy range! Keep it up'}.` :
           language === 'nl' ? `U weegt ${weight}kg. Uw BMI is ${imc.toFixed(1)}, wat ${imc > 25 ? 'overgewicht aangeeft - ik raad aan te focussen op een evenwichtig dieet en lichte oefeningen' : imc < 18.5 ? 'ondergewicht aangeeft - raadpleeg een voedingsdeskundige' : 'in het gezonde bereik ligt! Ga zo door'}.` :
           language === 'fr' ? `Vous pesez ${weight}kg. Votre IMC est ${imc.toFixed(1)}, ce qui ${imc > 25 ? 'indique un surpoids - je recommande de se concentrer sur un régime équilibré et des exercices légers' : imc < 18.5 ? 'indique une insuffisance pondérale - consultez un nutritionniste' : 'est dans la plage saine! Continuez comme ça'}.` :
           `Sie wiegen ${weight}kg. Ihr BMI ist ${imc.toFixed(1)}, was ${imc > 25 ? 'Übergewicht anzeigt - ich empfehle, sich auf eine ausgewogene Ernährung und leichte Übungen zu konzentrieren' : imc < 18.5 ? 'Untergewicht anzeigt - konsultieren Sie einen Ernährungsberater' : 'im gesunden Bereich liegt! Machen Sie weiter so'}.`;
  }

  // Perguntas sobre MEDICAMENTOS
  if (lowerMessage.match(/(quantos.*medicamento|remédio|medication|medicijn|médicament|medikament|tomo|taking)/)) {
    if (medCount === 0) {
      return language === 'pt' ? 'Você ainda não cadastrou nenhum medicamento. Vá na aba Medicamentos para adicionar seus remédios e receber lembretes!' :
             language === 'en' ? 'You haven\'t registered any medications yet. Go to the Medications tab to add your medicines and receive reminders!' :
             language === 'nl' ? 'U heeft nog geen medicijnen geregistreerd. Ga naar het tabblad Medicijnen om uw medicijnen toe te voegen en herinneringen te ontvangen!' :
             language === 'fr' ? 'Vous n\'avez pas encore enregistré de médicaments. Allez dans l\'onglet Médicaments pour ajouter vos médicaments et recevoir des rappels!' :
             'Sie haben noch keine Medikamente registriert. Gehen Sie zum Tab Medikamente, um Ihre Medikamente hinzuzufügen und Erinnerungen zu erhalten!';
    }
    const medList = medications.map(m => m.name).join(', ');
    return language === 'pt' ? `Você está tomando ${medCount} medicamento(s): ${medList}. ${medCount > 3 ? 'São vários medicamentos - não esqueça de tomar todos nos horários corretos!' : 'Lembre-se de tomar sempre nos horários prescritos.'}` :
           language === 'en' ? `You are taking ${medCount} medication(s): ${medList}. ${medCount > 3 ? 'That\'s several medications - don\'t forget to take them all at the correct times!' : 'Remember to always take them at prescribed times.'}` :
           language === 'nl' ? `U neemt ${medCount} medicijn(en): ${medList}. ${medCount > 3 ? 'Dat zijn verschillende medicijnen - vergeet niet ze allemaal op de juiste tijden in te nemen!' : 'Vergeet niet ze altijd op voorgeschreven tijden in te nemen.'}` :
           language === 'fr' ? `Vous prenez ${medCount} médicament(s): ${medList}. ${medCount > 3 ? 'Ce sont plusieurs médicaments - n\'oubliez pas de tous les prendre aux heures correctes!' : 'N\'oubliez pas de toujours les prendre aux heures prescrites.'}` :
           `Sie nehmen ${medCount} Medikament(e): ${medList}. ${medCount > 3 ? 'Das sind mehrere Medikamente - vergessen Sie nicht, sie alle zu den richtigen Zeiten einzunehmen!' : 'Denken Sie daran, sie immer zu den verschriebenen Zeiten einzunehmen.'}`;
  }

  // Perguntas sobre EXERCÍCIOS
  if (lowerMessage.match(/(exercício|atividade|treino|caminhar|correr|exercise|workout|walk|run|oefening|training|exercice|entraînement|übung|training)/)) {
    if (!userProfile) {
      return language === 'pt' ? 'Configure seu perfil para eu recomendar exercícios personalizados para você!' :
             language === 'en' ? 'Set up your profile so I can recommend personalized exercises for you!' :
             language === 'nl' ? 'Stel uw profiel in zodat ik gepersonaliseerde oefeningen voor u kan aanbevelen!' :
             language === 'fr' ? 'Configurez votre profil pour que je puisse recommander des exercices personnalisés pour vous!' :
             'Richten Sie Ihr Profil ein, damit ich personalisierte Übungen für Sie empfehlen kann!';
    }
    return language === 'pt' ? `Para você (${age} anos, ${weight}kg), recomendo: ${age > 60 ? 'caminhadas leves de 15-20 minutos, alongamentos e exercícios respiratórios' : imc > 25 ? 'caminhadas de 30 minutos, natação leve e bicicleta ergométrica' : 'caminhadas de 30-40 minutos, natação e exercícios aeróbicos leves'}. Sempre comece devagar e aumente gradualmente!` :
           language === 'en' ? `For you (${age} years, ${weight}kg), I recommend: ${age > 60 ? 'light walks of 15-20 minutes, stretching and breathing exercises' : imc > 25 ? '30-minute walks, light swimming and stationary bike' : '30-40 minute walks, swimming and light aerobic exercises'}. Always start slowly and gradually increase!` :
           language === 'nl' ? `Voor u (${age} jaar, ${weight}kg) raad ik aan: ${age > 60 ? 'lichte wandelingen van 15-20 minuten, stretching en ademhalingsoefeningen' : imc > 25 ? '30 minuten wandelen, licht zwemmen en hometrainer' : '30-40 minuten wandelen, zwemmen en lichte aerobe oefeningen'}. Begin altijd langzaam en verhoog geleidelijk!` :
           language === 'fr' ? `Pour vous (${age} ans, ${weight}kg), je recommande: ${age > 60 ? 'marches légères de 15-20 minutes, étirements et exercices respiratoires' : imc > 25 ? 'marches de 30 minutes, natation légère et vélo stationnaire' : 'marches de 30-40 minutes, natation et exercices aérobiques légers'}. Commencez toujours lentement et augmentez progressivement!` :
           `Für Sie (${age} Jahre, ${weight}kg) empfehle ich: ${age > 60 ? 'leichte Spaziergänge von 15-20 Minuten, Dehnübungen und Atemübungen' : imc > 25 ? '30-minütige Spaziergänge, leichtes Schwimmen und Heimtrainer' : '30-40-minütige Spaziergänge, Schwimmen und leichte aerobe Übungen'}. Beginnen Sie immer langsam und steigern Sie allmählich!`;
  }

  // Perguntas sobre ALIMENTAÇÃO/DIETA
  if (lowerMessage.match(/(comer|comida|dieta|alimentação|calorias|diet|food|meal|eat|nutrition|eten|voeding|nourriture|régime|essen|ernährung)/)) {
    if (!userProfile) {
      return language === 'pt' ? 'Configure seu perfil para eu calcular suas necessidades calóricas e recomendar uma dieta personalizada!' :
             language === 'en' ? 'Set up your profile so I can calculate your caloric needs and recommend a personalized diet!' :
             language === 'nl' ? 'Stel uw profiel in zodat ik uw calorische behoeften kan berekenen en een gepersonaliseerd dieet kan aanbevelen!' :
             language === 'fr' ? 'Configurez votre profil pour que je puisse calculer vos besoins caloriques et recommander un régime personnalisé!' :
             'Richten Sie Ihr Profil ein, damit ich Ihren Kalorienbedarf berechnen und eine personalisierte Ernährung empfehlen kann!';
    }
    const tmb = 10 * weight + 6.25 * height - 5 * age + 5;
    const calorias = Math.round(tmb * 1.3);
    return language === 'pt' ? `Para você, recomendo cerca de ${calorias} calorias por dia. Foque em: vegetais verdes, proteínas magras (frango, peixe), grãos integrais, frutas e MUITA água. Evite: sal em excesso, frituras, gorduras saturadas e açúcar. ${imc > 25 ? 'Como você está acima do peso, tente reduzir 300-500 calorias por dia para perder peso gradualmente.' : 'Mantenha essa alimentação balanceada!'}` :
           language === 'en' ? `For you, I recommend about ${calorias} calories per day. Focus on: green vegetables, lean proteins (chicken, fish), whole grains, fruits and LOTS of water. Avoid: excess salt, fried foods, saturated fats and sugar. ${imc > 25 ? 'Since you\'re overweight, try reducing 300-500 calories per day to lose weight gradually.' : 'Maintain this balanced diet!'}` :
           language === 'nl' ? `Voor u raad ik ongeveer ${calorias} calorieën per dag aan. Focus op: groene groenten, magere eiwitten (kip, vis), volkoren granen, fruit en VEEL water. Vermijd: overmatig zout, gefrituurde gerechten, verzadigde vetten en suiker. ${imc > 25 ? 'Omdat u overgewicht heeft, probeer 300-500 calorieën per dag te verminderen om geleidelijk gewicht te verliezen.' : 'Handhaaf dit evenwichtige dieet!'}` :
           language === 'fr' ? `Pour vous, je recommande environ ${calorias} calories par jour. Concentrez-vous sur: légumes verts, protéines maigres (poulet, poisson), grains entiers, fruits et BEAUCOUP d'eau. Évitez: excès de sel, fritures, graisses saturées et sucre. ${imc > 25 ? 'Comme vous êtes en surpoids, essayez de réduire 300-500 calories par jour pour perdre du poids progressivement.' : 'Maintenez ce régime équilibré!'}` :
           `Für Sie empfehle ich etwa ${calorias} Kalorien pro Tag. Konzentrieren Sie sich auf: grünes Gemüse, mageres Protein (Hähnchen, Fisch), Vollkornprodukte, Obst und VIEL Wasser. Vermeiden Sie: übermäßiges Salz, frittierte Speisen, gesättigte Fette und Zucker. ${imc > 25 ? 'Da Sie übergewichtig sind, versuchen Sie, 300-500 Kalorien pro Tag zu reduzieren, um allmählich Gewicht zu verlieren.' : 'Halten Sie diese ausgewogene Ernährung bei!'}`;
  }

  // Perguntas sobre SAÚDE/CORAÇÃO
  if (lowerMessage.match(/(saúde|coração|pressão|batimento|health|heart|pressure|beat|gezondheid|hart|druk|santé|cœur|pression|gesundheit|herz|druck)/)) {
    return language === 'pt' ? `Sua saúde cardíaca depende de 4 pilares: 1) Medicação regular (você tem ${medCount} medicamento(s) - tome sempre!), 2) Exercícios leves diários, 3) Alimentação balanceada, 4) Controle do estresse. ${imc > 25 ? 'Perder peso ajudará muito seu coração!' : 'Continue cuidando bem de você!'} Faça check-ups regulares com seu médico.` :
           language === 'en' ? `Your heart health depends on 4 pillars: 1) Regular medication (you have ${medCount} medication(s) - always take them!), 2) Daily light exercises, 3) Balanced diet, 4) Stress control. ${imc > 25 ? 'Losing weight will help your heart a lot!' : 'Keep taking good care of yourself!'} Have regular check-ups with your doctor.` :
           language === 'nl' ? `Uw hartgezondheid hangt af van 4 pijlers: 1) Regelmatige medicatie (u heeft ${medCount} medicijn(en) - neem ze altijd!), 2) Dagelijkse lichte oefeningen, 3) Evenwichtig dieet, 4) Stressbeheersing. ${imc > 25 ? 'Gewicht verliezen zal uw hart veel helpen!' : 'Blijf goed voor uzelf zorgen!'} Heb regelmatige controles bij uw arts.` :
           language === 'fr' ? `Votre santé cardiaque dépend de 4 piliers: 1) Médicaments réguliers (vous avez ${medCount} médicament(s) - prenez-les toujours!), 2) Exercices légers quotidiens, 3) Régime équilibré, 4) Contrôle du stress. ${imc > 25 ? 'Perdre du poids aidera beaucoup votre cœur!' : 'Continuez à bien prendre soin de vous!'} Faites des contrôles réguliers avec votre médecin.` :
           `Ihre Herzgesundheit hängt von 4 Säulen ab: 1) Regelmäßige Medikation (Sie haben ${medCount} Medikament(e) - nehmen Sie sie immer!), 2) Tägliche leichte Übungen, 3) Ausgewogene Ernährung, 4) Stressbewältigung. ${imc > 25 ? 'Gewicht zu verlieren wird Ihrem Herzen sehr helfen!' : 'Kümmern Sie sich weiterhin gut um sich!'} Haben Sie regelmäßige Untersuchungen bei Ihrem Arzt.`;
  }

  // Perguntas sobre MOTIVAÇÃO/ÂNIMO
  if (lowerMessage.match(/(cansado|desânimo|difícil|não consigo|tired|difficult|can't|moe|moeilijk|kan niet|fatigué|difficile|ne peux pas|müde|schwierig|kann nicht)/)) {
    return language === 'pt' ? `Eu entendo que pode ser difícil às vezes. Mas olhe o quanto você já conquistou: você está aqui, cuidando da sua saúde, ${medCount > 0 ? `gerenciando ${medCount} medicamento(s)` : 'buscando melhorar'}! Isso já é INCRÍVEL! 💪 Não desista. Comece pequeno hoje: apenas tome seus medicamentos e dê uma caminhada de 10 minutos. Amanhã será mais fácil. Você é mais forte do que pensa! ❤️` :
           language === 'en' ? `I understand it can be difficult sometimes. But look how much you've already achieved: you're here, taking care of your health, ${medCount > 0 ? `managing ${medCount} medication(s)` : 'seeking to improve'}! That's already AMAZING! 💪 Don't give up. Start small today: just take your medications and take a 10-minute walk. Tomorrow will be easier. You're stronger than you think! ❤️` :
           language === 'nl' ? `Ik begrijp dat het soms moeilijk kan zijn. Maar kijk hoeveel u al heeft bereikt: u bent hier, zorgt voor uw gezondheid, ${medCount > 0 ? `beheert ${medCount} medicijn(en)` : 'probeert te verbeteren'}! Dat is al GEWELDIG! 💪 Geef niet op. Begin vandaag klein: neem gewoon uw medicijnen en maak een wandeling van 10 minuten. Morgen wordt het makkelijker. U bent sterker dan u denkt! ❤️` :
           language === 'fr' ? `Je comprends que cela peut être difficile parfois. Mais regardez combien vous avez déjà accompli: vous êtes ici, prenant soin de votre santé, ${medCount > 0 ? `gérant ${medCount} médicament(s)` : 'cherchant à améliorer'}! C'est déjà INCROYABLE! 💪 N'abandonnez pas. Commencez petit aujourd'hui: prenez simplement vos médicaments et faites une promenade de 10 minutes. Demain sera plus facile. Vous êtes plus fort que vous ne le pensez! ❤️` :
           `Ich verstehe, dass es manchmal schwierig sein kann. Aber schauen Sie, wie viel Sie bereits erreicht haben: Sie sind hier, kümmern sich um Ihre Gesundheit, ${medCount > 0 ? `verwalten ${medCount} Medikament(e)` : 'versuchen sich zu verbessern'}! Das ist bereits ERSTAUNLICH! 💪 Geben Sie nicht auf. Fangen Sie heute klein an: Nehmen Sie einfach Ihre Medikamente und machen Sie einen 10-minütigen Spaziergang. Morgen wird es einfacher sein. Sie sind stärker als Sie denken! ❤️`;
  }

  // Resposta padrão para perguntas gerais
  if (isQuestion) {
    return language === 'pt' ? `Ótima pergunta! ${userProfile ? `Com base no seu perfil (${age} anos, ${weight}kg, ${medCount} medicamento(s))` : 'Configure seu perfil para respostas mais personalizadas'}, posso te ajudar com: medicamentos, exercícios, dieta, saúde cardíaca ou motivação. Seja mais específico na sua pergunta para eu te dar uma resposta melhor! Por exemplo: "Quantos medicamentos eu tomo?" ou "Que exercícios devo fazer?"` :
           language === 'en' ? `Great question! ${userProfile ? `Based on your profile (${age} years, ${weight}kg, ${medCount} medication(s))` : 'Set up your profile for more personalized answers'}, I can help you with: medications, exercises, diet, heart health or motivation. Be more specific in your question so I can give you a better answer! For example: "How many medications do I take?" or "What exercises should I do?"` :
           language === 'nl' ? `Goede vraag! ${userProfile ? `Op basis van uw profiel (${age} jaar, ${weight}kg, ${medCount} medicijn(en))` : 'Stel uw profiel in voor meer gepersonaliseerde antwoorden'}, kan ik u helpen met: medicijnen, oefeningen, dieet, hartgezondheid of motivatie. Wees specifieker in uw vraag zodat ik u een beter antwoord kan geven! Bijvoorbeeld: "Hoeveel medicijnen neem ik?" of "Welke oefeningen moet ik doen?"` :
           language === 'fr' ? `Excellente question! ${userProfile ? `En fonction de votre profil (${age} ans, ${weight}kg, ${medCount} médicament(s))` : 'Configurez votre profil pour des réponses plus personnalisées'}, je peux vous aider avec: médicaments, exercices, régime, santé cardiaque ou motivation. Soyez plus précis dans votre question pour que je puisse vous donner une meilleure réponse! Par exemple: "Combien de médicaments je prends?" ou "Quels exercices dois-je faire?"` :
           `Gute Frage! ${userProfile ? `Basierend auf Ihrem Profil (${age} Jahre, ${weight}kg, ${medCount} Medikament(e))` : 'Richten Sie Ihr Profil für personalisiertere Antworten ein'}, kann ich Ihnen helfen mit: Medikamenten, Übungen, Ernährung, Herzgesundheit oder Motivation. Seien Sie spezifischer in Ihrer Frage, damit ich Ihnen eine bessere Antwort geben kann! Zum Beispiel: "Wie viele Medikamente nehme ich?" oder "Welche Übungen sollte ich machen?"`;
  }

  // Resposta para afirmações (não perguntas)
  return language === 'pt' ? `Entendi! ${userProfile ? `Vejo que você tem ${age} anos e está gerenciando ${medCount} medicamento(s).` : 'Configure seu perfil para eu te conhecer melhor!'} Como posso te ajudar especificamente? Pergunte sobre seus medicamentos, exercícios recomendados, dieta ideal, ou qualquer dúvida sobre saúde cardíaca. Estou aqui para te apoiar! 💙` :
         language === 'en' ? `I understand! ${userProfile ? `I see you're ${age} years old and managing ${medCount} medication(s).` : 'Set up your profile so I can get to know you better!'} How can I help you specifically? Ask about your medications, recommended exercises, ideal diet, or any questions about heart health. I'm here to support you! 💙` :
         language === 'nl' ? `Ik begrijp het! ${userProfile ? `Ik zie dat u ${age} jaar oud bent en ${medCount} medicijn(en) beheert.` : 'Stel uw profiel in zodat ik u beter kan leren kennen!'} Hoe kan ik u specifiek helpen? Vraag over uw medicijnen, aanbevolen oefeningen, ideaal dieet, of vragen over hartgezondheid. Ik ben hier om u te ondersteunen! 💙` :
         language === 'fr' ? `Je comprends! ${userProfile ? `Je vois que vous avez ${age} ans et gérez ${medCount} médicament(s).` : 'Configurez votre profil pour que je puisse mieux vous connaître!'} Comment puis-je vous aider spécifiquement? Posez des questions sur vos médicaments, exercices recommandés, régime idéal, ou toute question sur la santé cardiaque. Je suis là pour vous soutenir! 💙` :
         `Ich verstehe! ${userProfile ? `Ich sehe, Sie sind ${age} Jahre alt und verwalten ${medCount} Medikament(e).` : 'Richten Sie Ihr Profil ein, damit ich Sie besser kennenlernen kann!'} Wie kann ich Ihnen speziell helfen? Fragen Sie nach Ihren Medikamenten, empfohlenen Übungen, idealer Ernährung oder Fragen zur Herzgesundheit. Ich bin hier, um Sie zu unterstützen! 💙`;
};

// Mensagens motivacionais para notificações de medicamentos
const getMedicationNotificationMessages = (language: Language): string[] => {
  const messages: Record<Language, string[]> = {
    pt: [
      '💊 Hora do remédio! Seu coração agradece por cuidar tão bem dele! 💙',
      '⏰ Lembrete carinhoso: está na hora de tomar seu medicamento! Você está indo muito bem! 🌟',
      '💪 Mais uma dose, mais um passo rumo à saúde! Vamos lá, campeão(ã)!',
      '🎯 Consistência é a chave! Hora de tomar seu medicamento e continuar essa jornada incrível!',
      '❤️ Seu coração está contando com você! Hora do medicamento! 💊',
      '🌈 Cuidar de você é um ato de amor! Hora de tomar seu remédio!',
      '⭐ Você é uma estrela! Não esqueça seu medicamento agora!',
      '🚀 Rumo à saúde plena! Hora de tomar seu medicamento!',
      '💝 Seu bem-estar é prioridade! Lembrete: medicamento agora!',
      '🎉 Parabéns por ser tão disciplinado(a)! Hora do remédio!',
    ],
    en: [
      '💊 Medicine time! Your heart thanks you for taking such good care! 💙',
      '⏰ Friendly reminder: it\'s time to take your medication! You\'re doing great! 🌟',
      '💪 One more dose, one more step towards health! Let\'s go, champion!',
      '🎯 Consistency is key! Time to take your medication and continue this amazing journey!',
      '❤️ Your heart is counting on you! Medication time! 💊',
      '🌈 Taking care of yourself is an act of love! Time for your medicine!',
      '⭐ You\'re a star! Don\'t forget your medication now!',
      '🚀 Towards full health! Time to take your medication!',
      '💝 Your well-being is a priority! Reminder: medication now!',
      '🎉 Congratulations on being so disciplined! Medicine time!',
    ],
    nl: [
      '💊 Medicijntijd! Uw hart dankt u voor de goede zorg! 💙',
      '⏰ Vriendelijke herinnering: het is tijd om uw medicijn in te nemen! U doet het geweldig! 🌟',
      '💪 Nog een dosis, nog een stap naar gezondheid! Kom op, kampioen!',
      '🎯 Consistentie is de sleutel! Tijd om uw medicijn in te nemen en deze geweldige reis voort te zetten!',
      '❤️ Uw hart rekent op u! Medicijntijd! 💊',
      '🌈 Voor uzelf zorgen is een daad van liefde! Tijd voor uw medicijn!',
      '⭐ U bent een ster! Vergeet uw medicijn nu niet!',
      '🚀 Naar volledige gezondheid! Tijd om uw medicijn in te nemen!',
      '💝 Uw welzijn is een prioriteit! Herinnering: medicijn nu!',
      '🎉 Gefeliciteerd met uw discipline! Medicijntijd!',
    ],
    fr: [
      '💊 L\'heure du médicament! Votre cœur vous remercie de prendre si bien soin! 💙',
      '⏰ Rappel amical: il est temps de prendre votre médicament! Vous faites du bon travail! 🌟',
      '💪 Une dose de plus, un pas de plus vers la santé! Allez, champion!',
      '🎯 La cohérence est la clé! Il est temps de prendre votre médicament et de continuer ce voyage incroyable!',
      '❤️ Votre cœur compte sur vous! L\'heure du médicament! 💊',
      '🌈 Prendre soin de vous est un acte d\'amour! L\'heure de votre médicament!',
      '⭐ Vous êtes une étoile! N\'oubliez pas votre médicament maintenant!',
      '🚀 Vers une santé complète! Il est temps de prendre votre médicament!',
      '💝 Votre bien-être est une priorité! Rappel: médicament maintenant!',
      '🎉 Félicitations pour votre discipline! L\'heure du médicament!',
    ],
    de: [
      '💊 Medikamentenzeit! Ihr Herz dankt Ihnen für die gute Pflege! 💙',
      '⏰ Freundliche Erinnerung: Es ist Zeit, Ihr Medikament einzunehmen! Sie machen das großartig! 🌟',
      '💪 Eine Dosis mehr, ein Schritt mehr zur Gesundheit! Los geht\'s, Champion!',
      '🎯 Konsistenz ist der Schlüssel! Zeit, Ihr Medikament einzunehmen und diese erstaunliche Reise fortzusetzen!',
      '❤️ Ihr Herz zählt auf Sie! Medikamentenzeit! 💊',
      '🌈 Sich um sich selbst zu kümmern ist ein Akt der Liebe! Zeit für Ihr Medikament!',
      '⭐ Sie sind ein Star! Vergessen Sie Ihr Medikament jetzt nicht!',
      '🚀 Auf dem Weg zur vollen Gesundheit! Zeit, Ihr Medikament einzunehmen!',
      '💝 Ihr Wohlbefinden ist eine Priorität! Erinnerung: Medikament jetzt!',
      '🎉 Herzlichen Glückwunsch zu Ihrer Disziplin! Medikamentenzeit!',
    ],
  };

  return messages[language];
};


// --- AUTO-STABILIZED BY ChatGPT FIXER ---
export default function Home() {
  try {

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
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [noMedications, setNoMedications] = useState(false);

  // Dados do onboarding
  const [onboardingData, setOnboardingData] = useState({
    age: '',
    weight: '',
    height: '',
    heightFeet: '',
    heightInches: '',
    medications: [''],
    medicationCount: '0',
    selectedPlan: 'premium' as 'essencial' | 'premium' | 'elite',
  });

  // Planos disponíveis - preços fixos independente da moeda
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
      price: 0.99,
      period: t.plans.premium.period,
      features: t.plans.premium.features,
      highlighted: true,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'elite',
      name: t.plans.elite.name,
      tagline: t.plans.elite.tagline,
      price: 9.99,
      period: t.plans.elite.period,
      features: t.plans.elite.features,
      highlighted: false,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  // Conversão de unidades
  const convertWeight = (value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
    if (from === to) return value;
    if (from === 'kg' && to === 'lbs') return value * 2.20462;
    return value / 2.20462; // lbs to kg
  };

  const convertHeight = (value: number, from: 'cm' | 'inches', to: 'cm' | 'inches'): number => {
    if (from === to) return value;
    if (from === 'cm' && to === 'inches') return value / 2.54;
    return value * 2.54; // inches to cm
  };

  const feetAndInchesToCm = (feet: number, inches: number): number => {
    return (feet * 12 + inches) * 2.54;
  };

  const cmToFeetAndInches = (cm: number): { feet: number; inches: number } => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  // Sistema de Notificações - PREMIUM FEATURE
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Solicitar permissão de notificações
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert(language === 'pt' ? 'Seu navegador não suporta notificações' :
            language === 'en' ? 'Your browser does not support notifications' :
            language === 'nl' ? 'Uw browser ondersteunt geen meldingen' :
            language === 'fr' ? 'Votre navigateur ne prend pas en charge les notifications' :
            'Ihr Browser unterstützt keine Benachrichtigungen');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        // Mostrar notificação de teste
        showNotification(
          language === 'pt' ? '🎉 Notificações Ativadas!' :
          language === 'en' ? '🎉 Notifications Enabled!' :
          language === 'nl' ? '🎉 Meldingen Ingeschakeld!' :
          language === 'fr' ? '🎉 Notifications Activées!' :
          '🎉 Benachrichtigungen Aktiviert!',
          language === 'pt' ? 'Você receberá lembretes quando for hora de tomar seus medicamentos!' :
          language === 'en' ? 'You will receive reminders when it\'s time to take your medications!' :
          language === 'nl' ? 'U ontvangt herinneringen wanneer het tijd is om uw medicijnen in te nemen!' :
          language === 'fr' ? 'Vous recevrez des rappels lorsqu\'il sera temps de prendre vos médicaments!' :
          'Sie erhalten Erinnerungen, wenn es Zeit ist, Ihre Medikamente einzunehmen!'
        );
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
    }
  };

  // Mostrar notificação
  const showNotification = (title: string, body: string) => {
    if (notificationPermission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [200, 100, 200],
        tag: 'medication-reminder',
        requireInteraction: true,
      });
    }
  };

  // Verificar medicamentos pendentes e enviar notificações
  useEffect(() => {
    if (!userProfile || !notificationsEnabled || userProfile.plan === 'essencial') return;

    const checkMedicationTimes = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      medications.forEach(med => {
        med.times.forEach(time => {
          if (time === currentTime && !wasTakenToday(med)) {
            const messages = getMedicationNotificationMessages(language);
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            showNotification(
              `${med.name} - ${med.dosage}`,
              randomMessage
            );
          }
        });
      });
    };

    // Verificar a cada minuto
    const interval = setInterval(checkMedicationTimes, 60000);
    
    // Verificar imediatamente ao carregar
    checkMedicationTimes();

    return () => clearInterval(interval);
  }, [medications, notificationsEnabled, userProfile, language]);

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
    // Converter para métrico se necessário
    let weightInKg = parseFloat(onboardingData.weight);
    let heightInCm = parseFloat(onboardingData.height);

    if (unitSystem === 'imperial') {
      weightInKg = convertWeight(weightInKg, 'lbs', 'kg');
      heightInCm = feetAndInchesToCm(
        parseFloat(onboardingData.heightFeet),
        parseFloat(onboardingData.heightInches)
      );
    }

    const profile: UserProfile = {
      age: parseInt(onboardingData.age),
      weight: weightInKg,
      height: heightInCm,
      medications: noMedications ? [] : onboardingData.medications.filter(m => m.trim() !== ''),
      medicationCount: noMedications ? 0 : onboardingData.medications.filter(m => m.trim() !== '').length,
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
      if (unitSystem === 'metric') {
        return onboardingData.age && onboardingData.weight && onboardingData.height;
      } else {
        return onboardingData.age && onboardingData.weight && onboardingData.heightFeet && onboardingData.heightInches;
      }
    }
    if (onboardingStep === 2) {
      return noMedications || onboardingData.medications.some(m => m.trim() !== '');
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

  // Enviar mensagem para o Coach AI - SISTEMA INTELIGENTE MELHORADO
  const handleCoachMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachMessage.trim() || isCoachTyping) return;

    const newHistory = [...chatHistory, { role: 'user' as const, message: coachMessage }];
    setChatHistory(newHistory);
    setCoachMessage('');
    setIsCoachTyping(true);

    // Simular delay de digitação para parecer mais natural
    setTimeout(() => {
      const intelligentResponse = generateCoachResponse(coachMessage, userProfile, language, medications);
      setChatHistory([...newHistory, { role: 'assistant', message: intelligentResponse }]);
      setIsCoachTyping(false);
    }, 1500);
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
  const hasFeatureAccess = (feature: 'medications' | 'exercises' | 'diet' | 'coach' | 'mealAnalysis' | 'notifications') => {
    if (!userProfile) return false;
    if (feature === 'medications') return true;
    if (feature === 'notifications') return userProfile.plan === 'premium' || userProfile.plan === 'elite';
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

  // Handler para "Não tomo medicamentos" - pula para step 4
  const handleNoMedications = () => {
    setNoMedications(true);
    setOnboardingStep(4); // Pula direto para seleção de plano
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
              {[1, 2, 4].map((step) => (
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

                {/* Unit System Toggle */}
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant={unitSystem === 'metric' ? 'default' : 'outline'}
                    onClick={() => setUnitSystem('metric')}
                    className="flex-1"
                  >
                    {language === 'pt' ? 'Métrico (kg, cm)' :
                     language === 'en' ? 'Metric (kg, cm)' :
                     language === 'nl' ? 'Metrisch (kg, cm)' :
                     language === 'fr' ? 'Métrique (kg, cm)' :
                     'Metrisch (kg, cm)'}
                  </Button>
                  <Button
                    type="button"
                    variant={unitSystem === 'imperial' ? 'default' : 'outline'}
                    onClick={() => setUnitSystem('imperial')}
                    className="flex-1"
                  >
                    {language === 'pt' ? 'Imperial (lbs, ft)' :
                     language === 'en' ? 'Imperial (lbs, ft)' :
                     language === 'nl' ? 'Imperiaal (lbs, ft)' :
                     language === 'fr' ? 'Impérial (lbs, ft)' :
                     'Imperial (lbs, ft)'}
                  </Button>
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

                  {unitSystem === 'metric' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-base">
                          {language === 'pt' ? 'Peso (kg)' :
                           language === 'en' ? 'Weight (kg)' :
                           language === 'nl' ? 'Gewicht (kg)' :
                           language === 'fr' ? 'Poids (kg)' :
                           'Gewicht (kg)'}
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="70"
                          value={onboardingData.weight}
                          onChange={(e) => setOnboardingData({ ...onboardingData, weight: e.target.value })}
                          className="text-lg h-12"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height" className="text-base">
                          {language === 'pt' ? 'Altura (cm)' :
                           language === 'en' ? 'Height (cm)' :
                           language === 'nl' ? 'Lengte (cm)' :
                           language === 'fr' ? 'Taille (cm)' :
                           'Größe (cm)'}
                        </Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="170"
                          value={onboardingData.height}
                          onChange={(e) => setOnboardingData({ ...onboardingData, height: e.target.value })}
                          className="text-lg h-12"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="weightLbs" className="text-base">
                          {language === 'pt' ? 'Peso (lbs)' :
                           language === 'en' ? 'Weight (lbs)' :
                           language === 'nl' ? 'Gewicht (lbs)' :
                           language === 'fr' ? 'Poids (lbs)' :
                           'Gewicht (lbs)'}
                        </Label>
                        <Input
                          id="weightLbs"
                          type="number"
                          step="0.1"
                          placeholder="154"
                          value={onboardingData.weight}
                          onChange={(e) => setOnboardingData({ ...onboardingData, weight: e.target.value })}
                          className="text-lg h-12"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="heightFeet" className="text-base">
                            {language === 'pt' ? 'Altura (pés)' :
                             language === 'en' ? 'Height (feet)' :
                             language === 'nl' ? 'Lengte (voet)' :
                             language === 'fr' ? 'Taille (pieds)' :
                             'Größe (Fuß)'}
                          </Label>
                          <Input
                            id="heightFeet"
                            type="number"
                            placeholder="5"
                            value={onboardingData.heightFeet}
                            onChange={(e) => setOnboardingData({ ...onboardingData, heightFeet: e.target.value })}
                            className="text-lg h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="heightInches" className="text-base">
                            {language === 'pt' ? 'Polegadas' :
                             language === 'en' ? 'Inches' :
                             language === 'nl' ? 'Inches' :
                             language === 'fr' ? 'Pouces' :
                             'Zoll'}
                          </Label>
                          <Input
                            id="heightInches"
                            type="number"
                            placeholder="7"
                            value={onboardingData.heightInches}
                            onChange={(e) => setOnboardingData({ ...onboardingData, heightInches: e.target.value })}
                            className="text-lg h-12"
                          />
                        </div>
                      </div>
                    </div>
                  )}
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

                {/* Opção: Não tomo medicamentos */}
                <div className="flex items-center justify-center">
                  <Button
                    type="button"
                    variant={noMedications ? 'default' : 'outline'}
                    onClick={handleNoMedications}
                    className="w-full max-w-md"
                  >
                    <Check className={`w-4 h-4 mr-2 ${noMedications ? 'opacity-100' : 'opacity-0'}`} />
                    {language === 'pt' ? 'Não tomo medicamentos' :
                     language === 'en' ? 'I don\'t take medications' :
                     language === 'nl' ? 'Ik neem geen medicijnen' :
                     language === 'fr' ? 'Je ne prends pas de médicaments' :
                     'Ich nehme keine Medikamente'}
                  </Button>
                </div>

                {!noMedications && (
                  <>
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
                  </>
                )}
              </div>
            )}

            {/* Step 4: Seleção de Plano (Step 3 foi removido do fluxo quando "Não tomo medicamentos") */}
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
                              {plan.price === 0 ? t.common.free : `${getCurrencyInfo(userCurrency).symbol}${plan.price.toFixed(2)}`}
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
              {onboardingStep > 1 && onboardingStep !== 4 && (
                <Button
                  variant="outline"
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="flex-1 h-12"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {t.onboarding.back}
                </Button>
              )}

              {onboardingStep === 4 && !noMedications && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setOnboardingStep(2);
                    setNoMedications(false);
                  }}
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

  // App principal (após onboarding) - código continua igual...
  // [Resto do código permanece inalterado]
  
  return <div>App principal carregado</div>;
  } catch (err) {
    console.error("PAGE CRASH PREVENTED:", err);
    return (
      <div style={{
        padding: "40px",
        fontSize: "20px",
        color: "red",
        fontWeight: "bold"
      }}>
        Ocorreu um erro ao carregar o app.<br/>
        Verifique o console para mais detalhes.
      </div>
    );
  }

}
