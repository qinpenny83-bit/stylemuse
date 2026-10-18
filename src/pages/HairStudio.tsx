import { useMemo, useState } from 'react'
import { Clock, Gauge, Scissors, MessageSquareText, AlertTriangle } from 'lucide-react'
import { HAIR_DESIGNS } from '../data/hair'
import { STYLES } from '../data/styles'
import { getTrend } from '../data/trends'
import type { HairDesign } from '../types'
import SmartImage from '../components/SmartImage'
import FavoriteButton from '../components/FavoriteButton'
import DetailModal from '../components/DetailModal'
import { EmptyState, Notice } from '../components/Feedback'
import { ColorDots } from '../components/Palette'
import { TrendBadge, TrendInfoBlock, usedTrendIds } from '../components/Trend'
import LoadMore from '../components/LoadMore'
import { usePagedList } from '../hooks/usePagedList'

const LENGTHS = ['短发', '中长发', '长发']
const TEXTURES = ['直发', '卷发', '层次']
const FACE_SHAPES = ['鹅蛋脸', '圆脸', '方脸', '长脸', '心形脸', '菱形脸']
const STYLE_NAMES = STYLES.map((s) => s.name)
const TREND_IDS = usedTrendIds(HAIR_DESIGNS)

function Detail({ h }: { h: HairDesign }) {
  return (
    <div>
      <SmartImage image={h.image} ratio="aspect-[16/9]" className="rounded-t-2xl" eager />
      <div className="p-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow text-rose-600">{h.length} · {h.texture}</p>
          <FavoriteButton type="hair" refId={h.id} name={h.name} className="px-3 py-1.5 text-[12px]" />
        </div>
        <h2 className="font-display text-[24px] font-semibold text-ink-900">{h.name}</h2>

        <div className="mt-4 flex flex-wrap gap-3 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Gauge className="h-3.5 w-3.5 text-rose-600" /> 打理难度：{'●'.repeat(h.careLevel)}{'○'.repeat(3 - h.careLevel)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Clock className="h-3.5 w-3.5 text-rose-600" /> 日常打理约 {h.careTime} 分钟
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-3 py-1">
            <Scissors className="h-3.5 w-3.5 text-rose-600" /> 刘海：{h.bangs}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-700">适配脸型（参考，非绝对）</p>
            <div className="flex flex-wrap gap-1.5">
              {h.faceShapes.map((f) => (
                <span key={f} className="rounded-full bg-cream-100 px-2.5 py-0.5 text-[12px] text-ink-600">{f}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-700">适配发质 / 发量</p>
            <div className="flex flex-wrap gap-1.5">
              {[...h.hairQuality, ...h.hairVolume].map((f) => (
                <span key={f} className="rounded-full bg-cream-100 px-2.5 py-0.5 text-[12px] text-ink-600">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[13px] font-medium text-ink-700">建议发色</p>
          <div className="flex flex-wrap items-center gap-3">
            <ColorDots hexes={h.colors.map((c) => colorOf(c))} size="md" />
            <span className="text-[13px] text-ink-600">{h.colors.join('、')}</span>
          </div>
        </div>

        <TrendInfoBlock trendId={h.trend} trendNote={h.trendNote} />

        <div className="mt-5">
          <p className="mb-2 text-[13px] font-medium text-ink-700">为什么适合你 / 适配理由</p>
          <ul className="space-y-1.5">
            {h.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-700">
            <AlertTriangle className="h-4 w-4 text-gold-600" /> 可能的局限
          </p>
          <ul className="space-y-1.5">
            {h.limitations.map((r, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-600">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-100/50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-[13px] font-medium text-rose-800">
            <MessageSquareText className="h-4 w-4" /> 到理发店可以直接这样说
          </p>
          <p className="text-[13.5px] leading-relaxed text-ink-800">「{h.salonBrief}」</p>
        </div>

        <div className="mt-5">
          <Notice tone="info">
            脸型适配为参考因素而非绝对规则——「圆脸不能留短发」这类绝对化判断并不成立，关键看层次、刘海与日常打理习惯。
            图片来源：{h.image.source === 'ai-generated' ? 'AI 生成示意图' : h.image.source} · {h.image.restrictions}
          </Notice>
        </div>
      </div>
    </div>
  )
}

const COLOR_MAP: Record<string, string> = {
  自然黑: '#2E2620', 黑茶: '#3A2E26', 深棕: '#4A3527', 冷棕: '#5A4632', 奶茶棕: '#8A6A4F',
  蜂蜜茶: '#B08A5A', 冷灰棕: '#6E645C', 亚麻棕: '#A98A5C', 茶棕: '#7A5A3E', 蓝黑: '#2B2F3A',
  樱花粉: '#F0B7C0', 亚麻白金: '#D8CBB8', 深酒红: '#5E2B33', 灰棕: '#7A6E5C', 挑染: '#8A6A4F',
  樱桃可乐红: '#5A1E22', 铜色挑染: '#A25B1E',
}
function colorOf(name: string): string {
  return COLOR_MAP[name] ?? '#8A6A4F'
}

export default function HairStudio() {
  const [length, setLength] = useState('全部')
  const [texture, setTexture] = useState('全部')
  const [face, setFace] = useState('全部')
  const [styleName, setStyleName] = useState('全部')
  const [trend, setTrend] = useState('全部')
  const [maxCare, setMaxCare] = useState(30)

  const filtered = useMemo(
    () =>
      HAIR_DESIGNS.filter((h) => {
        if (length !== '全部' && h.length !== length) return false
        if (texture !== '全部' && !h.texture.includes(texture)) return false
        if (face !== '全部' && !h.faceShapes.includes(face)) return false
        if (styleName !== '全部' && !h.styleIds.some((id) => STYLES.find((s) => s.id === id)?.name === styleName)) return false
        if (trend !== '全部' && h.trend !== trend) return false
        if (h.careTime > maxCare) return false
        return true
      }),
    [length, texture, face, styleName, trend, maxCare],
  )

  // 每个筛选选项在当前其他条件下的结果数
  const lengthCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const l of LENGTHS) m[l] = HAIR_DESIGNS.filter((h) =>
      h.length === l &&
      (texture === '全部' || h.texture.includes(texture)) &&
      (face === '全部' || h.faceShapes.includes(face)) &&
      (styleName === '全部' || h.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      (trend === '全部' || h.trend === trend) &&
      h.careTime <= maxCare).length
    return m
  }, [texture, face, styleName, trend, maxCare])
  const textureCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const t of TEXTURES) m[t] = HAIR_DESIGNS.filter((h) =>
      h.texture.includes(t) &&
      (length === '全部' || h.length === length) &&
      (face === '全部' || h.faceShapes.includes(face)) &&
      (styleName === '全部' || h.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      (trend === '全部' || h.trend === trend) &&
      h.careTime <= maxCare).length
    return m
  }, [length, face, styleName, trend, maxCare])
  const faceCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const f of FACE_SHAPES) m[f] = HAIR_DESIGNS.filter((h) =>
      h.faceShapes.includes(f) &&
      (length === '全部' || h.length === length) &&
      (texture === '全部' || h.texture.includes(texture)) &&
      (styleName === '全部' || h.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      (trend === '全部' || h.trend === trend) &&
      h.careTime <= maxCare).length
    return m
  }, [length, texture, styleName, trend, maxCare])
  const styleCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const s of STYLES) m[s.name] = HAIR_DESIGNS.filter((h) =>
      h.styleIds.includes(s.id) &&
      (length === '全部' || h.length === length) &&
      (texture === '全部' || h.texture.includes(texture)) &&
      (face === '全部' || h.faceShapes.includes(face)) &&
      (trend === '全部' || h.trend === trend) &&
      h.careTime <= maxCare).length
    return m
  }, [length, texture, face, trend, maxCare])
  const trendCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const t of TREND_IDS) m[t] = HAIR_DESIGNS.filter((h) =>
      h.trend === t &&
      (length === '全部' || h.length === length) &&
      (texture === '全部' || h.texture.includes(texture)) &&
      (face === '全部' || h.faceShapes.includes(face)) &&
      (styleName === '全部' || h.styleIds.some((id) => STYLES.find((st) => st.id === id)?.name === styleName)) &&
      h.careTime <= maxCare).length
    return m
  }, [length, texture, face, styleName, maxCare])

  const { visible, hasMore, remaining, loadMore } = usePagedList(filtered, 12)

  const [active, setActive] = useState<HairDesign | null>(null)

  const FilterRow = ({ label, options, value, onChange, format, counts }: {
    label: string
    options: string[]
    value: string
    onChange: (v: string) => void
    format?: (v: string) => string
    counts: Record<string, number>
  }) => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-[13px] text-ink-500">{label}</span>
      {options.map((o) => {
        const n = o === '全部' ? filtered.length : counts[o] ?? 0
        const zero = o !== '全部' && n === 0
        return (
          <button key={o} type="button" onClick={() => onChange(o)} className={`chip ${value === o ? 'chip-on' : ''}`}>
            {format ? format(o) : o}
            <span className={`ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10.5px] leading-[16px] ${value === o ? 'bg-white/30' : zero ? 'bg-black/5 text-ink-300' : 'bg-black/10 text-ink-500'}`}>
              {n}
            </span>
          </button>
        )
      })}
    </div>
  )

  const activeFilterChips = [
    { label: '发长', v: length, set: () => setLength('全部') },
    { label: '发质类型', v: texture, set: () => setTexture('全部') },
    { label: '脸型', v: face, set: () => setFace('全部') },
    { label: '风格', v: styleName, set: () => setStyleName('全部') },
    { label: '潮流', v: trend, set: () => setTrend('全部') },
    { label: '打理时间', v: `≤ ${maxCare} 分钟`, set: () => setMaxCare(30) },
  ].filter((x) => (x.label === '打理时间' ? maxCare < 30 : x.v !== '全部'))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-9 bg-rose-500/70" />
          <p className="eyebrow text-rose-600">Hair Studio · N°03</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">
            发型<em className="italic text-rose-600">设计室</em>
          </h1>
          <span className="pill-rose">共 {HAIR_DESIGNS.length} 套方案</span>
        </div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-500">
          按脸型、发长、发质、发量与打理时间筛选。每套方案都附「可直接说给理发师听」的需求描述与适配局限。选项上的数字表示当前条件下可选方案数。
        </p>
      </div>

      {/* 筛选 */}
      <div className="card mb-8 space-y-4 p-5">
        <FilterRow label="发长" options={['全部', ...LENGTHS]} value={length} onChange={setLength} counts={lengthCounts} />
        <FilterRow label="发质类型" options={['全部', ...TEXTURES]} value={texture} onChange={setTexture} counts={textureCounts} />
        <FilterRow label="脸型" options={['全部', ...FACE_SHAPES]} value={face} onChange={setFace} counts={faceCounts} />
        <FilterRow label="风格" options={['全部', ...STYLE_NAMES]} value={styleName} onChange={setStyleName} counts={styleCounts} />
        <FilterRow
          label="潮流"
          options={['全部', ...TREND_IDS]}
          value={trend}
          onChange={setTrend}
          format={(id) => getTrend(id)?.name ?? id}
          counts={trendCounts}
        />
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-16 shrink-0 text-[13px] text-ink-500">打理时间</span>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={maxCare}
            onChange={(e) => setMaxCare(Number(e.target.value))}
            className="w-40 accent-rose-600"
          />
          <span className="text-[13px] text-ink-600">不超过 {maxCare} 分钟（当前 {filtered.length} 套）</span>
        </div>
        <Notice tone="info">
          <span className="mr-1.5">数字 = 当前其他条件下可匹配的方案数；数字为 0 的选项表示该组合暂无结果，可放宽筛选。</span>
        </Notice>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center p-8 text-center">
          <EmptyState title="这个组合暂时没有完全匹配的方案" desc="所有方案都带展示图，只是该组合暂无内容。放宽任一筛选即可看到推荐。" />
          {activeFilterChips.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeFilterChips.map((x) => (
                <button key={x.label} type="button" onClick={x.set} className="chip">
                  去掉「{x.label}：{x.v}」
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setActive(h)}
              className="group card flex flex-col overflow-hidden text-left transition-all hover:-translate-y-1 hover:border-rose-200 hover:shadow-lift"
            >
              <SmartImage image={h.image} ratio="aspect-[3/2]" card />
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="pill-rose">{h.length} · {h.texture}</span>
                    {h.trend && <TrendBadge trendId={h.trend} />}
                  </span>
                  <span className="text-[11.5px] text-ink-400">打理 {h.careTime} 分钟</span>
                </div>
                <h2 className="font-display text-[19px] font-semibold text-ink-900">{h.name}</h2>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-500">
                  刘海：{h.bangs} · 适配：{h.faceShapes.join('、')}
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {h.colors.slice(0, 4).map((c) => (
                    <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-2.5 py-0.5 text-[11.5px] text-ink-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorOf(c) }} />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 && <LoadMore hasMore={hasMore} remaining={remaining} onClick={loadMore} />}

      <DetailModal open={Boolean(active)} onClose={() => setActive(null)}>
        {active && <Detail h={active} />}
      </DetailModal>
    </div>
  )
}
