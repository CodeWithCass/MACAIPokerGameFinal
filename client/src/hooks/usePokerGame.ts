import { useState, useEffect, useCallback } from "react";
import type { GameState } from "@/lib/game";
import {
  initializeGame,
  canCheck,
  getMinRaise,
  getCallAmount,
  dealHoleCards,
} from "@/lib/game";
import { GameEngine, createGameEngine } from "@/lib/gameEngine";
import { saveGameState, loadGameState } from "@/lib/db";

export function usePokerGame(
  initialBotCount: number = 3,
  initialChips: number = 1500,
) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize or load game
  useEffect(() => {
    const initGame = async () => {
      setIsLoading(true);
      try {
        // Try to load saved game
        const savedGame = await loadGameState();

        if (
          savedGame &&
          savedGame.players &&
          savedGame.players.length > 0 &&
          savedGame.deck
        ) {
          setGameState(savedGame);
          setGameEngine(createGameEngine(savedGame));
        }
        // Don't auto-create game - wait for user to click "Start Game"
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game");
      } finally {
        setIsLoading(false);
      }
    };

    initGame();
  }, []);

  // Update game engine when state changes
  useEffect(() => {
    if (gameState && gameEngine) {
      gameEngine.setState(gameState);
    }
  }, [gameState, gameEngine]);

  // Player Actions
  const fold = useCallback(async () => {
    if (!gameEngine || !gameState || isProcessing) return;

    setIsProcessing(true);
    try {
      const newState = await gameEngine.executePlayerAction("fold", "player");
      setGameState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fold");
    } finally {
      setIsProcessing(false);
    }
  }, [gameEngine, gameState, isProcessing]);

  const call = useCallback(async () => {
    if (!gameEngine || !gameState || isProcessing) return;

    setIsProcessing(true);
    try {
      const newState = await gameEngine.executePlayerAction("call", "player");
      setGameState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to call");
    } finally {
      setIsProcessing(false);
    }
  }, [gameEngine, gameState, isProcessing]);

  const check = useCallback(async () => {
    if (!gameEngine || !gameState || isProcessing) return;

    setIsProcessing(true);
    try {
      const newState = await gameEngine.executePlayerAction("check", "player");
      setGameState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check");
    } finally {
      setIsProcessing(false);
    }
  }, [gameEngine, gameState, isProcessing]);

  const raise = useCallback(
    async (amount: number) => {
      if (!gameEngine || !gameState || isProcessing) return;

      setIsProcessing(true);
      try {
        const validation = gameEngine.validatePlayerAction(
          "raise",
          "player",
          amount,
        );
        if (!validation.valid) {
          setError(validation.error || "Invalid raise");
          setIsProcessing(false);
          return;
        }

        const newState = await gameEngine.executePlayerAction(
          "raise",
          "player",
          amount,
        );
        setGameState(newState);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to raise");
      } finally {
        setIsProcessing(false);
      }
    },
    [gameEngine, gameState, isProcessing],
  );

  // Start new hand
  const startNewHand = useCallback(async () => {
    if (!gameEngine || isProcessing) return;

    setIsProcessing(true);
    try {
      const newState = await gameEngine.startNewHand();
      setGameState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start new hand");
    } finally {
      setIsProcessing(false);
    }
  }, [gameEngine, isProcessing]);

  // Start new game
  const startNewGame = useCallback(
    async (
      botCount: number = initialBotCount,
      chips: number = initialChips,
    ) => {
      setIsProcessing(true);
      try {
        let newGame = initializeGame(botCount, chips);
        // Deal hole cards immediately
        newGame = dealHoleCards(newGame);
        const engine = createGameEngine(newGame);
        setGameState(newGame);
        setGameEngine(engine);
        await saveGameState(newGame);

        // Process AI turns if the first player is AI
        const stateAfterAI = await engine.processAITurnsIfNeeded();
        setGameState(stateAfterAI);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start new game",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [initialBotCount, initialChips],
  );

  // Get action options for human player
  const getActionOptions = useCallback(() => {
    if (!gameEngine || !gameState) {
      return {
        canFold: false,
        canCall: false,
        canCheck: false,
        canRaise: false,
        callAmount: 0,
        minRaise: 0,
        maxRaise: 0,
      };
    }

    return gameEngine.getPlayerActionOptions("player");
  }, [gameEngine, gameState]);

  // Check if it's human player's turn
  const isPlayerTurn = useCallback(() => {
    if (!gameEngine) return false;
    return gameEngine.isHumanPlayerTurn();
  }, [gameEngine]);

  // Get current round info
  const getRoundInfo = useCallback(() => {
    if (!gameEngine) {
      return {
        round: "pre-flop",
        currentBet: 0,
        pot: 0,
        minRaise: 50,
      };
    }
    return gameEngine.getCurrentRoundInfo();
  }, [gameEngine]);

  // Get game stats
  const getStats = useCallback(() => {
    if (!gameEngine) {
      return {
        totalPlayers: 0,
        activePlayers: 0,
        eliminatedPlayers: 0,
        pot: 0,
        currentRound: "pre-flop",
      };
    }
    return gameEngine.getGameStats();
  }, [gameEngine]);

  // Check if game is over
  const isGameOver = useCallback(() => {
    if (!gameEngine) return false;
    return gameEngine.isGameOver();
  }, [gameEngine]);

  // Get game winner
  const getWinner = useCallback(() => {
    if (!gameEngine) return null;
    return gameEngine.getGameWinner();
  }, [gameEngine]);

  // Check if hand is complete
  const isHandComplete = useCallback(() => {
    if (!gameEngine) return false;
    return gameEngine.isHandComplete();
  }, [gameEngine]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get human player
  const getHumanPlayer = useCallback(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => p.id === "player") || null;
  }, [gameState]);

  // Get AI players
  const getAIPlayers = useCallback(() => {
    if (!gameState) return [];
    return gameState.players.filter((p) => p.id !== "player");
  }, [gameState]);

  // Helper functions for UI
  const canPlayerCheck = useCallback(() => {
    if (!gameState) return false;
    return canCheck(gameState, "player");
  }, [gameState]);

  const getPlayerCallAmount = useCallback(() => {
    if (!gameState) return 0;
    return getCallAmount(gameState, "player");
  }, [gameState]);

  const getPlayerMinRaise = useCallback(() => {
    if (!gameState) return 50;
    return getMinRaise(gameState);
  }, [gameState]);

  return {
    // State
    gameState,
    isLoading,
    error,
    isProcessing,

    // Actions
    fold,
    call,
    check,
    raise,
    startNewHand,
    startNewGame,
    clearError,

    // Getters
    getActionOptions,
    isPlayerTurn,
    getRoundInfo,
    getStats,
    isGameOver,
    getWinner,
    isHandComplete,
    getHumanPlayer,
    getAIPlayers,
    canPlayerCheck,
    getPlayerCallAmount,
    getPlayerMinRaise,
  };
}
