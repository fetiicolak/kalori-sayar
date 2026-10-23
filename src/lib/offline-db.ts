import { openDB, type DBSchema } from 'idb'
import type { FoodEntry } from '../types/domain'

export type PendingOperation =
  | { id: string; userId: string; type: 'create_entry'; createdAt: string; payload: FoodEntry }
  | { id: string; userId: string; type: 'delete_entry'; createdAt: string; payload: { entryId: string } }

interface KaloriDb extends DBSchema {
  dailyEntries: {
    key: string
    value: { key: string; userId: string; dateKey: string; entries: FoodEntry[]; cachedAt: string }
    indexes: { byUser: string }
  }
  operations: {
    key: string
    value: PendingOperation
    indexes: { byUser: string; byCreatedAt: string }
  }
}

const database = openDB<KaloriDb>('kalori-sayar-v1', 1, {
  upgrade(db) {
    const cacheStore = db.createObjectStore('dailyEntries', { keyPath: 'key' })
    cacheStore.createIndex('byUser', 'userId')

    const operationStore = db.createObjectStore('operations', { keyPath: 'id' })
    operationStore.createIndex('byUser', 'userId')
    operationStore.createIndex('byCreatedAt', 'createdAt')
  }
})

const cacheKey = (userId: string, dateKey: string) => `${userId}:${dateKey}`

export async function cacheDailyEntries(userId: string, dateKey: string, entries: FoodEntry[]): Promise<void> {
  const db = await database
  await db.put('dailyEntries', {
    key: cacheKey(userId, dateKey),
    userId,
    dateKey,
    entries,
    cachedAt: new Date().toISOString()
  })
}

export async function getCachedDailyEntries(userId: string, dateKey: string): Promise<FoodEntry[]> {
  const db = await database
  return (await db.get('dailyEntries', cacheKey(userId, dateKey)))?.entries ?? []
}

export async function enqueueOperation(operation: PendingOperation): Promise<void> {
  const db = await database
  await db.put('operations', operation)
}

export async function getPendingOperations(userId: string): Promise<PendingOperation[]> {
  const db = await database
  const operations = await db.getAllFromIndex('operations', 'byUser', userId)
  return operations.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function removePendingOperation(id: string): Promise<void> {
  const db = await database
  await db.delete('operations', id)
}

export async function pendingOperationCount(userId: string): Promise<number> {
  return (await getPendingOperations(userId)).length
}

export async function clearUserCache(userId: string): Promise<void> {
  const db = await database
  const cacheTransaction = db.transaction('dailyEntries', 'readwrite')
  for (const key of await cacheTransaction.store.index('byUser').getAllKeys(userId)) {
    await cacheTransaction.store.delete(key)
  }
  await cacheTransaction.done
}
