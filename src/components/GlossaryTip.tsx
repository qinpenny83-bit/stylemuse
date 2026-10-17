/* 生僻词内联解释：悬停/点击显示一句话通俗释义 */
import { getGlossary } from '../data/glossary'

export default function GlossaryTip({ term, className }: { term: string; className?: string }) {
  const g = getGlossary(term)
  if (!g) return null
  return (
    <span className={`group relative inline-flex align-middle ${className ?? ''}`}>
      <span
        aria-label={`解释「${g.term}」`}
        className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-rose-600/10 text-[10px] font-bold text-rose-600 transition-colors group-hover:bg-rose-600 group-hover:text-white"
      >
        ?
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-56 -translate-x-1/2 rounded-lg border border-cream-200 bg-white px-3 py-2 text-[12px] leading-relaxed text-ink-700 opacity-0 shadow-lift transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {g.def}
        {g.link && (
          <a
            href={g.link}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 block text-[11px] text-rose-600 underline-offset-2 hover:underline"
          >
            站内相关 →
          </a>
        )}
      </span>
    </span>
  )
}
