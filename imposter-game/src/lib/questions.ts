import { Question } from '@/types/game';

export const SAMPLE_QUESTIONS: Question[] = [
  { id: '1', text: 'Who would be the best leader in a zombie apocalypse?', category: 'survival' },
  { id: '2', text: 'Who would be most likely to become famous?', category: 'personality' },
  { id: '3', text: 'Who would survive longest on a deserted island?', category: 'survival' },
  { id: '4', text: 'Who would be the best at keeping a secret?', category: 'trust' },
  { id: '5', text: 'Who would win in a dance battle?', category: 'fun' },
  { id: '6', text: 'Who would be the best wingman/wingwoman?', category: 'social' },
  { id: '7', text: 'Who would be most likely to rob a bank?', category: 'mischief' },
  { id: '8', text: 'Who would make the best teacher?', category: 'personality' },
  { id: '9', text: 'Who would be the worst roommate?', category: 'lifestyle' },
  { id: '10', text: 'Who would be most likely to win a reality TV show?', category: 'entertainment' },
  { id: '11', text: 'Who would be most likely to start their own business?', category: 'personality' },
  { id: '12', text: 'Who would be the best at solving a murder mystery?', category: 'intelligence' },
  { id: '13', text: 'Who would be most likely to become a professional athlete?', category: 'physical' },
  { id: '14', text: 'Who would be the best travel companion?', category: 'social' },
  { id: '15', text: 'Who would be most likely to forget their own birthday?', category: 'personality' },
  { id: '16', text: 'Who would be the best at negotiating a business deal?', category: 'personality' },
  { id: '17', text: 'Who would be most likely to win a cooking competition?', category: 'skills' },
  { id: '18', text: 'Who would be the best at giving relationship advice?', category: 'social' },
  { id: '19', text: 'Who would be most likely to become a millionaire?', category: 'success' },
  { id: '20', text: 'Who would be the best at organizing a surprise party?', category: 'social' }
];

export const getRandomQuestionPair = (usedQuestionIds: string[] = []): { mainQuestion: Question; imposterQuestion: Question } => {
  const availableQuestions = SAMPLE_QUESTIONS.filter(q => !usedQuestionIds.includes(q.id));
  
  if (availableQuestions.length < 2) {
    // Reset if not enough questions available
    const shuffled = [...SAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
    return {
      mainQuestion: shuffled[0],
      imposterQuestion: shuffled[1]
    };
  }
  
  const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
  return {
    mainQuestion: shuffled[0],
    imposterQuestion: shuffled[1]
  };
};

export const getRandomQuestion = (usedQuestionIds: string[] = []): Question => {
  const availableQuestions = SAMPLE_QUESTIONS.filter(q => !usedQuestionIds.includes(q.id));
  if (availableQuestions.length === 0) {
    // Reset if all questions used
    return SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)];
  }
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};