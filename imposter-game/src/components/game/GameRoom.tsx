'use client';
import { useGame } from '@/context/GameContext';
import QuestionRound from './QuestionRound';
import VotingRound from './VotingRound';
import ResultsRound from './ResultsRound';
import GameFinished from './GameFinished';

export default function GameRoom() {
  const { gameState } = useGame();

  if (!gameState) return null;

  switch (gameState.phase) {
    case 'question':
      return <QuestionRound />;
    case 'voting':
      return <VotingRound />;
    case 'results':
      return <ResultsRound />;
    case 'finished':
      return <GameFinished />;
    default:
      return <div className="text-white text-center">Loading...</div>;
  }
}