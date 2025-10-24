import { z } from "zod";
import type { Card } from "@/components/PlayingCard";

// Types and Schemas
export const GameStateSchema = z.object({
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      chips: z.number(),
      cards: z
        .array(
          z.object({
            suit: z.string(),
            rank: z.string(),
          }),
        )
        .optional(),
      isActive: z.boolean(),
      isDealer: z.boolean(),
      isSmallBlind: z.boolean(),
      isBigBlind: z.boolean(),
      currentBet: z.number().optional(),
      isFolded: z.boolean().optional(),
    }),
  ),
  communityCards: z.array(
    z
      .object({
        suit: z.string(),
        rank: z.string(),
      })
      .nullable(),
  ),
  pot: z.number(),
  currentPlayerId: z.string(),
  dealerMessage: z.string(),
  deck: z
    .array(
      z.object({
        suit: z.string(),
        rank: z.string(),
      }),
    )
    .optional(),
  currentRound: z
    .enum(["pre-flop", "flop", "turn", "river", "showdown"])
    .optional(),
  currentBet: z.number().optional(),
  lastRaiseAmount: z.number().optional(),
  minRaise: z.number().optional(),
  smallBlindAmount: z.number().optional(),
  bigBlindAmount: z.number().optional(),
  dealerButtonIndex: z.number().optional(),
});

export type GameState = z.infer<typeof GameStateSchema>;

export interface Player {
  id: string;
  name: string;
  chips: number;
  cards?: Card[];
  isActive: boolean;
  isFolded?: boolean;
  currentBet?: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
}

export interface HandResult {
  playerId: string;
  handRank: number;
  handName: string;
  cards: Card[];
}

// Constants
const SUITS: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
const RANKS: Card["rank"][] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const SMALL_BLIND = 25;
const BIG_BLIND = 50;

// Deck Management
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Game Initialization
export function initializeGame(
  botCount: number,
  startingChips: number,
): GameState {
  const players: Player[] = [];
  players.push({
    id: "player",
    name: "You",
    chips: startingChips,
    isActive: true,
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
  });

  for (let i = 0; i < botCount; i++) {
    players.push({
      id: `bot${i + 1}`,
      name: `AI Bot ${i + 1}`,
      chips: startingChips,
      isActive: false,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
    });
  }

  // Assign dealer, small blind, and big blind
  const dealerIndex = Math.floor(Math.random() * players.length);
  const smallBlindIndex = (dealerIndex + 1) % players.length;
  const bigBlindIndex = (dealerIndex + 2) % players.length;

  players[dealerIndex].isDealer = true;
  players[smallBlindIndex].isSmallBlind = true;
  players[bigBlindIndex].isBigBlind = true;

  players[smallBlindIndex].chips -= SMALL_BLIND;
  players[smallBlindIndex].currentBet = SMALL_BLIND;
  players[bigBlindIndex].chips -= BIG_BLIND;
  players[bigBlindIndex].currentBet = BIG_BLIND;

  const pot = SMALL_BLIND + BIG_BLIND;
  const deck = shuffleDeck(createDeck());

  return {
    players,
    communityCards: [null, null, null, null, null],
    pot,
    currentPlayerId: players[(bigBlindIndex + 1) % players.length].id,
    dealerMessage:
      "Welcome to the table! Let's see if you've got what it takes.",
    deck,
    currentRound: "pre-flop",
    currentBet: BIG_BLIND,
    lastRaiseAmount: BIG_BLIND,
    minRaise: BIG_BLIND,
    smallBlindAmount: SMALL_BLIND,
    bigBlindAmount: BIG_BLIND,
    dealerButtonIndex: dealerIndex,
  };
}

// Card Dealing
export function dealHoleCards(gameState: GameState): GameState {
  const newState = { ...gameState };
  const deck = [...(newState.deck || [])];

  newState.players = newState.players.map((player) => {
    if (player.isFolded) return player;
    const cards: Card[] = [deck.pop() as Card, deck.pop() as Card];
    return { ...player, cards };
  });

  newState.deck = deck;
  newState.dealerMessage = "Hole cards dealt. Place your bets!";
  return newState;
}

export function dealFlop(gameState: GameState): GameState {
  const newState = { ...gameState };
  const deck = [...(newState.deck || [])];

  // Burn one card
  deck.pop();

  // Deal three community cards
  newState.communityCards = [
    deck.pop() as Card,
    deck.pop() as Card,
    deck.pop() as Card,
    null,
    null,
  ];

  newState.deck = deck;
  newState.currentRound = "flop";
  newState.currentBet = 0;
  newState.lastRaiseAmount = BIG_BLIND;

  // Reset player bets
  newState.players = newState.players.map((p) => ({ ...p, currentBet: 0 }));

  // Set first active player after dealer as current
  const dealerIndex = newState.dealerButtonIndex || 0;
  let nextPlayerIndex = (dealerIndex + 1) % newState.players.length;
  while (newState.players[nextPlayerIndex].isFolded) {
    nextPlayerIndex = (nextPlayerIndex + 1) % newState.players.length;
  }
  newState.currentPlayerId = newState.players[nextPlayerIndex].id;

  newState.dealerMessage = "The flop is on the table. What's your move?";
  return newState;
}

export function dealTurn(gameState: GameState): GameState {
  const newState = { ...gameState };
  const deck = [...(newState.deck || [])];

  // Burn one card
  deck.pop();

  // Deal turn card
  newState.communityCards = [
    newState.communityCards[0],
    newState.communityCards[1],
    newState.communityCards[2],
    deck.pop() as Card,
    null,
  ];

  newState.deck = deck;
  newState.currentRound = "turn";
  newState.currentBet = 0;
  newState.lastRaiseAmount = BIG_BLIND;

  // Reset player bets
  newState.players = newState.players.map((p) => ({ ...p, currentBet: 0 }));

  // Set first active player after dealer as current
  const dealerIndex = newState.dealerButtonIndex || 0;
  let nextPlayerIndex = (dealerIndex + 1) % newState.players.length;
  while (newState.players[nextPlayerIndex].isFolded) {
    nextPlayerIndex = (nextPlayerIndex + 1) % newState.players.length;
  }
  newState.currentPlayerId = newState.players[nextPlayerIndex].id;

  newState.dealerMessage = "Turn card revealed. The stakes are rising!";
  return newState;
}

export function dealRiver(gameState: GameState): GameState {
  const newState = { ...gameState };
  const deck = [...(newState.deck || [])];

  // Burn one card
  deck.pop();

  // Deal river card
  newState.communityCards = [
    newState.communityCards[0],
    newState.communityCards[1],
    newState.communityCards[2],
    newState.communityCards[3],
    deck.pop() as Card,
  ];

  newState.deck = deck;
  newState.currentRound = "river";
  newState.currentBet = 0;
  newState.lastRaiseAmount = BIG_BLIND;

  // Reset player bets
  newState.players = newState.players.map((p) => ({ ...p, currentBet: 0 }));

  // Set first active player after dealer as current
  const dealerIndex = newState.dealerButtonIndex || 0;
  let nextPlayerIndex = (dealerIndex + 1) % newState.players.length;
  while (newState.players[nextPlayerIndex].isFolded) {
    nextPlayerIndex = (nextPlayerIndex + 1) % newState.players.length;
  }
  newState.currentPlayerId = newState.players[nextPlayerIndex].id;

  newState.dealerMessage = "River card is down! Time for the final showdown!";
  return newState;
}

// Player Actions
export function playerFold(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState };
  newState.players = newState.players.map((p) =>
    p.id === playerId ? { ...p, isFolded: true, isActive: false } : p,
  );

  const player = newState.players.find((p) => p.id === playerId);
  newState.dealerMessage = `${player?.name} folds. Smart move... or is it?`;

  return moveToNextPlayer(newState);
}

export function playerCall(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState };
  const currentBet = newState.currentBet || 0;

  newState.players = newState.players.map((p) => {
    if (p.id === playerId) {
      const callAmount = currentBet - (p.currentBet || 0);
      const actualCall = Math.min(callAmount, p.chips);
      return {
        ...p,
        chips: p.chips - actualCall,
        currentBet: (p.currentBet || 0) + actualCall,
      };
    }
    return p;
  });

  const player = newState.players.find((p) => p.id === playerId);
  const callAmount =
    currentBet -
    (gameState.players.find((p) => p.id === playerId)?.currentBet || 0);
  newState.pot += callAmount;
  newState.dealerMessage = `${player?.name} calls $${callAmount}. Let's see if it pays off!`;

  return moveToNextPlayer(newState);
}

export function playerCheck(gameState: GameState, playerId: string): GameState {
  const newState = { ...gameState };
  const player = newState.players.find((p) => p.id === playerId);
  newState.dealerMessage = `${player?.name} checks. Playing it safe, huh?`;

  return moveToNextPlayer(newState);
}

export function playerRaise(
  gameState: GameState,
  playerId: string,
  raiseAmount: number,
): GameState {
  const newState = { ...gameState };
  const currentBet = newState.currentBet || 0;

  newState.players = newState.players.map((p) => {
    if (p.id === playerId) {
      const totalBet = currentBet + raiseAmount;
      const amountToAdd = totalBet - (p.currentBet || 0);
      const actualAmount = Math.min(amountToAdd, p.chips);
      return {
        ...p,
        chips: p.chips - actualAmount,
        currentBet: (p.currentBet || 0) + actualAmount,
      };
    }
    return p;
  });

  const player = newState.players.find((p) => p.id === playerId);
  const amountAdded =
    (player?.currentBet || 0) -
    (gameState.players.find((p) => p.id === playerId)?.currentBet || 0);
  newState.pot += amountAdded;
  newState.currentBet = player?.currentBet || 0;
  newState.lastRaiseAmount = raiseAmount;
  newState.dealerMessage = `${player?.name} raises to $${player?.currentBet}! Things are heating up!`;

  // Reset active status for all non-folded players except raiser
  newState.players = newState.players.map((p) => ({
    ...p,
    isActive: p.id === playerId ? true : p.isFolded ? false : false,
  }));

  return moveToNextPlayer(newState);
}

// Game Flow
function moveToNextPlayer(gameState: GameState): GameState {
  const newState = { ...gameState };
  const currentPlayerIndex = newState.players.findIndex(
    (p) => p.id === newState.currentPlayerId,
  );
  let nextPlayerIndex = (currentPlayerIndex + 1) % newState.players.length;

  // Find next non-folded player
  let attempts = 0;
  while (
    newState.players[nextPlayerIndex].isFolded &&
    attempts < newState.players.length
  ) {
    nextPlayerIndex = (nextPlayerIndex + 1) % newState.players.length;
    attempts++;
  }

  // Check if betting round is complete
  if (isBettingRoundComplete(newState)) {
    return advanceToNextRound(newState);
  }

  newState.currentPlayerId = newState.players[nextPlayerIndex].id;
  newState.players = newState.players.map((p) => ({
    ...p,
    isActive: p.id === newState.currentPlayerId && !p.isFolded,
  }));

  return newState;
}

function isBettingRoundComplete(gameState: GameState): boolean {
  const activePlayers = gameState.players.filter((p) => !p.isFolded);

  // If only one player left, round is complete
  if (activePlayers.length === 1) {
    return true;
  }

  const currentBet = gameState.currentBet || 0;

  // All active players must have matched the current bet
  const allMatched = activePlayers.every(
    (p) => (p.currentBet || 0) === currentBet || p.chips === 0,
  );

  return allMatched;
}

function advanceToNextRound(gameState: GameState): GameState {
  const newState = { ...gameState };

  // Check if only one player remains
  const activePlayers = newState.players.filter((p) => !p.isFolded);
  if (activePlayers.length === 1) {
    return endHand(newState, activePlayers[0].id);
  }

  switch (newState.currentRound) {
    case "pre-flop":
      return dealFlop(newState);
    case "flop":
      return dealTurn(newState);
    case "turn":
      return dealRiver(newState);
    case "river":
      return performShowdown(newState);
    default:
      return newState;
  }
}

function endHand(gameState: GameState, winnerId: string): GameState {
  const newState = { ...gameState };
  const winner = newState.players.find((p) => p.id === winnerId);

  if (winner) {
    newState.players = newState.players.map((p) =>
      p.id === winnerId ? { ...p, chips: p.chips + newState.pot } : p,
    );
    newState.dealerMessage = `${winner.name} wins $${newState.pot}! Everyone else folded.`;
  }

  newState.currentRound = "showdown";
  return newState;
}

// AI Bot Logic
export function getAIAction(
  gameState: GameState,
  playerId: string,
): { action: "fold" | "call" | "check" | "raise"; raiseAmount?: number } {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player || !player.cards) {
    return { action: "fold" };
  }

  const currentBet = gameState.currentBet || 0;
  const playerBet = player.currentBet || 0;
  const callAmount = currentBet - playerBet;

  // Calculate hand strength (simplified)
  const handStrength = evaluateHandStrength(
    player.cards as Card[],
    gameState.communityCards.filter((c) => c !== null) as Card[],
  );

  // Calculate pot odds
  const potOdds =
    gameState.pot > 0 ? callAmount / (gameState.pot + callAmount) : 1;

  // Decision making based on hand strength and pot odds
  if (callAmount === 0) {
    // No bet to call
    if (handStrength > 0.7 && Math.random() > 0.3) {
      const raiseAmount = Math.min(
        gameState.bigBlindAmount || BIG_BLIND,
        player.chips - callAmount,
      );
      return { action: "raise", raiseAmount };
    }
    return { action: "check" };
  }

  if (callAmount > player.chips) {
    // Can't afford to call
    return { action: "fold" };
  }

  // Strong hand - likely to raise or call
  if (handStrength > 0.75) {
    if (
      Math.random() > 0.4 &&
      player.chips > callAmount + (gameState.minRaise || BIG_BLIND)
    ) {
      const raiseAmount = Math.min(
        Math.floor((gameState.minRaise || BIG_BLIND) * (1 + Math.random())),
        player.chips - callAmount,
      );
      return { action: "raise", raiseAmount };
    }
    return { action: "call" };
  }

  // Medium hand - consider pot odds
  if (handStrength > 0.4) {
    if (potOdds < 0.3 || Math.random() > 0.6) {
      return { action: "call" };
    }
    return { action: "fold" };
  }

  // Weak hand - mostly fold, sometimes bluff
  if (Math.random() > 0.85 && callAmount < player.chips * 0.1) {
    return { action: "call" };
  }

  return { action: "fold" };
}

function evaluateHandStrength(
  holeCards: Card[],
  communityCards: Card[],
): number {
  // Simplified hand strength evaluation
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 2) return 0;

  const rankValues: { [key: string]: number } = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  let strength = 0;

  // High cards
  const maxRank = Math.max(...holeCards.map((c) => rankValues[c.rank]));
  strength += (maxRank / 14) * 0.3;

  // Pairs in hole cards
  if (holeCards.length === 2 && holeCards[0].rank === holeCards[1].rank) {
    strength += 0.4;
  }

  // Suited hole cards
  if (holeCards.length === 2 && holeCards[0].suit === holeCards[1].suit) {
    strength += 0.1;
  }

  // Connected cards
  if (holeCards.length === 2) {
    const diff = Math.abs(
      rankValues[holeCards[0].rank] - rankValues[holeCards[1].rank],
    );
    if (diff === 1) strength += 0.15;
    if (diff === 2) strength += 0.1;
  }

  return Math.min(strength, 1);
}

// Hand Evaluation
function getRankValue(rank: Card["rank"]): number {
  const values: { [key: string]: number } = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return values[rank];
}

export function evaluateHand(cards: Card[]): {
  rank: number;
  name: string;
  values: number[];
} {
  if (cards.length < 5) {
    return {
      rank: 0,
      name: "High Card",
      values: cards.map((c) => getRankValue(c.rank)).sort((a, b) => b - a),
    };
  }

  const rankCounts: { [key: number]: number } = {};
  const suitCounts: { [key: string]: Card[] } = {
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: [],
  };

  cards.forEach((card) => {
    const value = getRankValue(card.rank);
    rankCounts[value] = (rankCounts[value] || 0) + 1;
    suitCounts[card.suit].push(card);
  });

  const sortedRanks = Object.entries(rankCounts).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return parseInt(b[0]) - parseInt(a[0]);
  });

  const isFlush = Object.values(suitCounts).some((suit) => suit.length >= 5);
  const sortedValues = cards
    .map((c) => getRankValue(c.rank))
    .sort((a, b) => b - a);

  // Check for straight
  const uniqueValues = Array.from(new Set(sortedValues)).sort((a, b) => b - a);
  let isStraight = false;
  let straightHigh = 0;

  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      isStraight = true;
      straightHigh = uniqueValues[i];
      break;
    }
  }

  // Check for wheel (A-2-3-4-5)
  if (
    !isStraight &&
    uniqueValues.includes(14) &&
    uniqueValues.includes(2) &&
    uniqueValues.includes(3) &&
    uniqueValues.includes(4) &&
    uniqueValues.includes(5)
  ) {
    isStraight = true;
    straightHigh = 5;
  }

  // Royal Flush
  if (isFlush && isStraight && straightHigh === 14) {
    return { rank: 9, name: "Royal Flush", values: [14] };
  }

  // Straight Flush
  if (isFlush && isStraight) {
    return { rank: 8, name: "Straight Flush", values: [straightHigh] };
  }

  // Four of a Kind
  if (sortedRanks[0][1] === 4) {
    return {
      rank: 7,
      name: "Four of a Kind",
      values: [parseInt(sortedRanks[0][0]), parseInt(sortedRanks[1][0])],
    };
  }

  // Full House
  if (sortedRanks[0][1] === 3 && sortedRanks[1][1] >= 2) {
    return {
      rank: 6,
      name: "Full House",
      values: [parseInt(sortedRanks[0][0]), parseInt(sortedRanks[1][0])],
    };
  }

  // Flush
  if (isFlush) {
    return { rank: 5, name: "Flush", values: sortedValues.slice(0, 5) };
  }

  // Straight
  if (isStraight) {
    return { rank: 4, name: "Straight", values: [straightHigh] };
  }

  // Three of a Kind
  if (sortedRanks[0][1] === 3) {
    return {
      rank: 3,
      name: "Three of a Kind",
      values: [
        parseInt(sortedRanks[0][0]),
        parseInt(sortedRanks[1][0]),
        parseInt(sortedRanks[2][0]),
      ],
    };
  }

  // Two Pair
  if (sortedRanks[0][1] === 2 && sortedRanks[1][1] === 2) {
    return {
      rank: 2,
      name: "Two Pair",
      values: [
        parseInt(sortedRanks[0][0]),
        parseInt(sortedRanks[1][0]),
        parseInt(sortedRanks[2][0]),
      ],
    };
  }

  // One Pair
  if (sortedRanks[0][1] === 2) {
    return {
      rank: 1,
      name: "One Pair",
      values: [
        parseInt(sortedRanks[0][0]),
        ...sortedValues
          .filter((v) => v !== parseInt(sortedRanks[0][0]))
          .slice(0, 3),
      ],
    };
  }

  // High Card
  return { rank: 0, name: "High Card", values: sortedValues.slice(0, 5) };
}

export function compareHands(
  hand1: ReturnType<typeof evaluateHand>,
  hand2: ReturnType<typeof evaluateHand>,
): number {
  if (hand1.rank !== hand2.rank) {
    return hand2.rank - hand1.rank;
  }

  for (let i = 0; i < Math.min(hand1.values.length, hand2.values.length); i++) {
    if (hand1.values[i] !== hand2.values[i]) {
      return hand2.values[i] - hand1.values[i];
    }
  }

  return 0;
}

// Showdown
export function performShowdown(gameState: GameState): GameState {
  const newState = { ...gameState };
  const activePlayers = newState.players.filter((p) => !p.isFolded);

  if (activePlayers.length === 0) {
    return newState;
  }

  if (activePlayers.length === 1) {
    return endHand(newState, activePlayers[0].id);
  }

  const communityCards = newState.communityCards.filter(
    (c) => c !== null,
  ) as Card[];

  const playerHands = activePlayers.map((player) => {
    const allCards = [...((player.cards as Card[]) || []), ...communityCards];
    const hand = evaluateHand(allCards);
    return {
      playerId: player.id,
      playerName: player.name,
      hand,
    };
  });

  // Sort by hand strength
  playerHands.sort((a, b) => compareHands(a.hand, b.hand));

  // Find all winners (in case of tie)
  const bestHand = playerHands[0].hand;
  const winners = playerHands.filter(
    (ph) => compareHands(ph.hand, bestHand) === 0,
  );

  const winAmount = Math.floor(newState.pot / winners.length);

  newState.players = newState.players.map((p) => {
    const isWinner = winners.some((w) => w.playerId === p.id);
    return isWinner ? { ...p, chips: p.chips + winAmount } : p;
  });

  if (winners.length === 1) {
    newState.dealerMessage = `${winners[0].playerName} wins with ${winners[0].hand.name}! $${winAmount} to the victor!`;
  } else {
    newState.dealerMessage = `It's a tie! ${winners.map((w) => w.playerName).join(" and ")} split the pot with ${bestHand.name}!`;
  }

  newState.currentRound = "showdown";
  return newState;
}

// Start new hand
export function startNewHand(gameState: GameState): GameState {
  const activePlayers = gameState.players.filter((p) => p.chips > 0);

  if (activePlayers.length < 2) {
    // Game over
    return gameState;
  }

  // Rotate dealer button
  const currentDealerIndex = gameState.dealerButtonIndex || 0;
  let newDealerIndex = (currentDealerIndex + 1) % gameState.players.length;

  // Find next player with chips
  while (gameState.players[newDealerIndex].chips === 0) {
    newDealerIndex = (newDealerIndex + 1) % gameState.players.length;
  }

  const smallBlindIndex = (newDealerIndex + 1) % gameState.players.length;
  const bigBlindIndex = (newDealerIndex + 2) % gameState.players.length;

  const newState: GameState = {
    ...gameState,
    communityCards: [null, null, null, null, null],
    pot: SMALL_BLIND + BIG_BLIND,
    currentRound: "pre-flop",
    currentBet: BIG_BLIND,
    lastRaiseAmount: BIG_BLIND,
    minRaise: BIG_BLIND,
    dealerButtonIndex: newDealerIndex,
    deck: shuffleDeck(createDeck()),
    dealerMessage: "New hand! May the cards be in your favor.",
  };

  // Reset players
  newState.players = newState.players.map((p, idx) => ({
    ...p,
    cards: undefined,
    currentBet: 0,
    isFolded: false,
    isActive: false,
    isDealer: idx === newDealerIndex,
    isSmallBlind: idx === smallBlindIndex,
    isBigBlind: idx === bigBlindIndex,
  }));

  // Post blinds
  newState.players = newState.players.map((p, idx) => {
    if (idx === smallBlindIndex) {
      return { ...p, chips: p.chips - SMALL_BLIND, currentBet: SMALL_BLIND };
    }
    if (idx === bigBlindIndex) {
      return { ...p, chips: p.chips - BIG_BLIND, currentBet: BIG_BLIND };
    }
    return p;
  });

  // Deal hole cards
  const dealtState = dealHoleCards(newState);

  // Set current player to first after big blind
  dealtState.currentPlayerId =
    dealtState.players[(bigBlindIndex + 1) % dealtState.players.length].id;
  dealtState.players = dealtState.players.map((p) => ({
    ...p,
    isActive: p.id === dealtState.currentPlayerId,
  }));

  return dealtState;
}

export function canCheck(gameState: GameState, playerId: string): boolean {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return false;

  const currentBet = gameState.currentBet || 0;
  const playerBet = player.currentBet || 0;

  return currentBet === playerBet;
}

export function getMinRaise(gameState: GameState): number {
  return gameState.minRaise || BIG_BLIND;
}

export function getCallAmount(gameState: GameState, playerId: string): number {
  const player = gameState.players.find((p) => p.id === playerId);
  if (!player) return 0;

  const currentBet = gameState.currentBet || 0;
  const playerBet = player.currentBet || 0;

  return Math.max(0, currentBet - playerBet);
}
