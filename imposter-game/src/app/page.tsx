// src/app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { useSocket } from '@/context/SocketContext';
import { Users, Plus, Play, Gamepad2, Target, Trophy, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GameLobby from '@/components/game/GameLobby';
import GameRoom from '@/components/game/GameRoom';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { gameState, createGame, joinGame, error, clearError } = useGame();
  const { isConnected } = useSocket();

  // Clear forms when switching views
  const resetForms = () => {
    setPlayerName('');
    setGameCode('');
    setShowJoinForm(false);
    setShowCreateForm(false);
    setIsLoading(false);
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setIsLoading(true);
      createGame(playerName.trim());
      // Don't reset loading here - let the game state change handle it
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && gameCode.trim()) {
      setIsLoading(true);
      joinGame(gameCode.trim(), playerName.trim());
      // Don't reset loading here - let the game state change handle it
    }
  };

  // Reset loading when game state changes or error occurs
  useEffect(() => {
    if (gameState || error) {
      setIsLoading(false);
    }
  }, [gameState, error]);

  // Show game room if player is in a game
  if (gameState) {
    return gameState.phase === 'lobby' ? <GameLobby /> : <GameRoom />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="text-8xl mb-6"
        >
          🎭
        </motion.div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Imposter Game
        </h1>
        
        <p className="text-xl md:text-2xl text-purple-200 mb-8 max-w-2xl mx-auto">
          The ultimate social deduction game. Find the imposter among your friends!
        </p>
        
        {/* Connection Status */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} shadow-lg`}>
            {isConnected && (
              <motion.div
                className="w-3 h-3 rounded-full bg-green-400"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
          <span className="text-purple-200 flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi size={16} />
                Connected & Ready
              </>
            ) : (
              <>
                <WifiOff size={16} />
                Connecting...
              </>
            )}
          </span>
        </motion.div>
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="max-w-md mx-auto mb-6"
          >
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl backdrop-blur-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">{error}</span>
                <button 
                  onClick={clearError} 
                  className="text-red-300 hover:text-red-100 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4">
        <AnimatePresence mode="wait">
          {!showJoinForm && !showCreateForm ? (
            <motion.div
              key="main-menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Action Buttons */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(34, 197, 94, 0.7)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateForm(true)}
                    disabled={!isConnected || isLoading}
                    className="w-full flex items-center justify-between bg-green-500/60 hover:bg-green-500/70 disabled:bg-gray-500/40 disabled:cursor-not-allowed text-white font-semibold py-5 px-6 rounded-xl transition-all shadow-lg border border-green-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Plus size={24} />
                      </div>
                      <div className="text-left">
                        <div className="text-lg">Create Game</div>
                        <div className="text-green-200 text-sm">Start a new room</div>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.7)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowJoinForm(true)}
                    disabled={!isConnected || isLoading}
                    className="w-full flex items-center justify-between bg-blue-500/60 hover:bg-blue-500/70 disabled:bg-gray-500/40 disabled:cursor-not-allowed text-white font-semibold py-5 px-6 rounded-xl transition-all shadow-lg border border-blue-400/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Users size={24} />
                      </div>
                      <div className="text-left">
                        <div className="text-lg">Join Game</div>
                        <div className="text-blue-200 text-sm">Enter room code</div>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </motion.button>
                </div>
                
                <div className="text-center pt-6">
                  <p className="text-purple-200 text-sm flex items-center justify-center gap-2">
                    <Users size={16} />
                    Need 3+ players to start
                  </p>
                </div>
              </div>
            </motion.div>
          ) : showCreateForm ? (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Game</h2>
              <form onSubmit={handleCreateGame} className="space-y-6">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-3">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={20}
                    className="w-full px-4 py-4 bg-white/20 text-white placeholder-purple-300/70 rounded-xl border border-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-purple-300 text-xs mt-2">This is how other players will see you</p>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={resetForms}
                    disabled={isLoading}
                    className="flex-1 py-4 px-4 bg-gray-500/60 hover:bg-gray-500/70 disabled:bg-gray-500/40 text-white rounded-xl transition-all font-medium"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!playerName.trim() || isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-green-500/60 hover:bg-green-500/70 disabled:bg-gray-500/40 text-white rounded-xl transition-all font-medium"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Play size={18} />
                        Create Room
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="join-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Join Game</h2>
              <form onSubmit={handleJoinGame} className="space-y-6">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-3">
                    Your Display Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={20}
                    className="w-full px-4 py-4 bg-white/20 text-white placeholder-purple-300/70 rounded-xl border border-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-3">
                    Game Room Code
                  </label>
                  <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full px-4 py-4 bg-white/20 text-white placeholder-purple-300/70 rounded-xl border border-purple-300/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-center text-2xl font-mono tracking-wider"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-purple-300 text-xs mt-2 text-center">Get this code from your friend who created the game</p>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={resetForms}
                    disabled={isLoading}
                    className="flex-1 py-4 px-4 bg-gray-500/60 hover:bg-gray-500/70 disabled:bg-gray-500/40 text-white rounded-xl transition-all font-medium"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!playerName.trim() || !gameCode.trim() || isLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-4 px-4 bg-blue-500/60 hover:bg-blue-500/70 disabled:bg-gray-500/40 text-white rounded-xl transition-all font-medium"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Users size={18} />
                        Join Room
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* How to Play Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="max-w-4xl mx-auto px-4 py-12"
      >
        <h3 className="text-2xl font-bold text-white text-center mb-8">How to Play</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
          >
            <div className="text-4xl mb-4">❓</div>
            <h4 className="text-white font-semibold mb-2">Answer Questions</h4>
            <p className="text-purple-200 text-sm">Each round, select a player who best fits the question</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
          >
            <div className="text-4xl mb-4">🎭</div>
            <h4 className="text-white font-semibold mb-2">Find the Imposter</h4>
            <p className="text-purple-200 text-sm">One player gets a different answer - vote for who you think it is!</p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h4 className="text-white font-semibold mb-2">Score Points</h4>
            <p className="text-purple-200 text-sm">Earn points for correct votes and climb the leaderboard!</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-purple-300 text-sm">
          A social deduction game for 3+ players • Best played with friends!
        </p>
      </footer>
    </div>
  );
}