import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, Sparkles, RefreshCcw, Shuffle, Wand2, Scissors, Shirt, CheckCircle2,
  AlertCircle, BookmarkPlus, Palette as PaletteIcon, ShoppingCart, ListChecks, FileText, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import { getStyle } from '../data/styles'
import { buildRecommendation, ADJUSTMENT_LABELS } from '../engine/recommend'
import type { AdjustmentKey, ImageRef, Recommendation, RecommendedStyle } from '../types'
import SmartImage from '../components/SmartImage'
import FavoriteButton from '../components/FavoriteButton'
import { PaletteSwatches } from '../components/Palette'
import { EmptyState, Notice } from '../components/Feedback'

const ADJ_KEYS = Object.keys(ADJUSTMENT_LABELS) as AdjustmentKey[]

function StyleCard({ rec, idx }: { rec: RecommendedStyle; idx: number }) {
  const s = getStyle(rec.styleId)
  if (!s) return null
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="relative">
        <SmartImage image={s.image} ratio="aspect-[3/2]" />
        <span className="absolute top-3 left-3 rounded-full bg-ink-900/85 px-3 py-1 font-display text-[13px] text-cream-100">
          No.{idx + 1}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[20px] font-semibold text-ink-900">{s.name}</h3>
          <span className="text-[12px] text-ink-400">匹配度 {Math.min(99, Math.round(rec.score * 6 + 40))}%</span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-ink-400">{s.tagline}</p>
        <ul className="mt-3 space-y-1.5">
          {rec.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-700">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive-500" />
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <FavoriteButton type="style" refId={s.id} name={s.name} className="px-4 py-1.5 text-[12.5px]" />
          <Link to={`/styles/${s.id}`} className="btn-ghost px-4 py-1.5 text-[12.5px]">
            查看风格详情
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function MixPanel({ rec }: { rec: Recommendation }) {
  return (
    <div className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
        <Shuffle className="h-5 w-5 text-rose-600" />
        你的混合风格方案
      </h2>
      <p className="mb-5 text-[13px] text-ink-500">
        不必只属于一种风格。以下是为你组合的主次方案，比例可依心情调整。
      </p>
      <div className="space-y-4">
        {rec.mix.map((m) => {
          const s = getStyle(m.styleId)
          if (!s) return null
          return (
            <div key={m.styleId} className="flex items-center gap-4">
              <div className="w-28 shrink-0 text-right">
                <p className="text-[14px] font-medium text-ink-900">{s.name}</p>
                <p className="text-[12px] text-rose-600">{m.ratio}%</p>
              </div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream-200">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.ratio}%`, background: s.palette[0]?.hex ?? '#b17085' }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {rec.mix.length === 2 && (
        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-400">
          混搭小提示：以 {rec.mix[0].ratio}% 风格为骨架（基础款），用 {rec.mix[1].ratio}%
          风格的元素做点睛（配饰、发色、一个单品）。
        </p>
      )}
    </div>
  )
}

function DetailBody({
  favoriteType,
  item,
}: {
  favoriteType: 'makeup' | 'hair' | 'outfit'
  item: {
    designId: string
    name: string
    why: string
    base?: string
    brows?: string
    eyes?: string
    blush?: string
    lips?: string
    steps?: string[]
    difficulty?: number
    duration?: number
    alternatives?: string[]
    length?: string
    texture?: string
    bangs?: string
    careTime?: number
    salonBrief?: string
    colors?: unknown
    limitations?: string[]
    top?: string
    bottom?: string
    dress?: string
    outer?: string
    shoes?: string
    bag?: string
    accessories?: string[]
    fit?: string
    reason?: string
  }
}) {
  if (favoriteType === 'makeup') {
    const rows = [
      ['底妆', item.base],
      ['眉形', item.brows],
      ['眼妆', item.eyes],
      ['腮红/修容', item.blush],
      ['唇色', item.lips],
    ].filter(([, v]) => v) as [string, string][]
    return (
      <>
        {rows.length > 0 && (
          <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <p key={k} className="text-[12.5px] leading-relaxed text-ink-600">
                <span className="font-medium text-ink-800">{k}：</span>
                {v}
              </p>
            ))}
          </div>
        )}
        {(item.difficulty !== undefined || item.duration !== undefined) && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {item.duration !== undefined && (
              <span className="rounded-full bg-cream-200/70 px-2.5 py-0.5 text-[12px] text-ink-600">约 {item.duration} 分钟</span>
            )}
            {item.difficulty !== undefined && (
              <span className="rounded-full bg-cream-200/70 px-2.5 py-0.5 text-[12px] text-ink-600">
                {item.difficulty === 1 ? '新手友好' : item.difficulty === 2 ? '中等难度' : '进阶难度'}
              </span>
            )}
          </div>
        )}
        {item.steps && item.steps.length > 0 && (
          <ol className="mt-3 space-y-1.5 border-t border-cream-200/70 pt-3">
            {item.steps.slice(0, 6).map((s, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-600">
                <span className="mt-0.5 font-display text-[12px] font-semibold text-rose-600">{String(i + 1).padStart(2, '0')}</span>
                {s}
              </li>
            ))}
          </ol>
        )}
      </>
    )
  }

  if (favoriteType === 'hair') {
    return (
      <>
        <div className="mt-2 flex flex-wrap gap-2">
          {item.length && <span className="rounded-full bg-cream-200/70 px-2.5 py-0.5 text-[12px] text-ink-600">{item.length}</span>}
          {item.texture && <span className="rounded-full bg-cream-200/70 px-2.5 py-0.5 text-[12px] text-ink-600">{item.texture}</span>}
          {item.bangs && <span className="rounded-full bg-cream-200/70 px-2.5 py-0.5 text-[12px] text-ink-600">{item.bangs}</span>}
          {item.careTime !== undefined && (
            <span className="rounded-full bg-cream-200/70 px-2.5 py-0.5 text-[12px] text-ink-600">日常打理约 {item.careTime} 分钟</span>
          )}
        </div>
        {item.salonBrief && (
          <blockquote className="mt-3 rounded-lg border-l-2 border-gold-400/60 bg-gold-400/10 px-3 py-2 text-[12.5px] leading-relaxed text-ink-700">
            到店这样说：{item.salonBrief}
          </blockquote>
        )}
        {item.limitations && item.limitations.length > 0 && (
          <p className="mt-2 text-[12px] leading-relaxed text-ink-400">局限提示：{item.limitations.join('；')}</p>
        )}
      </>
    )
  }

  const rows = [
    ['上装', item.top],
    ['下装', item.dress ?? item.bottom],
    ['外套', item.outer],
    ['鞋', item.shoes],
    ['包', item.bag],
  ].filter(([, v]) => v) as [string, string][]
  return (
    <>
      {rows.length > 0 && (
        <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <p key={k} className="text-[12.5px] leading-relaxed text-ink-600">
              <span className="font-medium text-ink-800">{k}：</span>
              {v}
            </p>
          ))}
        </div>
      )}
      {item.accessories && item.accessories.length > 0 && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600">
          <span className="font-medium text-ink-800">配饰：</span>
          {item.accessories.join('、')}
        </p>
      )}
      {item.fit && <p className="mt-2 text-[12.5px] leading-relaxed text-ink-600"><span className="font-medium text-ink-800">版型：</span>{item.fit}</p>}
      {item.reason && <p className="mt-2 text-[12.5px] leading-relaxed text-ink-500">{item.reason}</p>}
    </>
  )
}

function DesignRow({
  icon,
  title,
  items,
  favoriteType,
}: {
  icon: React.ReactNode
  title: string
  items: {
    designId: string
    name: string
    why: string
    image?: ImageRef
    base?: string
    brows?: string
    eyes?: string
    blush?: string
    lips?: string
    steps?: string[]
    difficulty?: number
    duration?: number
    alternatives?: string[]
    length?: string
    texture?: string
    bangs?: string
    careTime?: number
    salonBrief?: string
    limitations?: string[]
    top?: string
    bottom?: string
    dress?: string
    outer?: string
    shoes?: string
    bag?: string
    accessories?: string[]
    fit?: string
    reason?: string
  }[]
  favoriteType: 'makeup' | 'hair' | 'outfit'
}) {
  const detailPath = favoriteType === 'makeup' ? '/makeup' : favoriteType === 'hair' ? '/hair' : '/outfits'
  return (
    <div className="card p-6">
      <h2 className="mb-1 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
        {icon}
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it.designId} className="overflow-hidden rounded-xl bg-cream-100/60">
            {it.image && (
              <SmartImage image={it.image} ratio="aspect-[16/10]" card />
            )}
            <div className="px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[14px] font-medium text-ink-900">{it.name}</p>
                <div className="flex gap-2">
                  <FavoriteButton type={favoriteType} refId={it.designId} name={it.name} className="px-3 py-1 text-[12px]" label="收藏" />
                  <Link to={detailPath} className="text-[12.5px] text-rose-600 hover:text-rose-700">去看看 →</Link>
                </div>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{it.why}</p>
              <DetailBody favoriteType={favoriteType} item={it} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Results() {
  const { lastRecommendation, currentProfile, addRecommendation, ready } = useApp()
  const navigate = useNavigate()
  const [adjustments, setAdjustments] = useState<AdjustmentKey[]>([])
  const [seed, setSeed] = useState(0)

  // 基于当前档案与调整项实时重算（不覆盖已保存结果）；seed 用于「换一批」轮换
  const live = useMemo<Recommendation | null>(() => {
    if (!currentProfile) return null
    try {
      return buildRecommendation(currentProfile, adjustments, seed)
    } catch {
      return null
    }
  }, [currentProfile, adjustments, seed])

  const base = lastRecommendation
  const rec = adjustments.length > 0 || seed !== 0 ? live : base

  const toggleAdj = (k: AdjustmentKey) => {
    setAdjustments((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
  }

  const resetAll = () => {
    setAdjustments([])
    setSeed(0)
  }

  const saveAsNew = async () => {
    if (!live) return
    await addRecommendation(live)
    setAdjustments([])
    setSeed(0)
  }

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-ink-400">正在加载本地数据…</div>
  }

  if (!rec) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState
          icon={<Sparkles className="h-10 w-10" strokeWidth={1.2} />}
          title="还没有专属推荐"
          desc="先完成形象档案（几分钟，可跳过大部分问题），系统会结合你的特征与偏好生成本地推荐。"
          action={
            <Link to="/profile" className="btn-accent">
              <Sparkles className="h-4 w-4" /> 开始建立形象档案
            </Link>
          }
        />
        <div className="mt-6 text-center">
          <Link to="/styles" className="text-[13.5px] text-rose-600 hover:text-rose-700">
            或者先去逛逛风格库 →
          </Link>
        </div>
      </div>
    )
  }

  const dateStr = new Date(rec.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  // 有调整项、已换过一批、或档案已存在但尚未保存过推荐时，显示实时预览并提供保存
  const isLive = adjustments.length > 0 || seed !== 0 || !lastRecommendation
  const main = getStyle(rec.topStyles[0].styleId)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* 头部 */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-rose-600">Your Style Report</p>
          <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">我的专属推荐</h1>
          <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-400">
            <CalendarDays className="h-4 w-4" />
            基于 {dateStr} 的档案生成
            {rec.appliedAdjustments.length > 0 && (
              <span className="rounded-full bg-gold-400/20 px-2.5 py-0.5 text-[12px] text-gold-600">
                已应用调整：{rec.appliedAdjustments.map((a) => ADJUSTMENT_LABELS[a]).join('、')}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSeed((prev) => prev + 1)}
            className="btn-ghost px-4 py-2 text-[13px]"
            title="换一批组合方案"
          >
            <Shuffle className="h-4 w-4" /> 换一批
          </button>
          <Link to="/profile" className="btn-ghost px-4 py-2 text-[13px]">
            修改档案
          </Link>
          {isLive && (
            <button type="button" onClick={() => void saveAsNew()} className="btn-accent px-4 py-2 text-[13px]">
              <BookmarkPlus className="h-4 w-4" /> 保存此版本
            </button>
          )}
        </div>
      </div>

      {/* 调整栏 */}
      <div className="card mb-8 p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-[14.5px] font-medium text-ink-900">
            <Wand2 className="h-4 w-4 text-rose-600" />
            想调整一下？
          </p>
          {isLive && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-[12.5px] text-ink-500 hover:text-ink-900"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> 恢复默认
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ADJ_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleAdj(k)}
              className={`chip ${adjustments.includes(k) ? 'chip-on' : ''}`}
            >
              {ADJUSTMENT_LABELS[k]}
            </button>
          ))}
        </div>
        {isLive && (
          <p className="mt-3 text-[12.5px] text-rose-600">
            以下为实时预览版本（含换一批与调整项），尚未覆盖你已保存的推荐；点击「保存此版本」才会生成新记录。
          </p>
        )}
      </div>

      {/* 信息不足提示 */}
      {rec.infoGaps.length > 0 && (
        <div className="mb-8">
          <Notice tone="warn">
            <p className="mb-1 flex items-center gap-1.5 font-medium text-ink-700">
              <AlertCircle className="h-4 w-4 text-gold-600" />
              信息说明（以下结论为「参考方向」，非精确判断）
            </p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-ink-700">
              {rec.infoGaps.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
            <Link to="/profile" className="mt-2 inline-block text-[12.5px] text-rose-600 hover:text-rose-700">
              补充档案信息，让建议更贴合 →
            </Link>
          </Notice>
        </div>
      )}

      {/* 综合解读 */}
      {rec.summary && (
        <div className="card mb-8 flex gap-4 p-6">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h2 className="mb-1.5 font-display text-[17px] font-semibold text-ink-900">为什么推荐这套组合</h2>
            <p className="text-[13.5px] leading-relaxed text-ink-600">{rec.summary}</p>
          </div>
        </div>
      )}

      {/* 前三风格 */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-[22px] font-semibold text-ink-900">推荐的前三种风格</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {rec.topStyles.map((s, i) => (
            <StyleCard key={s.styleId} rec={s} idx={i} />
          ))}
        </div>
      </div>

      {/* 混合方案 + 形象速览 */}
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <MixPanel rec={rec} />
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
            <PaletteIcon className="h-5 w-5 text-rose-600" />
            核心配色方向
          </h2>
          {main ? (
            <>
              <p className="mb-3 text-[13px] text-ink-500">
                以「{main.name}」色板为主，混入第二风格的 1-2 个点缀色。
              </p>
              <PaletteSwatches palette={main.palette} size="lg" />
              {rec.mix[1] && getStyle(rec.mix[1].styleId) && (
                <div className="mt-4 border-t border-cream-200/60 pt-4">
                  <p className="mb-2 text-[13px] text-ink-500">点缀色（来自「{getStyle(rec.mix[1].styleId)!.name}」）</p>
                  <PaletteSwatches palette={getStyle(rec.mix[1].styleId)!.palette.slice(0, 3)} size="sm" />
                </div>
              )}
            </>
          ) : (
            <p className="text-[13px] text-ink-400">暂无配色数据</p>
          )}
        </div>
      </div>

      {/* 妆容 / 发型 / 穿搭 */}
      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <DesignRow
          icon={<PaletteIcon className="h-5 w-5 text-rose-600" />}
          title="妆容设计"
          items={rec.makeup}
          favoriteType="makeup"
        />
        <DesignRow
          icon={<Scissors className="h-5 w-5 text-rose-600" />}
          title="发型建议"
          items={rec.hair}
          favoriteType="hair"
        />
        <DesignRow
          icon={<Shirt className="h-5 w-5 text-rose-600" />}
          title="穿搭方案"
          items={rec.outfits}
          favoriteType="outfit"
        />
      </div>

      {/* 场景搭配 */}
      <div className="card mb-8 p-6">
        <h2 className="mb-4 font-display text-[19px] font-semibold text-ink-900">不同场景怎么穿</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {rec.sceneLooks.map((s) => (
            <div key={s.scenario} className="rounded-xl bg-cream-100/60 px-4 py-3">
              <p className="mb-1 text-[13.5px] font-medium text-rose-700">{s.scenario}</p>
              <p className="text-[12.5px] leading-relaxed text-ink-600">{s.tip}</p>
              {s.look && s.look.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-cream-200/70 pt-2.5">
                  {s.look.map((l, i) => (
                    <span key={i} className="rounded-full bg-white px-2.5 py-0.5 text-[11.5px] text-ink-700">{l}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 采购清单 */}
      {rec.shoppingList && rec.shoppingList.length > 0 && (
        <div className="card mb-8 p-6">
          <h2 className="mb-1 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
            <ShoppingCart className="h-5 w-5 text-rose-600" />
            优先采购清单
          </h2>
          <p className="mb-4 text-[13px] text-ink-500">按优先级置办，从「高」开始；全部置办前先完成第一套完整搭配。</p>
          <div className="grid gap-2.5 md:grid-cols-2">
            {rec.shoppingList.map((it, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-cream-100/60 px-4 py-3">
                <span
                  className={`mt-0.5 h-5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    it.priority === '高' ? 'bg-rose-600 text-white' : it.priority === '中' ? 'bg-gold-400/70 text-ink-800' : 'bg-cream-200 text-ink-500'
                  }`}
                >
                  {it.priority}
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-ink-800">{it.item}</p>
                  {it.note && <p className="mt-0.5 text-[12px] text-ink-500">{it.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 避坑提醒 */}
      {rec.avoidMistakes && rec.avoidMistakes.length > 0 && (
        <div className="card mb-8 border-l-4 border-l-gold-500 p-6">
          <h2 className="mb-3 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
            <AlertTriangle className="h-5 w-5 text-gold-600" />
            常见搭配误区（绕开它们）
          </h2>
          <ul className="space-y-2">
            {rec.avoidMistakes.map((m, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 可执行步骤 */}
      <div className="card mb-8 p-6">
        <h2 className="mb-4 font-display text-[19px] font-semibold text-ink-900">可执行的改造步骤</h2>
        <ol className="space-y-3">
          {rec.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 font-display text-[12px] text-cream-100">
                {i + 1}
              </span>
              <span className="pt-0.5 text-[13.5px] leading-relaxed text-ink-700">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 分阶段计划 */}
      {rec.plan && rec.plan.length > 0 && (
        <div className="card mb-8 p-6">
          <h2 className="mb-1 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
            <ListChecks className="h-5 w-5 text-rose-600" />
            8 周改造计划
          </h2>
          <p className="mb-5 text-[13px] text-ink-500">把大目标拆成每周可做的小事，跟着节奏走即可。</p>
          <div className="grid gap-4 md:grid-cols-3">
            {rec.plan.map((p, i) => (
              <div key={i} className="rounded-xl bg-cream-100/60 px-4 py-4">
                <p className="mb-2.5 flex items-center gap-2 text-[13.5px] font-semibold text-ink-900">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 font-display text-[11px] text-white">{i + 1}</span>
                  {p.phase}
                </p>
                <ul className="space-y-2">
                  {p.actions.map((a, j) => (
                    <li key={j} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部操作 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12.5px] text-ink-400">
          推荐由本地规则引擎生成，透明可解释；不做无依据的肤色/身材断言。
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate('/profile')} className="btn-ghost px-5 py-2.5">
            调整档案
          </button>
          <Link to="/wardrobe" className="btn-primary px-5 py-2.5">
            去我的衣橱管理收藏
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
