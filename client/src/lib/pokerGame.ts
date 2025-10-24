import { Card } from "@/components/PlayingCard";
import { Player } from "@/components/PlayerSeat";
import { GameState, HandAction, gameStateManager } from "./gameState";

class PokerGameService {
  private currentGame: GameState | null = null;
  private gameStateCallbacks: ((gameState: GameState) => void)[] = [];

  onGameStateChange(callback: (gameState: GameState) => void): () => void {
    this.gameStateCallbacks.push(callback);
    return () => {
      const index = this.gameStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.gameStateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyGameStateChange(): void {
    if (this.currentGame) {
      this.gameStateCallbacks.forEach(callback => callback(this.currentGame!));
    }
  }

  async initializeGame(playerCount: number, startingChips: number = 1500): Promise<GameState> {
    await gameStateManager.init();
    
    const players: Player[] = [
      {
        id: 'player',
        name: 'You',
        chips: startingChips,
        cards: [],
        isActive: true,
        currentBet: 0,
        isDealer: false,
        isFolded: false
      }
    ];

    // Add AI players
    for (let i = 1; i < playerCount; i++) {
      players.push({
        id: `bot${i}`,
        name: `AI Bot ${i}`,
        chips: startingChips,
        cards: [],
        isActive: false,
        currentBet: 0,
        isDealer: false,
        isFolded: false
      });
    }

    // Set dealer (last player in this case)
    players[players.length - 1].isDealer = true;
    
    const gameState: GameState = {
      id: `game_${Date.now()}`,
      players,
      communityCards: [null, null, null, null, null],
      pot: 0,
      currentPlayerIndex: 0, // Start with human player
      currentBet: 0,
      gamePhase: 'preflop',
      dealerIndex: players.length - 1,
      smallBlind: 25,
      bigBlind: 50,
      deck: this.createDeck(),
      handHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.currentGame = gameState;
    await this.dealNewHand();
    return this.currentGame;
  }

  async loadGame(gameId?: string): Promise<GameState | null> {
    await gameStateManager.init();
    
    if (gameId) {
      this.currentGame = await gameStateManager.loadGameState(gameId);
    } else {
      this.currentGame = await gameStateManager.getLatestGame();
    }
    
    return this.currentGame;
  }

  async saveCurrentGame(): Promise<void> {
    if (!this.currentGame) throw new Error('No active game to save');
    await gameStateManager.saveGameState(this.currentGame);
    this.notifyGameStateChange();
  }

  private createDeck(): Card[] {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: Card['rank'][] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async dealNewHand(): Promise<void> {
    if (!this.currentGame) return;

    // Reset for new hand
    this.currentGame.deck = this.shuffleDeck(this.createDeck());
    this.currentGame.communityCards = [null, null, null, null, null];
    this.currentGame.pot = 0;
    this.currentGame.currentBet = this.currentGame.bigBlind;
    this.currentGame.gamePhase = 'preflop';
    this.currentGame.handHistory = [];

    // Reset players
    this.currentGame.players.forEach(player => {
      player.cards = [];
      player.currentBet = 0;
      player.isFolded = false;
      player.isActive = false;
    });

    // Deal 2 cards to each player
    let deckIndex = 0;
    for (let i = 0; i < 2; i++) {
      for (const player of this.currentGame.players) {
        if (!player.isFolded) {
          if (!player.cards) player.cards = [];
          player.cards.push(this.currentGame.deck[deckIndex++]);
        }
      }
    }

    // Post blinds
    await this.postBlinds();
    
    // Set first active player (after big blind)
    const bigBlindIndex = (this.currentGame.dealerIndex + 2) % this.currentGame.players.length;
    this.currentGame.currentPlayerIndex = (bigBlindIndex + 1) % this.currentGame.players.length;
    this.currentGame.players[this.currentGame.currentPlayerIndex].isActive = true;

    await this.saveCurrentGame();
  }

  private async postBlinds(): Promise<void> {
    if (!this.currentGame) return;

    const smallBlindIndex = (this.currentGame.dealerIndex + 1) % this.currentGame.players.length;
    const bigBlindIndex = (this.currentGame.dealerIndex + 2) % this.currentGame.players.length;

    // Small blind
    const smallBlindPlayer = this.currentGame.players[smallBlindIndex];
    smallBlindPlayer.currentBet = this.currentGame.smallBlind;
    smallBlindPlayer.chips -= this.currentGame.smallBlind;
    this.currentGame.pot += this.currentGame.smallBlind;

    // Big blind
    const bigBlindPlayer = this.currentGame.players[bigBlindIndex];
    bigBlindPlayer.currentBet = this.currentGame.bigBlind;
    bigBlindPlayer.chips -= this.currentGame.bigBlind;
    this.currentGame.pot += this.currentGame.bigBlind;

    // Record actions
    this.currentGame.handHistory.push({
      playerId: smallBlindPlayer.id,
      action: 'call',
      amount: this.currentGame.smallBlind,
      timestamp: new Date()
    });

    this.currentGame.handHistory.push({
      playerId: bigBlindPlayer.id,
      action: 'call',
      amount: this.currentGame.bigBlind,
      timestamp: new Date()
    });
  }

  async playerFold(): Promise<GameState> {
    if (!this.currentGame) throw new Error('No active game');

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    currentPlayer.isFolded = true;
    currentPlayer.isActive = false;

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'fold',
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
    return this.currentGame;
  }

  async playerCheck(): Promise<GameState> {
    if (!this.currentGame) throw new Error('No active game');

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    
    // Can only check if no bet to call
    if (currentPlayer.currentBet! < this.currentGame.currentBet) {
      throw new Error('Cannot check when there is a bet to call');
    }

    currentPlayer.isActive = false;

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'check',
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
    return this.currentGame;
  }

  async playerCall(): Promise<GameState> {
    if (!this.currentGame) throw new Error('No active game');

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    const callAmount = this.currentGame.currentBet - (currentPlayer.currentBet || 0);

    if (callAmount > currentPlayer.chips) {
      throw new Error('Not enough chips to call');
    }

    currentPlayer.chips -= callAmount;
    currentPlayer.currentBet = this.currentGame.currentBet;
    currentPlayer.isActive = false;
    this.currentGame.pot += callAmount;

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'call',
      amount: callAmount,
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
    return this.currentGame;
  }

  async playerRaise(raiseAmount: number): Promise<GameState> {
    if (!this.currentGame) throw new Error('No active game');

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    const totalBet = Math.max(raiseAmount, this.currentGame.currentBet * 2);
    const amountToAdd = totalBet - (currentPlayer.currentBet || 0);

    if (amountToAdd > currentPlayer.chips) {
      throw new Error('Not enough chips to raise');
    }

    if (totalBet <= this.currentGame.currentBet) {
      throw new Error('Raise amount must be higher than current bet');
    }

    currentPlayer.chips -= amountToAdd;
    currentPlayer.currentBet = totalBet;
    currentPlayer.isActive = false;
    this.currentGame.pot += amountToAdd;
    this.currentGame.currentBet = totalBet;

    // Reactivate other players for the new betting round
    this.currentGame.players.forEach(player => {
      if (!player.isFolded && player.id !== currentPlayer.id) {
        player.isActive = false; // They'll need to act again
      }
    });

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'raise',
      amount: totalBet,
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
    return this.currentGame;
  }

  private async moveToNextPlayer(): Promise<void> {
    if (!this.currentGame) return;

    // Check if betting round is complete
    const activePlayers = this.currentGame.players.filter(p => !p.isFolded);
    const playersWhoNeedToAct = activePlayers.filter(p => 
      (p.currentBet || 0) < this.currentGame!.currentBet && !p.isFolded
    );

    if (playersWhoNeedToAct.length === 0 || activePlayers.length === 1) {
      // Betting round complete, move to next phase
      await this.moveToNextPhase();
      return;
    }

    // Find next active player
    let nextPlayerIndex = (this.currentGame.currentPlayerIndex + 1) % this.currentGame.players.length;
    while (this.currentGame.players[nextPlayerIndex].isFolded) {
      nextPlayerIndex = (nextPlayerIndex + 1) % this.currentGame.players.length;
    }

    // Clear current active player
    this.currentGame.players[this.currentGame.currentPlayerIndex].isActive = false;
    
    this.currentGame.currentPlayerIndex = nextPlayerIndex;
    this.currentGame.players[nextPlayerIndex].isActive = true;

    await this.saveCurrentGame();

    // If it's an AI player, schedule their move with a delay
    if (nextPlayerIndex !== 0) { // Assuming player is always index 0
      setTimeout(async () => {
        await this.makeAIMove();
      }, 2000); // 2 second delay to simulate thinking
    }
  }

  private async moveToNextPhase(): Promise<void> {
    if (!this.currentGame) return;

    const activePlayers = this.currentGame.players.filter(p => !p.isFolded);
    
    if (activePlayers.length === 1) {
      // Hand is over, award pot
      activePlayers[0].chips += this.currentGame.pot;
      await this.dealNewHand();
      return;
    }

    // Reset current bet for new phase
    this.currentGame.currentBet = 0;
    this.currentGame.players.forEach(p => p.currentBet = 0);

    switch (this.currentGame.gamePhase) {
      case 'preflop':
        this.currentGame.gamePhase = 'flop';
        this.dealCommunityCards(3);
        break;
      case 'flop':
        this.currentGame.gamePhase = 'turn';
        this.dealCommunityCards(1);
        break;
      case 'turn':
        this.currentGame.gamePhase = 'river';
        this.dealCommunityCards(1);
        break;
      case 'river':
        this.currentGame.gamePhase = 'showdown';
        await this.resolveShowdown();
        return;
    }

    // Start new betting round with first player after dealer
    this.currentGame.currentPlayerIndex = (this.currentGame.dealerIndex + 1) % this.currentGame.players.length;
    while (this.currentGame.players[this.currentGame.currentPlayerIndex].isFolded) {
      this.currentGame.currentPlayerIndex = (this.currentGame.currentPlayerIndex + 1) % this.currentGame.players.length;
    }
    this.currentGame.players[this.currentGame.currentPlayerIndex].isActive = true;
  }

  private dealCommunityCards(count: number): void {
    if (!this.currentGame) return;

    let deckIndex = this.currentGame.players.length * 2; // Skip dealt player cards
    let cardsDealt = 0;

    // Count already dealt community cards
    for (const card of this.currentGame.communityCards) {
      if (card) cardsDealt++;
    }

    deckIndex += cardsDealt;

    // Deal new community cards
    for (let i = 0; i < count; i++) {
      const cardIndex = this.currentGame.communityCards.findIndex(card => card === null);
      if (cardIndex !== -1) {
        this.currentGame.communityCards[cardIndex] = this.currentGame.deck[deckIndex++];
      }
    }
  }

  private async resolveShowdown(): Promise<void> {
    if (!this.currentGame) return;

    // For simplicity, just award to the player with the most chips
    // In a real implementation, you'd evaluate poker hands
    const activePlayers = this.currentGame.players.filter(p => !p.isFolded);
    const winner = activePlayers.reduce((prev, current) => 
      (prev.chips > current.chips) ? prev : current
    );

    winner.chips += this.currentGame.pot;
    await this.dealNewHand();
  }

  private async makeAIMove(): Promise<void> {
    if (!this.currentGame) return;

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    const callAmount = this.currentGame.currentBet - (currentPlayer.currentBet || 0);

    // Simple AI logic - could be much more sophisticated
    const random = Math.random();
    
    if (callAmount === 0) {
      // Can check
      if (random < 0.7) {
        await this.aiCheck();
      } else {
        // Small raise
        const raiseAmount = this.currentGame.currentBet + this.currentGame.bigBlind;
        if (raiseAmount <= currentPlayer.chips) {
          await this.aiRaise(raiseAmount);
        } else {
          await this.aiCheck();
        }
      }
    } else {
      // Need to call, raise or fold
      if (random < 0.3) {
        await this.aiFold();
      } else if (random < 0.8) {
        if (callAmount <= currentPlayer.chips) {
          await this.aiCall();
        } else {
          await this.aiFold();
        }
      } else {
        // Try to raise
        const raiseAmount = this.currentGame.currentBet * 2;
        if (raiseAmount <= currentPlayer.chips) {
          await this.aiRaise(raiseAmount);
        } else if (callAmount <= currentPlayer.chips) {
          await this.aiCall();
        } else {
          await this.aiFold();
        }
      }
    }
  }

  private async aiFold(): Promise<void> {
    if (!this.currentGame) return;

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    currentPlayer.isFolded = true;
    currentPlayer.isActive = false;

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'fold',
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
  }

  private async aiCheck(): Promise<void> {
    if (!this.currentGame) return;

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    currentPlayer.isActive = false;

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'check',
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
  }

  private async aiCall(): Promise<void> {
    if (!this.currentGame) return;

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    const callAmount = this.currentGame.currentBet - (currentPlayer.currentBet || 0);

    currentPlayer.chips -= callAmount;
    currentPlayer.currentBet = this.currentGame.currentBet;
    currentPlayer.isActive = false;
    this.currentGame.pot += callAmount;

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'call',
      amount: callAmount,
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
  }

  private async aiRaise(raiseAmount: number): Promise<void> {
    if (!this.currentGame) return;

    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    const amountToAdd = raiseAmount - (currentPlayer.currentBet || 0);

    currentPlayer.chips -= amountToAdd;
    currentPlayer.currentBet = raiseAmount;
    currentPlayer.isActive = false;
    this.currentGame.pot += amountToAdd;
    this.currentGame.currentBet = raiseAmount;

    // Reactivate other players for the new betting round
    this.currentGame.players.forEach(player => {
      if (!player.isFolded && player.id !== currentPlayer.id) {
        player.isActive = false; // They'll need to act again
      }
    });

    const action: HandAction = {
      playerId: currentPlayer.id,
      action: 'raise',
      amount: raiseAmount,
      timestamp: new Date()
    };

    this.currentGame.handHistory.push(action);
    this.currentGame.lastAction = action;

    await this.moveToNextPlayer();
    await this.saveCurrentGame();
  }

  async playerTimeout(): Promise<GameState> {
    if (!this.currentGame) throw new Error('No active game');
    
    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    
    // If player can check, auto-check on timeout, otherwise fold
    if (this.canCheck()) {
      return this.playerCheck();
    } else {
      return this.playerFold();
    }
  }

  getCurrentGame(): GameState | null {
    return this.currentGame;
  }

  canCheck(): boolean {
    if (!this.currentGame) return false;
    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    return (currentPlayer.currentBet || 0) >= this.currentGame.currentBet;
  }

  getCallAmount(): number {
    if (!this.currentGame) return 0;
    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    return Math.max(0, this.currentGame.currentBet - (currentPlayer.currentBet || 0));
  }

  getMinRaise(): number {
    if (!this.currentGame) return 0;
    return this.currentGame.currentBet + this.currentGame.bigBlind;
  }

  getMaxRaise(): number {
    if (!this.currentGame) return 0;
    const currentPlayer = this.currentGame.players[this.currentGame.currentPlayerIndex];
    return currentPlayer.chips + (currentPlayer.currentBet || 0);
  }

  isPlayerTurn(): boolean {
    if (!this.currentGame) return false;
    return this.currentGame.players[this.currentGame.currentPlayerIndex]?.id === 'player';
  }

  getPlayerById(playerId: string): Player | undefined {
    if (!this.currentGame) return undefined;
    return this.currentGame.players.find(p => p.id === playerId);
  }
}

export const pokerGameService = new PokerGameService();