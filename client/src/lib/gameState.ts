import { Player } from "@/components/PlayerSeat";
import { Card } from "@/components/PlayingCard";

export interface GameState {
  id: string;
  players: Player[];
  communityCards: (Card | null)[];
  pot: number;
  currentPlayerIndex: number;
  currentBet: number;
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'ended';
  dealerIndex: number;
  smallBlind: number;
  bigBlind: number;
  deck: Card[];
  handHistory: HandAction[];
  lastAction?: HandAction;
  createdAt: Date;
  updatedAt: Date;
}

export interface HandAction {
  playerId: string;
  action: 'fold' | 'check' | 'call' | 'raise' | 'all-in';
  amount?: number;
  timestamp: Date;
}

class GameStateManager {
  private dbName = 'PokerGameDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create game states store
        if (!db.objectStoreNames.contains('gameStates')) {
          const gameStore = db.createObjectStore('gameStates', { keyPath: 'id' });
          gameStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // Create player stats store
        if (!db.objectStoreNames.contains('playerStats')) {
          const statsStore = db.createObjectStore('playerStats', { keyPath: 'playerId' });
        }
      };
    });
  }

  async saveGameState(gameState: GameState): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    gameState.updatedAt = new Date();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameStates'], 'readwrite');
      const store = transaction.objectStore('gameStates');
      const request = store.put(gameState);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadGameState(gameId: string): Promise<GameState | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameStates'], 'readonly');
      const store = transaction.objectStore('gameStates');
      const request = store.get(gameId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getLatestGame(): Promise<GameState | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameStates'], 'readonly');
      const store = transaction.objectStore('gameStates');
      const index = store.index('createdAt');
      const request = index.openCursor(null, 'prev');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value : null);
      };
    });
  }

  async deleteGameState(gameId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameStates'], 'readwrite');
      const store = transaction.objectStore('gameStates');
      const request = store.delete(gameId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async savePlayerStats(playerId: string, stats: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerStats'], 'readwrite');
      const store = transaction.objectStore('playerStats');
      const request = store.put({ playerId, ...stats, updatedAt: new Date() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadPlayerStats(playerId: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['playerStats'], 'readonly');
      const store = transaction.objectStore('playerStats');
      const request = store.get(playerId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
}

export const gameStateManager = new GameStateManager();