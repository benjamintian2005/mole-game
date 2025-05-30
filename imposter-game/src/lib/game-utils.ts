export const generateGameCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const calculatePoints = (
  isCorrectVote: boolean,
  responseTime: number,
  maxTime: number
): number => {
  if (!isCorrectVote) return 0;
  
  // Base points for correct vote
  const basePoints = 100;
  
  // Bonus points for faster response (max 50 bonus points)
  const timeBonus = Math.floor((1 - responseTime / maxTime) * 50);
  
  return basePoints + timeBonus;
};

export const selectRandomImposters = (playerIds: string[], count: number = 1): string[] => {
  const shuffled = [...playerIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};