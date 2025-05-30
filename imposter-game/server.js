// server.js (in root directory)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// We'll store games in memory for now - in production, use Redis or a database
const games = new Map();
const playerSockets = new Map(); // socketId -> playerId mapping

// Sample questions
const SAMPLE_QUESTIONS = [
  { id: '1', text: 'Who would be the best leader in a zombie apocalypse?', category: 'survival' },
  { id: '2', text: 'Who would be most likely to become famous?', category: 'personality' },
  { id: '3', text: 'Who would survive longest on a deserted island?', category: 'survival' },
  { id: '4', text: 'Who would be the best at keeping a secret?', category: 'trust' },
  { id: '5', text: 'Who would win in a dance battle?', category: 'fun' },
  { id: '6', text: 'Who would be the best wingman/wingwoman?', category: 'social' },
  { id: '7', text: 'Who would be most likely to rob a bank?', category: 'mischief' },
  { id: '8', text: 'Who would make the best teacher?', category: 'personality' },
  { id: '9', text: 'Who would be the worst roommate?', category: 'lifestyle' },
  { id: '10', text: 'Who would be most likely to win a reality TV show?', category: 'entertainment' }
];

// Helper functions
const generateGameCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getRandomQuestionPair = (usedQuestionIds = []) => {
  const availableQuestions = SAMPLE_QUESTIONS.filter(q => !usedQuestionIds.includes(q.id));
  
  if (availableQuestions.length < 2) {
    const shuffled = [...SAMPLE_QUESTIONS].sort(() => 0.5 - Math.random());
    return {
      mainQuestion: shuffled[0],
      imposterQuestion: shuffled[1]
    };
  }
  
  const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
  return {
    mainQuestion: shuffled[0],
    imposterQuestion: shuffled[1]
  };
};

const selectRandomImposters = (playerIds, count = 1) => {
  const shuffled = [...playerIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handler(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  });

  const createGameState = (hostId, hostName, settings = {}) => {
    const gameCode = generateGameCode();
    const gameState = {
      id: gameCode,
      code: gameCode,
      players: [{
        id: hostId,
        name: hostName,
        score: 0,
        isConnected: true
      }],
      hostId,
      currentRound: 0,
      totalRounds: settings.totalRounds || 5,
      phase: 'lobby',
      currentQuestion: null,
      imposterQuestion: null,
      answers: {},
      votes: {},
      imposterIds: [],
      roundTimeLimit: settings.roundTimeLimit || 30000,
      votingTimeLimit: settings.votingTimeLimit || 20000,
      usedQuestionIds: []
    };
    
    games.set(gameCode, gameState);
    return gameState;
  };

  const addPlayerToGame = (gameCode, playerId, playerName) => {
    const game = games.get(gameCode);
    if (!game) return null;

    const existingPlayer = game.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.isConnected = true;
      return game;
    }

    game.players.push({
      id: playerId,
      name: playerName,
      score: 0,
      isConnected: true
    });

    return game;
  };

  const startNewRound = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return;

    game.currentRound++;
    game.phase = 'question';
    game.answers = {};
    game.votes = {};
    
    // Get a pair of different questions - one for regular players, one for imposter
    const { mainQuestion, imposterQuestion } = getRandomQuestionPair(game.usedQuestionIds);
    game.currentQuestion = mainQuestion;
    game.imposterQuestion = imposterQuestion;
    
    // Mark both questions as used
    game.usedQuestionIds.push(mainQuestion.id, imposterQuestion.id);
    
    // Select random imposter(s)
    const activePlayers = game.players.filter(p => p.isConnected);
    game.imposterIds = selectRandomImposters(activePlayers.map(p => p.id), 1);

    io.to(gameCode).emit('round-started', game);

    // Start round timer
    setTimeout(() => {
      if (games.get(gameCode)?.phase === 'question') {
        startVoting(gameCode);
      }
    }, game.roundTimeLimit);
  };

  const startVoting = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return;

    game.phase = 'voting';
    io.to(gameCode).emit('voting-started', game);

    setTimeout(() => {
      if (games.get(gameCode)?.phase === 'voting') {
        endRound(gameCode);
      }
    }, game.votingTimeLimit);
  };

  const endRound = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return;

    game.phase = 'results';

    const correctImposterId = game.imposterIds[0];
    Object.entries(game.votes).forEach(([playerId, votedForId]) => {
      if (votedForId === correctImposterId) {
        const player = game.players.find(p => p.id === playerId);
        if (player) {
          player.score += 100;
        }
      }
    });

    io.to(gameCode).emit('round-ended', game);

    setTimeout(() => {
      if (game.currentRound >= game.totalRounds) {
        endGame(gameCode);
      } else {
        startNewRound(gameCode);
      }
    }, 3000);
  };

  const endGame = (gameCode) => {
    const game = games.get(gameCode);
    if (!game) return;

    game.phase = 'finished';
    io.to(gameCode).emit('game-ended', game);
  };

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create-game', ({ playerName, settings }) => {
      try {
        const gameState = createGameState(socket.id, playerName, settings);
        playerSockets.set(socket.id, socket.id);
        
        socket.join(gameState.code);
        socket.emit('game-created', { gameState, player: gameState.players[0] });
        
        console.log(`Game created: ${gameState.code} by ${playerName}`);
      } catch (error) {
        socket.emit('error', 'Failed to create game');
        console.error('Create game error:', error);
      }
    });

    socket.on('join-game', ({ gameCode, playerName }) => {
      try {
        const game = games.get(gameCode.toUpperCase());
        if (!game) {
          socket.emit('error', 'Game not found');
          return;
        }

        if (game.phase !== 'lobby') {
          socket.emit('error', 'Game already in progress');
          return;
        }

        const updatedGame = addPlayerToGame(gameCode.toUpperCase(), socket.id, playerName);
        if (!updatedGame) {
          socket.emit('error', 'Failed to join game');
          return;
        }

        playerSockets.set(socket.id, socket.id);
        socket.join(gameCode.toUpperCase());

        const player = updatedGame.players.find(p => p.id === socket.id);
        socket.emit('game-joined', { gameState: updatedGame, player });
        socket.to(gameCode.toUpperCase()).emit('player-joined', { player, gameState: updatedGame });

        console.log(`${playerName} joined game: ${gameCode.toUpperCase()}`);
      } catch (error) {
        socket.emit('error', 'Failed to join game');
        console.error('Join game error:', error);
      }
    });

    socket.on('start-game', ({ gameId }) => {
      try {
        const game = games.get(gameId);
        if (!game) {
          socket.emit('error', 'Game not found');
          return;
        }

        if (game.hostId !== socket.id) {
          socket.emit('error', 'Only host can start the game');
          return;
        }

        if (game.players.length < 3) {
          socket.emit('error', 'Need at least 3 players to start');
          return;
        }

        game.phase = 'question';
        io.to(gameId).emit('game-started', game);
        
        setTimeout(() => startNewRound(gameId), 1000);

        console.log(`Game started: ${gameId}`);
      } catch (error) {
        socket.emit('error', 'Failed to start game');
        console.error('Start game error:', error);
      }
    });

    socket.on('submit-answer', ({ gameId, playerId }) => {
      try {
        const game = games.get(gameId);
        if (!game || game.phase !== 'question') return;

        game.answers[socket.id] = playerId;
        io.to(gameId).emit('game-updated', game);

        const activePlayers = game.players.filter(p => p.isConnected);
        if (Object.keys(game.answers).length >= activePlayers.length) {
          startVoting(gameId);
        }
      } catch (error) {
        console.error('Submit answer error:', error);
      }
    });

    socket.on('submit-vote', ({ gameId, playerId }) => {
      try {
        const game = games.get(gameId);
        if (!game || game.phase !== 'voting') return;

        game.votes[socket.id] = playerId;
        io.to(gameId).emit('game-updated', game);

        const activePlayers = game.players.filter(p => p.isConnected);
        if (Object.keys(game.votes).length >= activePlayers.length) {
          endRound(gameId);
        }
      } catch (error) {
        console.error('Submit vote error:', error);
      }
    });

    socket.on('leave-game', ({ gameId }) => {
      try {
        const game = games.get(gameId);
        if (!game) return;

        const player = game.players.find(p => p.id === socket.id);
        if (player) {
          player.isConnected = false;
          socket.leave(gameId);
          playerSockets.delete(socket.id);
          
          socket.to(gameId).emit('player-left', { playerId: socket.id, gameState: game });
          
          if (game.hostId === socket.id) {
            const newHost = game.players.find(p => p.isConnected);
            if (newHost) {
              game.hostId = newHost.id;
              io.to(gameId).emit('game-updated', game);
            }
          }
        }
      } catch (error) {
        console.error('Leave game error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      const playerId = playerSockets.get(socket.id);
      if (playerId) {
        games.forEach((game, gameCode) => {
          const player = game.players.find(p => p.id === playerId);
          if (player) {
            player.isConnected = false;
            socket.to(gameCode).emit('player-left', { playerId, gameState: game });
          }
        });
        
        playerSockets.delete(socket.id);
      }
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});