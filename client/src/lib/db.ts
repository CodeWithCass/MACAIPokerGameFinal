import { openDB } from 'idb';
import type { GameState } from './game';

const DB_NAME = 'poker-game';
const DB_VERSION = 1;
const STORE_NAME = 'gameState';

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveGameState(gameState: GameState) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put({ id: 'current', ...gameState });
  await tx.done;
}

export async function loadGameState(): Promise<GameState | null> {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const gameState = await store.get('current');
  await tx.done;
  return gameState;
}
