/* ============================================================
 * 应用全局状态：档案 / 推荐 / 收藏 的数据联动
 * 页面刷新后从 IndexedDB 恢复
 * ============================================================ */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Favorite, FavoriteType, ImageProfile, Recommendation } from '../types'
import * as db from './db'

interface AppState {
  ready: boolean
  profiles: ImageProfile[]
  recommendations: Recommendation[]
  favorites: Favorite[]
  closetItems: string[]
  setClosetItems: (ids: string[]) => Promise<void>
  currentProfile: ImageProfile | null
  lastRecommendation: Recommendation | null
  upsertProfile: (p: ImageProfile) => Promise<void>
  removeProfile: (id: string) => Promise<void>
  addRecommendation: (r: Recommendation) => Promise<void>
  removeRecommendation: (id: string) => Promise<void>
  toggleFavorite: (type: FavoriteType, refId: string, name: string) => Promise<void>
  isFavorite: (type: FavoriteType, refId: string) => boolean
  removeFavorite: (id: string) => Promise<void>
  resetAll: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [profiles, setProfiles] = useState<ImageProfile[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [closetItems, setCloset] = useState<string[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([db.getProfiles(), db.getRecommendations(), db.getFavorites(), db.getSetting<string[]>('closetItems')])
      .then(([p, r, f, closet]) => {
        if (!alive) return
        setProfiles(p)
        setRecommendations(r)
        setFavorites(f)
        setCloset(closet ?? [])
        setReady(true)
      })
      .catch((err) => {
        console.error('加载本地数据失败', err)
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  const upsertProfile = useCallback(async (p: ImageProfile) => {
    await db.saveProfile(p)
    setProfiles((prev) => {
      const others = prev.filter((x) => x.id !== p.id)
      return [p, ...others].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    })
  }, [])

  const removeProfile = useCallback(async (id: string) => {
    await db.deleteProfile(id)
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const addRecommendation = useCallback(async (r: Recommendation) => {
    await db.saveRecommendation(r)
    setRecommendations((prev) => [r, ...prev.filter((x) => x.id !== r.id)])
  }, [])

  const removeRecommendation = useCallback(async (id: string) => {
    await db.deleteRecommendation(id)
    setRecommendations((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const toggleFavorite = useCallback(async (type: FavoriteType, refId: string, name: string) => {
    const id = `${type}:${refId}`
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === id)
      if (exists) {
        void db.deleteFavorite(id)
        return prev.filter((f) => f.id !== id)
      }
      const fav: Favorite = { id, type, refId, name, createdAt: new Date().toISOString() }
      void db.saveFavorite(fav)
      return [fav, ...prev]
    })
  }, [])

  const removeFavorite = useCallback(async (id: string) => {
    await db.deleteFavorite(id)
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const isFavorite = useCallback(
    (type: FavoriteType, refId: string) => favorites.some((f) => f.type === type && f.refId === refId),
    [favorites],
  )

  const setClosetItems = useCallback(async (ids: string[]) => {
    setCloset(ids)
    await db.saveSetting('closetItems', ids)
  }, [])

  const resetAll = useCallback(async () => {
    await db.clearStore()
    setProfiles([])
    setRecommendations([])
    setFavorites([])
    setCloset([])
  }, [])

  const currentProfile = useMemo(() => profiles[0] ?? null, [profiles])
  const lastRecommendation = useMemo(() => recommendations[0] ?? null, [recommendations])

  const value = useMemo(
    () => ({
      ready,
      profiles,
      recommendations,
      favorites,
      closetItems,
      setClosetItems,
      currentProfile,
      lastRecommendation,
      upsertProfile,
      removeProfile,
      addRecommendation,
      removeRecommendation,
      toggleFavorite,
      isFavorite,
      removeFavorite,
      resetAll,
    }),
    [
      ready, profiles, recommendations, favorites, closetItems, setClosetItems, currentProfile, lastRecommendation,
      upsertProfile, removeProfile, addRecommendation, removeRecommendation,
      toggleFavorite, isFavorite, removeFavorite, resetAll,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp 必须在 AppProvider 内使用')
  return ctx
}
