'use client';
import { useGame } from '@/context/GameContext';
import { Copy, Play, Users, Crown, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function GameLobby() {
  const { gameState, currentPlayer, isHost, startGame, leaveGame } = useGame();
  const [copied, setCopied] = useState(false);

  if (!gameState || !currentPlayer) return null;

  const copyGameCode = async () => {
    try {
      await navigator.clipboard.writeText(gameState.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const canStart = gameState.players.length >= 3 && isHost;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-4">
            <p className="text-purple-200 text-sm mb-1">Game Code</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-white tracking-wider">
                {gameState.code}
              </span>
              <button
                onClick={copyGameCode}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Copy game code"
              >
                <Copy size={16} className="text-white" />
              </button>
            </div>
            {copied && (
              <p className="text-green-300 text-xs mt-1">Copied!</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users size={20} />
            Players ({gameState.players.length})
          </h2>
          <button
            onClick={leaveGame}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Leave
          </button>
        </div>
        
        <div className="space-y-3">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-white font-medium">{player.name}</span>
                {player.id === gameState.hostId && (
                  <Crown size={16} className="text-yellow-400" />
                )}
              </div>
              <span className="text-purple-200 text-sm">
                {player.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">How to Play</h3>
        <div className="space-y-2 text-purple-200 text-sm">
          <p>• Each round, answer the question by selecting a player</p>
          <p>• One player will be the imposter with a different answer</p>
          <p>• Vote for who you think is the imposter</p>
          <p>• Earn points for correct votes!</p>
        </div>
        
        {isHost ? (
          <div className="mt-6">
            <button
              onClick={startGame}
              disabled={!canStart}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <Play size={20} />
              {canStart ? 'Start Game' : `Need ${3 - gameState.players.length} more players`}
            </button>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-purple-200">Waiting for host to start the game...</p>
          </div>
        )}
      </div>
    </div>
  );
}