/* 配色色板展示 */
import type { StylePalette } from '../types'

export function PaletteSwatches({
  palette,
  size = 'md',
}: {
  palette: StylePalette[]
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizes = { sm: 'h-5', md: 'h-7', lg: 'h-10' }
  return (
    <div className="flex flex-wrap gap-2">
      {palette.map((c) => (
        <div key={c.hex} className="flex flex-col items-center gap-1">
          <div
            className={`${sizes[size]} w-10 rounded-md border border-ink-900/10`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
          <span className="text-[11px] text-ink-500">{c.name}</span>
        </div>
      ))}
    </div>
  )
}

export function ColorDots({ hexes, size = 'sm' }: { hexes: string[]; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
  return (
    <div className="flex flex-wrap gap-1.5">
      {hexes.map((h) => (
        <span key={h} className={`${s} rounded-full border border-ink-900/10`} style={{ backgroundColor: h }} />
      ))}
    </div>
  )
}
