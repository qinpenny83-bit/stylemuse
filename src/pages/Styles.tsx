import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { STYLES, STYLE_GROUPS } from '../data/styles'
import SmartImage from '../components/SmartImage'
import { PaletteSwatches } from '../components/Palette'
import { EmptyState } from '../components/Feedback'

export default function Styles() {
  const [group, setGroup] = useState<string>('全部')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return STYLES.filter((s) => {
      const matchGroup = group === '全部' || s.group === group
      const q = query.trim()
      const matchQuery =
        !q ||
        s.name.includes(q) ||
        s.enName.toLowerCase().includes(q.toLowerCase()) ||
        s.keywords.some((k) => k.includes(q)) ||
        s.tagline.includes(q)
      return matchGroup && matchQuery
    })
  }, [group, query])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <p className="eyebrow mb-2 text-rose-600">Style Gallery</p>
        <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">风格探索中心</h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">
          共 22 种细分风格，每一种都有完整的内容体系：配色、妆容、发型、穿搭、入门方案与常见误区。
          你可以自由混搭，不必只属于一种风格。
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {['全部', ...STYLE_GROUPS].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`chip ${group === g ? 'chip-on' : ''}`}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索风格名、关键词…"
            className="field-input pl-10"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-10 w-10" strokeWidth={1.2} />}
          title="没有匹配的风格"
          desc="换个关键词或清除筛选试试。"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/styles/${s.id}`}
              className="group card flex flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <SmartImage image={s.image} ratio="aspect-[3/2]" imgClassName="transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="eyebrow text-gold-500">{s.group}</p>
                  <span className="text-[11px] tracking-wider text-ink-300 uppercase">{s.enName}</span>
                </div>
                <h2 className="font-display text-[20px] font-semibold text-ink-900">{s.name}</h2>
                <p className="mt-1 text-[13px] text-ink-500">{s.tagline}</p>
                <div className="mt-3">
                  <PaletteSwatches palette={s.palette} size="sm" />
                </div>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {s.keywords.slice(0, 3).map((k) => (
                    <span key={k} className="rounded-full bg-cream-100 px-2.5 py-0.5 text-[11.5px] text-ink-500">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
