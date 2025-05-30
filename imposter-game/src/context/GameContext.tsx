// src/context/GameContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, Player } from '@/types/game';
import { useSocket } from './SocketContext';

interface GameContextType {
  gameState: GameState | null;
  currentPlayer: Player | null;
  isHost: boolean;
  error: string | null;
  joinGame: (gameCode: string, playerName: string) => void;
  createGame: (playerName: string, settings?: any) => void;
  startGame: () => void;
  submitAnswer: (playerId: string) => void;
  submitVote: (playerId: string) => void;
  leaveGame: () => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isHost = gameState?.hostId === currentPlayer?.id;

  useEffect(() => {
    if (!socket) return;

    // Game event listeners
    const onGameJoined = (data: { gameState: GameState; player: Player }) => {
      setGameState(data.gameState);
      setCurrentPlayer(data.player);
      setError(null);
    };

    const onGameCreated = (data: { gameState: GameState; player: Player }) => {
      setGameState(data.gameState);
      setCurrentPlayer(data.player);
      setError(null);
    };

    const onGameUpdated = (updatedGameState: GameState) => {
      setGameState(updatedGameState);
    };

    const onPlayerJoined = (data: { player: Player; gameState: GameState }) => {
      setGameState(data.gameState);
    };

    const onPlayerLeft = (data: { playerId: string; gameState: GameState }) => {
      setGameState(data.gameState);
    };

    const onGameStarted = (gameState: GameState) => {
      setGameState(gameState);
    };

    const onRoundStarted = (gameState: GameState) => {
      setGameState(gameState);
    };

    const onVotingStarted = (gameState: GameState) => {
      setGameState(gameState);
    };

    const onRoundEnded = (gameState: GameState) => {
      setGameState(gameState);
    };

    const onGameEnded = (gameState: GameState) => {
      setGameState(gameState);
    };

    const onError = (errorMessage: string) => {
      setError(errorMessage);
    };

    // Register event listeners
    socket.on('game-joined', onGameJoined);
    socket.on('game-created', onGameCreated);
    socket.on('game-updated', onGameUpdated);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('game-started', onGameStarted);
    socket.on('round-started', onRoundStarted);
    socket.on('voting-started', onVotingStarted);
    socket.on('round-ended', onRoundEnded);
    socket.on('game-ended', onGameEnded);
    socket.on('error', onError);

    return () => {
      socket.off('game-joined', onGameJoined);
      socket.off('game-created', onGameCreated);
      socket.off('game-updated', onGameUpdated);
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
      socket.off('game-started', onGameStarted);
      socket.off('round-started', onRoundStarted);
      socket.off('voting-started', onVotingStarted);
      socket.off('round-ended', onRoundEnded);
      socket.off('game-ended', onGameEnded);
      socket.off('error', onError);
    };
  }, [socket]);

  const joinGame = (gameCode: string, playerName: string) => {
    if (socket) {
      socket.emit('join-game', { gameCode: gameCode.toUpperCase(), playerName });
    }
  };

  const createGame = (playerName: string, settings?: any) => {
    if (socket) {
      socket.emit('create-game', { playerName, settings });
    }
  };

  const startGame = () => {
    if (socket && gameState) {
      socket.emit('start-game', { gameId: gameState.id });
    }
  };

  const submitAnswer = (playerId: string) => {
    if (socket && gameState) {
      socket.emit('submit-answer', { gameId: gameState.id, playerId });
    }
  };

  const submitVote = (playerId: string) => {
    if (socket && gameState) {
      socket.emit('submit-vote', { gameId: gameState.id, playerId });
    }
  };

  const leaveGame = () => {
    if (socket && gameState) {
      socket.emit('leave-game', { gameId: gameState.id });
      setGameState(null);
      setCurrentPlayer(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentPlayer,
        isHost,
        error,
        joinGame,
        createGame,
        startGame,
        submitAnswer,
        submitVote,
        leaveGame,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};