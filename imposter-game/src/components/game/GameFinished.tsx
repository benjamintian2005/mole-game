'use client';
import { useGame } from '@/context/GameContext';
import { Trophy, Medal, Users, RotateCcw, Home } from 'lucide-react';

export default function GameFinished() {
  const { gameState, currentPlayer, leaveGame } = useGame();

  if (!gameState || !currentPlayer) return null;

  const sortedPlayers = gameState.players
    .filter(p => p.isConnected)
    .sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];
  const currentPlayerRank = sortedPlayers.findIndex(p => p.id === currentPlayer.id) + 1;
  const isWinner = winner?.id === currentPlayer.id;

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const handlePlayAgain = () => {
    // This would typically create a new game with the same players
    // For now, we'll just leave the current game
    leaveGame();
  };

  const handleBackToHome = () => {
    leaveGame();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Game Over!</h1>
        
        {isWinner ? (
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-xl p-6 mb-6">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-yellow-300 mb-2">Congratulations!</h2>
            <p className="text-yellow-200">You won the game!</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
            <div className="text-4xl mb-2">🎮</div>
            <h2 className="text-xl font-semibold text-white mb-2">Good Game!</h2>
            <p className="text-purple-200">You finished in {currentPlayerRank}{currentPlayerRank === 1 ? 'st' : currentPlayerRank === 2 ? 'nd' : currentPlayerRank === 3 ? 'rd' : 'th'} place</p>
          </div>
        )}
      </div>

      {/* Winner Announcement */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <div className="text-center">
          <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">🏆 Winner</h3>
          <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4">
            <p className="text-yellow-200 text-xl font-bold">{winner?.name}</p>
            <p className="text-yellow-300">Final Score: {winner?.score} points</p>
          </div>
        </div>
      </div>

      {/* Final Leaderboard */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Medal size={20} />
          Final Leaderboard
        </h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1;
            const isCurrentPlayer = player.id === currentPlayer.id;
            
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isCurrentPlayer 
                    ? 'border-purple-400 bg-purple-500/30' 
                    : rank === 1 
                    ? 'border-yellow-400/50 bg-yellow-400/20'
                    : rank === 2
                    ? 'border-gray-400/50 bg-gray-400/20'
                    : rank === 3
                    ? 'border-orange-400/50 bg-orange-400/20'
                    : 'border-white/20 bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl w-8 text-center">
                    {getMedalEmoji(rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-lg">
                        {player.name}
                      </span>
                      {isCurrentPlayer && (
                        <span className="text-purple-300 text-sm">(You)</span>
                      )}
                    </div>
                    <div className="text-sm opacity-75">
                      {rank === 1 && <span className="text-yellow-300">Champion</span>}
                      {rank === 2 && <span className="text-gray-300">Runner-up</span>}
                      {rank === 3 && <span className="text-orange-300">Third Place</span>}
                      {rank > 3 && <span className="text-purple-200">#{rank}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{player.score}</div>
                  <div className="text-purple-200 text-sm">points</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={20} />
          Game Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{gameState.totalRounds}</div>
            <div className="text-purple-200 text-sm">Rounds Played</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{gameState.players.length}</div>
            <div className="text-purple-200 text-sm">Players</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handlePlayAgain}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
        >
          <RotateCcw size={20} />
          Play Again
        </button>
        
        <button
          onClick={handleBackToHome}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
        >
          <Home size={20} />
          Back to Home
        </button>
      </div>

      <div className="text-center mt-6">
        <p className="text-purple-200 text-sm">
          Thanks for playing Imposter Game! 🎉
        </p>
      </div>
    </div>
  );
}