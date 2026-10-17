/* ============================================================
 * IndexedDB 本地持久化封装
 * 数据全部保存在浏览器本地，无需注册账号、不上传任何内容
 * ============================================================ */

import type { Favorite, ImageProfile, Recommendation } from '../types'

const DB_NAME = 'stylemuse'
const DB_VERSION = 2

export interface StyleMuseDB {
  profiles: ImageProfile
  recommendations: Recommendation
  favorites: Favorite
  settings: { key: string; value: unknown }
}

type StoreName = keyof StyleMuseDB

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('profiles')) {
        db.createObjectStore('profiles', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('recommendations')) {
        const rec = db.createObjectStore('recommendations', { keyPath: 'id' })
        rec.createIndex('profileId', 'profileId', { unique: false })
        rec.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains('favorites')) {
        const fav = db.createObjectStore('favorites', { keyPath: 'id' })
        fav.createIndex('type', 'type', { unique: false })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

let dbPromise: Promise<IDBDatabase> | null = null

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) dbPromise = openDB()
  return dbPromise
}

function tx<T>(
  store: StoreName,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return getDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode)
        const req = run(t.objectStore(store))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

function getAll<T>(store: StoreName): Promise<T[]> {
  return getDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const t = db.transaction(store, 'readonly')
        const req = t.objectStore(store).getAll()
        req.onsuccess = () => resolve(req.result as T[])
        req.onerror = () => reject(req.error)
      }),
  )
}

export async function saveProfile(p: ImageProfile): Promise<void> {
  await tx('profiles', 'readwrite', (s) => s.put(p))
}

export async function getProfiles(): Promise<ImageProfile[]> {
  const list = await getAll<ImageProfile>('profiles')
  return list.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function deleteProfile(id: string): Promise<void> {
  await tx('profiles', 'readwrite', (s) => s.delete(id))
}

export async function saveRecommendation(r: Recommendation): Promise<void> {
  await tx('recommendations', 'readwrite', (s) => s.put(r))
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const list = await getAll<Recommendation>('recommendations')
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function deleteRecommendation(id: string): Promise<void> {
  await tx('recommendations', 'readwrite', (s) => s.delete(id))
}

export async function saveFavorite(f: Favorite): Promise<void> {
  await tx('favorites', 'readwrite', (s) => s.put(f))
}

export async function getFavorites(): Promise<Favorite[]> {
  const list = await getAll<Favorite>('favorites')
  return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export async function deleteFavorite(id: string): Promise<void> {
  await tx('favorites', 'readwrite', (s) => s.delete(id))
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  await tx('settings', 'readwrite', (s) => s.put({ key, value }))
}

export async function getSetting<T>(key: string): Promise<T | null> {
  return getDB().then(
    (db) =>
      new Promise<T | null>((resolve, reject) => {
        const t = db.transaction('settings', 'readonly')
        const req = t.objectStore('settings').get(key)
        req.onsuccess = () => resolve((req.result as { value: T } | undefined)?.value ?? null)
        req.onerror = () => reject(req.error)
      }),
  )
}

export async function clearStore(): Promise<void> {
  const db = await getDB()
  await Promise.all(
    ['profiles', 'recommendations', 'favorites', 'settings'].map(
      (s) =>
        new Promise<void>((resolve, reject) => {
          const t = db.transaction(s, 'readwrite')
          t.objectStore(s).clear()
          t.oncomplete = () => resolve()
          t.onerror = () => reject(t.error)
        }),
    ),
  )
}
