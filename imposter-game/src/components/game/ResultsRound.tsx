'use client';
import { useGame } from '@/context/GameContext';
import { Trophy, Target, Users } from 'lucide-react';

export default function ResultsRound() {
  const { gameState, currentPlayer } = useGame();

  if (!gameState || !currentPlayer) return null;

  const imposterIds = gameState.imposterIds;
  const imposterNames = imposterIds.map(id => 
    gameState.players.find(p => p.id === id)?.name
  ).filter(Boolean);

  // Calculate voting results
  const voteResults = new Map<string, string[]>();
  Object.entries(gameState.votes).forEach(([voterId, votedForId]) => {
    if (!voteResults.has(votedForId)) {
      voteResults.set(votedForId, []);
    }
    voteResults.get(votedForId)?.push(voterId);
  });

  const correctVoters = Object.entries(gameState.votes)
    .filter(([_, votedForId]) => imposterIds.includes(votedForId))
    .map(([voterId]) => voterId);

  const wasCurrentPlayerImposter = imposterIds.includes(currentPlayer.id);
  const didCurrentPlayerVoteCorrectly = correctVoters.includes(currentPlayer.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Round {gameState.currentRound} Results</h2>
      </div>

      {/* Imposter Reveal */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">🎭 The Imposter Was...</h3>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4">
            <p className="text-red-200 text-2xl font-bold">
              {imposterNames.join(', ')}
            </p>
          </div>
          
          {wasCurrentPlayerImposter ? (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-200">You were the imposter! 🎭</p>
            </div>
          ) : didCurrentPlayerVoteCorrectly ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-200">You voted correctly! +100 points 🎉</p>
            </div>
          ) : (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-200">You voted incorrectly 😔</p>
            </div>
          )}
        </div>
      </div>

      {/* Voting Results */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target size={20} />
          Voting Results
        </h3>
        <div className="space-y-3">
          {Array.from(voteResults.entries()).map(([playerId, voterIds]) => {
            const player = gameState.players.find(p => p.id === playerId);
            const isImposter = imposterIds.includes(playerId);
            return (
              <div
                key={playerId}
                className={`p-3 rounded-lg border ${
                  isImposter 
                    ? 'border-red-500/50 bg-red-500/20' 
                    : 'border-white/20 bg-white/10'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">
                    {player?.name} {isImposter && '🎭'}
                  </span>
                  <span className="text-purple-200">
                    {voterIds.length} vote{voterIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Standings */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy size={20} />
          Current Standings
        </h3>
        <div className="space-y-2">
          {gameState.players
            .filter(p => p.isConnected)
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <div
                key={player.id}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  player.id === currentPlayer.id 
                    ? 'bg-purple-500/30 border border-purple-500/50' 
                    : 'bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-mono text-sm w-6">
                    #{index + 1}
                  </span>
                  <span className="text-white font-medium">{player.name}</span>
                  {player.id === currentPlayer.id && (
                    <span className="text-purple-300 text-sm">(You)</span>
                  )}
                </div>
                <span className="text-white font-semibold">{player.score}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-purple-200">
          {gameState.currentRound < gameState.totalRounds 
            ? 'Next round starting soon...' 
            : 'Preparing final results...'}
        </p>
      </div>
    </div>
  );
}