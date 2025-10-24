import { z } from 'zod';
import type { Player } from '@/components/PlayerSeat';

export const GameStateSchema = z.object({
  players: z.array(z.object({
    id: z.string(),
    name: z.string(),
    chips: z.number(),
    cards: z.array(z.object({
      suit: z.string(),
      rank: z.string(),
    })).optional(),
    isActive: z.boolean(),
    isDealer: z.boolean(),
    isSmallBlind: z.boolean(),
    isBigBlind: z.boolean(),
    currentBet: z.number().optional(),
    isFolded: z.boolean().optional(),
  })),
  communityCards: z.array(z.object({
    suit: z.string(),
    rank: z.string(),
  }).nullable()),
  pot: z.number(),
  currentPlayerId: z.string(),
  dealerMessage: z.string(),
});

export type GameState = z.infer<typeof GameStateSchema>;

export function initializeGame(botCount: number, startingChips: number): GameState {
  const players: Player[] = [];
  players.push({
    id: 'player',
    name: 'You',
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

  const smallBlindAmount = 25;
  const bigBlindAmount = 50;

  players[smallBlindIndex].chips -= smallBlindAmount;
  players[smallBlindIndex].currentBet = smallBlindAmount;
  players[bigBlindIndex].chips -= bigBlindAmount;
  players[bigBlindIndex].currentBet = bigBlindAmount;

  const pot = smallBlindAmount + bigBlindAmount;

  return {
    players,
    communityCards: [null, null, null, null, null],
    pot,
    currentPlayerId: players[(bigBlindIndex + 1) % players.length].id,
    dealerMessage: "Welcome to the table! Let's see if you've got what it takes.",
  };
}
