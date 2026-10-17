/* 收藏按钮（风格/妆容/发型/穿搭通用） */
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useApp } from '../store/AppStore'
import type { FavoriteType } from '../types'

export default function FavoriteButton({
  type,
  refId,
  name,
  className = '',
  label = '收藏',
}: {
  type: FavoriteType
  refId: string
  name: string
  className?: string
  label?: string
}) {
  const { toggleFavorite, isFavorite } = useApp()
  const active = isFavorite(type, refId)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggleFavorite(type, refId, name)
      }}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] transition-colors ${
        active
          ? 'bg-rose-600 text-white'
          : 'border border-cream-300 bg-white text-ink-700 hover:border-rose-400 hover:text-rose-700'
      } ${className}`}
    >
      {active ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {active ? '已收藏' : label}
    </button>
  )
}
