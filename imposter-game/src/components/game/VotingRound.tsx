'use client';
import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, Users, Eye, EyeOff } from 'lucide-react';

export default function VotingRound() {
  const { gameState, currentPlayer, submitVote } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(20);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!gameState) return;
    
    // Check if current player has already voted
    const alreadyVoted = gameState.votes[currentPlayer?.id || ''] !== undefined;
    setHasVoted(alreadyVoted);
    
    // Reset timer
    setTimeLeft(Math.floor(gameState.votingTimeLimit / 1000));
    
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, currentPlayer]);

  if (!gameState || !currentPlayer) return null;

  const votableePlayers = gameState.players.filter(p => p.id !== currentPlayer.id && p.isConnected);
  const votedCount = Object.keys(gameState.votes).length;
  const totalPlayers = gameState.players.filter(p => p.isConnected).length;

  const handleSubmitVote = () => {
    if (selectedPlayer && !hasVoted) {
      submitVote(selectedPlayer);
      setHasVoted(true);
    }
  };

  // Show answers for context
  const getPlayerAnswer = (playerId: string) => {
    const answeredPlayerId = gameState.answers[playerId];
    return gameState.players.find(p => p.id === answeredPlayerId)?.name || 'Unknown';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2">
            <span className="text-purple-200 text-sm">Round {gameState.currentRound} - Voting</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-lg px-4 py-2">
            <Clock size={16} className="text-white" />
            <span className="text-white font-mono">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <h2 className="text-xl font-bold text-white text-center mb-6">
          🕵️ Who is the imposter?
        </h2>
        
        {/* Show both questions for context */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-200 font-semibold mb-2 flex items-center gap-2">
              <Eye size={16} />
              Most Players Saw:
            </h3>
            <p className="text-white text-sm mb-3">"{gameState.currentQuestion?.text}"</p>
            <div className="space-y-1">
              
            </div>
          </div>
          
          
        </div>
        
        {!hasVoted ? (
          <div className="space-y-3">
            <p className="text-purple-200 text-center mb-4">
              Vote for who you think had a different question
            </p>
            {votableePlayers.map((player) => {
              const isImposterPlayer = gameState.imposterIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPlayer === player.id
                      ? 'border-red-400 bg-red-500/30 text-white'
                      : 'border-white/20 bg-white/10 text-purple-200 hover:border-red-300 hover:bg-red-500/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm opacity-75">
                      Answered: {getPlayerAnswer(player.id)}
                    </span>
                  </div>
                </button>
              );
            })}
            
            <button
              onClick={handleSubmitVote}
              disabled={!selectedPlayer}
              className="w-full mt-6 py-4 px-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Cast Vote
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-green-400 text-xl mb-2">✓</div>
            <p className="text-white font-semibold mb-2">Vote Cast!</p>
            <p className="text-purple-200">Waiting for other players...</p>
          </div>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-purple-200 flex items-center gap-2">
            <Users size={16} />
            Votes Cast
          </span>
          <span className="text-white font-semibold">
            {votedCount} / {totalPlayers}
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div
            className="bg-red-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(votedCount / totalPlayers) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}