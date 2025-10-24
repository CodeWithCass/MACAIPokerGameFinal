import type { GameState } from "./game";
import {
  playerFold,
  playerCall,
  playerCheck,
  playerRaise,
  getAIAction,
  startNewHand,
  performShowdown,
} from "./game";
import { saveGameState } from "./db";

/**
 * Game Engine - Manages game flow and AI turns
 */

export class GameEngine {
  private gameState: GameState;
  private isProcessingAI: boolean = false;
  private aiDelay: number = 1500; // Delay between AI actions in ms

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  public getState(): GameState {
    return this.gameState;
  }

  public setState(state: GameState): void {
    this.gameState = state;
  }

  /**
   * Execute a player action and process AI turns
   */
  public async executePlayerAction(
    action: "fold" | "call" | "check" | "raise",
    playerId: string,
    raiseAmount?: number,
  ): Promise<GameState> {
    if (this.isProcessingAI) {
      return this.gameState;
    }

    // Execute player action
    switch (action) {
      case "fold":
        this.gameState = playerFold(this.gameState, playerId);
        break;
      case "call":
        this.gameState = playerCall(this.gameState, playerId);
        break;
      case "check":
        this.gameState = playerCheck(this.gameState, playerId);
        break;
      case "raise":
        if (raiseAmount !== undefined) {
          this.gameState = playerRaise(this.gameState, playerId, raiseAmount);
        }
        break;
    }

    // Save state after player action
    await saveGameState(this.gameState);

    // Process AI turns
    await this.processAITurns();

    return this.gameState;
  }

  /**
   * Process all AI player turns in sequence
   */
  private async processAITurns(): Promise<void> {
    this.isProcessingAI = true;

    while (this.shouldProcessAITurn()) {
      await this.delay(this.aiDelay);
      await this.executeAITurn();
    }

    this.isProcessingAI = false;
  }

  /**
   * Check if an AI turn should be processed
   */
  private shouldProcessAITurn(): boolean {
    // Check if game is in showdown
    if (this.gameState.currentRound === "showdown") {
      return false;
    }

    // Check if current player is AI
    const currentPlayer = this.gameState.players.find(
      (p) => p.id === this.gameState.currentPlayerId,
    );

    if (!currentPlayer) return false;

    // Human player's turn
    if (currentPlayer.id === "player") {
      return false;
    }

    // AI player's turn
    return !currentPlayer.isFolded;
  }

  /**
   * Execute a single AI turn
   */
  private async executeAITurn(): Promise<void> {
    const currentPlayerId = this.gameState.currentPlayerId;
    const aiDecision = getAIAction(this.gameState, currentPlayerId);

    switch (aiDecision.action) {
      case "fold":
        this.gameState = playerFold(this.gameState, currentPlayerId);
        break;
      case "call":
        this.gameState = playerCall(this.gameState, currentPlayerId);
        break;
      case "check":
        this.gameState = playerCheck(this.gameState, currentPlayerId);
        break;
      case "raise":
        if (aiDecision.raiseAmount !== undefined) {
          this.gameState = playerRaise(
            this.gameState,
            currentPlayerId,
            aiDecision.raiseAmount,
          );
        }
        break;
    }

    // Save state after AI action
    await saveGameState(this.gameState);
  }

  /**
   * Start a new hand
   */
  public async startNewHand(): Promise<GameState> {
    this.gameState = startNewHand(this.gameState);
    await saveGameState(this.gameState);

    // Process AI turns if first player is AI
    await this.processAITurns();

    return this.gameState;
  }

  /**
   * Trigger AI turn processing (useful after game initialization)
   */
  public async processAITurnsIfNeeded(): Promise<GameState> {
    await this.processAITurns();
    return this.gameState;
  }

  /**
   * Perform showdown and determine winner
   */
  public async performShowdown(): Promise<GameState> {
    this.gameState = performShowdown(this.gameState);
    await saveGameState(this.gameState);
    return this.gameState;
  }

  /**
   * Check if game is over (only one player has chips)
   */
  public isGameOver(): boolean {
    const playersWithChips = this.gameState.players.filter((p) => p.chips > 0);
    return playersWithChips.length <= 1;
  }

  /**
   * Get the winner of the game
   */
  public getGameWinner(): string | null {
    if (!this.isGameOver()) return null;

    const winner = this.gameState.players.find((p) => p.chips > 0);
    return winner ? winner.name : null;
  }

  /**
   * Delay helper for AI actions
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set AI delay
   */
  public setAIDelay(delay: number): void {
    this.aiDelay = delay;
  }

  /**
   * Check if hand is complete and ready for showdown
   */
  public isHandComplete(): boolean {
    return this.gameState.currentRound === "showdown";
  }

  /**
   * Get active players count
   */
  public getActivePlayersCount(): number {
    return this.gameState.players.filter((p) => !p.isFolded && p.chips > 0)
      .length;
  }

  /**
   * Get current betting round info
   */
  public getCurrentRoundInfo(): {
    round: string;
    currentBet: number;
    pot: number;
    minRaise: number;
  } {
    return {
      round: this.gameState.currentRound || "pre-flop",
      currentBet: this.gameState.currentBet || 0,
      pot: this.gameState.pot,
      minRaise: this.gameState.minRaise || 50,
    };
  }

  /**
   * Get player action options
   */
  public getPlayerActionOptions(playerId: string): {
    canFold: boolean;
    canCall: boolean;
    canCheck: boolean;
    canRaise: boolean;
    callAmount: number;
    minRaise: number;
    maxRaise: number;
  } {
    const player = this.gameState.players.find((p) => p.id === playerId);
    if (!player) {
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

    const currentBet = this.gameState.currentBet || 0;
    const playerBet = player.currentBet || 0;
    const callAmount = Math.max(0, currentBet - playerBet);
    const minRaise = this.gameState.minRaise || 50;

    return {
      canFold: true,
      canCall: callAmount > 0 && player.chips >= callAmount,
      canCheck: callAmount === 0,
      canRaise: player.chips > callAmount + minRaise,
      callAmount,
      minRaise,
      maxRaise: player.chips - callAmount,
    };
  }

  /**
   * Validate player action
   */
  public validatePlayerAction(
    action: "fold" | "call" | "check" | "raise",
    playerId: string,
    raiseAmount?: number,
  ): { valid: boolean; error?: string } {
    const options = this.getPlayerActionOptions(playerId);
    const player = this.gameState.players.find((p) => p.id === playerId);

    if (!player) {
      return { valid: false, error: "Player not found" };
    }

    if (player.isFolded) {
      return { valid: false, error: "Player has folded" };
    }

    if (this.gameState.currentPlayerId !== playerId) {
      return { valid: false, error: "Not player's turn" };
    }

    switch (action) {
      case "fold":
        return { valid: options.canFold };
      case "call":
        if (!options.canCall) {
          return { valid: false, error: "Cannot call - insufficient chips" };
        }
        return { valid: true };
      case "check":
        if (!options.canCheck) {
          return {
            valid: false,
            error: "Cannot check - there is a bet to call",
          };
        }
        return { valid: true };
      case "raise":
        if (!options.canRaise) {
          return { valid: false, error: "Cannot raise - insufficient chips" };
        }
        if (raiseAmount === undefined) {
          return { valid: false, error: "Raise amount not specified" };
        }
        if (raiseAmount < options.minRaise) {
          return {
            valid: false,
            error: `Raise must be at least $${options.minRaise}`,
          };
        }
        if (raiseAmount > options.maxRaise) {
          return {
            valid: false,
            error: `Raise cannot exceed $${options.maxRaise}`,
          };
        }
        return { valid: true };
      default:
        return { valid: false, error: "Invalid action" };
    }
  }

  /**
   * Get player by ID
   */
  public getPlayer(playerId: string) {
    return this.gameState.players.find((p) => p.id === playerId);
  }

  /**
   * Check if it's the human player's turn
   */
  public isHumanPlayerTurn(): boolean {
    return (
      this.gameState.currentPlayerId === "player" &&
      !this.isProcessingAI &&
      this.gameState.currentRound !== "showdown"
    );
  }

  /**
   * Get game statistics
   */
  public getGameStats(): {
    totalPlayers: number;
    activePlayers: number;
    eliminatedPlayers: number;
    pot: number;
    currentRound: string;
  } {
    const totalPlayers = this.gameState.players.length;
    const activePlayers = this.gameState.players.filter(
      (p) => !p.isFolded && p.chips > 0,
    ).length;
    const eliminatedPlayers = this.gameState.players.filter(
      (p) => p.chips === 0,
    ).length;

    return {
      totalPlayers,
      activePlayers,
      eliminatedPlayers,
      pot: this.gameState.pot,
      currentRound: this.gameState.currentRound || "pre-flop",
    };
  }
}

/**
 * Create a new game engine instance
 */
export function createGameEngine(gameState: GameState): GameEngine {
  return new GameEngine(gameState);
}

/**
 * Helper function to check if a player can perform an action
 */
export function canPerformAction(
  gameState: GameState,
  playerId: string,
  action: "fold" | "call" | "check" | "raise",
): boolean {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player || player.isFolded || gameState.currentPlayerId !== playerId) {
    return false;
  }

  const currentBet = gameState.currentBet || 0;
  const playerBet = player.currentBet || 0;
  const callAmount = Math.max(0, currentBet - playerBet);

  switch (action) {
    case "fold":
      return true;
    case "call":
      return player.chips >= callAmount && callAmount > 0;
    case "check":
      return callAmount === 0;
    case "raise":
      return player.chips > callAmount + (gameState.minRaise || 50);
    default:
      return false;
  }
}
