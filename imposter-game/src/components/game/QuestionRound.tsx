'use client';
import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, Users, HelpCircle } from 'lucide-react';

export default function QuestionRound() {
  const { gameState, currentPlayer, submitAnswer } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!gameState) return;
    
    // Check if current player has already submitted
    const alreadySubmitted = gameState.answers[currentPlayer?.id || ''] !== undefined;
    setHasSubmitted(alreadySubmitted);
    
    // Reset timer
    setTimeLeft(Math.floor(gameState.roundTimeLimit / 1000));
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentPlayer]);

  if (!gameState || !currentPlayer || !gameState.currentQuestion) return null;

  // During question phase, imposter doesn't know they're the imposter
  const isImposter = gameState.imposterIds.includes(currentPlayer.id);
  const availablePlayers = gameState.players.filter(p => p.isConnected);
  const answeredCount = Object.keys(gameState.answers).length;
  const totalPlayers = gameState.players.filter(p => p.isConnected).length;

  // Show the question based on whether they're imposter (but don't tell them they're imposter)
  const questionToShow = isImposter && gameState.imposterQuestion 
    ? gameState.imposterQuestion 
    : gameState.currentQuestion;

  const handleSubmit = () => {
    if (selectedPlayer && !hasSubmitted) {
      submitAnswer(selectedPlayer);
      setHasSubmitted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2">
            <span className="text-purple-200 text-sm">Round {gameState.currentRound}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-lg px-4 py-2">
            <Clock size={16} className="text-white" />
            <span className="text-white font-mono">{timeLeft}s</span>
          </div>
        </div>
        
        {/* No imposter warning during question phase - they don't know yet! */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HelpCircle size={20} className="text-blue-300" />
            <p className="text-blue-200 font-semibold">Answer the Question</p>
          </div>
          <p className="text-blue-300 text-sm">Select the player who best fits the question</p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle size={20} className="text-purple-400 mr-2" />
          <span className="text-purple-200 text-sm">Your Question</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {questionToShow.text}
        </h2>
        
        {!hasSubmitted ? (
          <div className="space-y-3">
            {availablePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPlayer === player.id
                    ? 'border-purple-400 bg-purple-500/30 text-white'
                    : 'border-white/20 bg-white/10 text-purple-200 hover:border-purple-300 hover:bg-purple-500/20'
                }`}
              >
                <span className="font-medium">{player.name}</span>
              </button>
            ))}
            
            <button
              onClick={handleSubmit}
              disabled={!selectedPlayer}
              className="w-full mt-6 py-4 px-6 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-green-400 text-xl mb-2">✓</div>
            <p className="text-white font-semibold mb-2">Answer Submitted!</p>
            <p className="text-purple-200">Waiting for other players...</p>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-purple-200 flex items-center gap-2">
            <Users size={16} />
            Answers Submitted
          </span>
          <span className="text-white font-semibold">
            {answeredCount} / {totalPlayers}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div
            className="bg-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalPlayers) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}