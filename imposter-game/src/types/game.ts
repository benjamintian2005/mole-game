// src/types/game.ts
// Define Socket type without importing to avoid conflicts
export type SocketType = any; // We'll use any for now to avoid type conflicts

export interface Player {
  id: string;
  name: string;
  score: number;
  isConnected: boolean;
}

export interface GameState {
  id: string;
  code: string;
  players: Player[];
  hostId: string;
  currentRound: number;
  totalRounds: number;
  phase: 'lobby' | 'question' | 'voting' | 'results' | 'finished';
  currentQuestion?: Question;
  imposterQuestion?: Question; // The different question shown to the imposter
  answers: Record<string, string>; // playerId -> answer
  votes: Record<string, string>; // playerId -> votedForPlayerId
  imposterIds: string[];
  roundTimeLimit: number;
  votingTimeLimit: number;
}

export interface Question {
  id: string;
  text: string;
  category?: string;
}

export interface GameSettings {
  totalRounds: number;
  roundTimeLimit: number;
  votingTimeLimit: number;
}