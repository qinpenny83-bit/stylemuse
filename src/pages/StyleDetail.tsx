import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertTriangle, Tags, Layers, Palette as PaletteIcon, Sparkles } from 'lucide-react'
import { getStyle, STYLES } from '../data/styles'
import SmartImage from '../components/SmartImage'
import FavoriteButton from '../components/FavoriteButton'
import { PaletteSwatches } from '../components/Palette'
import { EmptyState, Notice } from '../components/Feedback'
import { useApp } from '../store/AppStore'

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6 md:p-7">
      <h2 className="mb-4 flex items-center gap-2 font-display text-[19px] font-semibold text-ink-900">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function StyleDetail() {
  const { id } = useParams<{ id: string }>()
  const style = id ? getStyle(id) : undefined
  const { lastRecommendation } = useApp()

  if (!style) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState title="未找到该风格" desc="风格可能已被移除，返回列表重新选择。" />
        <div className="mt-6 text-center">
          <Link to="/styles" className="btn-primary">返回风格列表</Link>
        </div>
      </div>
    )
  }

  const adjacent = style.adjacent
    .map((name) => STYLES.find((x) => x.name === name))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  // 与用户档案联动：如果该风格被喜欢/讨厌，给出提示
  const liked = lastRecommendation?.profileSnapshot.likedStyles.includes(style.id) ?? false

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/styles" className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-3.5 w-3.5" /> 返回风格列表
      </Link>

      {/* 头部 */}
      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl shadow-lift">
          <SmartImage image={style.image} ratio="aspect-[3/4]" eager />
        </div>
        <div className="flex flex-col">
          <p className="eyebrow mb-2 text-gold-500">{style.group}</p>
          <h1 className="font-display text-[32px] leading-tight font-semibold text-ink-900 md:text-[40px]">
            {style.name}
            <span className="ml-3 align-middle font-sans text-[13px] font-normal tracking-[0.2em] text-ink-400 uppercase">
              {style.enName}
            </span>
          </h1>
          <p className="mt-2 font-display text-[17px] text-rose-600 italic">{style.tagline}</p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-700">{style.summary}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {style.keywords.map((k) => (
              <span key={k} className="rounded-full bg-cream-100 px-3 py-1 text-[12.5px] text-ink-600">
                {k}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <FavoriteButton type="style" refId={style.id} name={style.name} className="px-6 py-2.5" />
            {liked && (
              <span className="inline-flex items-center rounded-full bg-olive-500/15 px-4 py-2 text-[13px] text-ink-700">
                已在你的档案中标记为喜欢
              </span>
            )}
            <Link to="/profile" className="btn-ghost px-6 py-2.5">
              加入我的档案偏好
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Section icon={<Tags className="h-5 w-5 text-rose-600" />} title="细分风格与相邻风格">
          <p className="mb-2 text-[13px] text-ink-500">细分风格</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {style.subStyles.map((s) => (
              <span key={s} className="chip !cursor-default">{s}</span>
            ))}
          </div>
          <p className="mb-2 text-[13px] text-ink-500">相邻风格（可混搭）</p>
          <div className="flex flex-wrap gap-2">
            {adjacent.map((s) => (
              <Link key={s.id} to={`/styles/${s.id}`} className="chip hover:border-rose-400">
                {s.name}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
            {adjacent.length === 0 && <span className="text-[13px] text-ink-400">暂无</span>}
          </div>
        </Section>

        <Section icon={<PaletteIcon className="h-5 w-5 text-rose-600" />} title="代表性配色">
          <PaletteSwatches palette={style.palette} size="lg" />
          <p className="mt-4 text-[13px] leading-relaxed text-ink-500">
            全身搭配建议以色板中 2-3 个颜色为主，1 个点缀色，避免超过 3 个色系。
          </p>
        </Section>

        <Section title="妆容特点">
          <ul className="space-y-2">
            {style.makeup.map((m, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                {m}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="发型与发色建议">
          <p className="mb-1 text-[13px] text-ink-500">推荐发型</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {style.hair.styles.map((h) => (
              <span key={h} className="chip !cursor-default">{h}</span>
            ))}
          </div>
          <p className="mb-1 text-[13px] text-ink-500">推荐发色</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {style.hair.colors.map((c) => (
              <span key={c} className="chip !cursor-default">{c}</span>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-ink-500">{style.hair.notes}</p>
        </Section>

        <Section title="服装版型与搭配原则">
          <p className="mb-1 text-[13px] text-ink-500">版型关键词</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {style.outfit.silhouettes.map((s) => (
              <span key={s} className="chip !cursor-default">{s}</span>
            ))}
          </div>
          <ul className="space-y-2">
            {style.outfit.rules.map((r, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {r}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="鞋包与配饰">
          <div className="flex flex-wrap gap-2">
            {style.accessories.map((a) => (
              <span key={a} className="chip !cursor-default">{a}</span>
            ))}
          </div>
        </Section>

        <Section title="适用场景">
          <div className="flex flex-wrap gap-2">
            {style.scenarios.map((s) => (
              <span key={s} className="chip !cursor-default">{s}</span>
            ))}
          </div>
        </Section>

        <Section title="入门搭配方案">
          <ul className="space-y-2.5">
            {style.starterLook.map((s, i) => (
              <li key={i} className="rounded-xl bg-cream-100/70 px-4 py-3 text-[13.5px] leading-relaxed text-ink-700">
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12.5px] text-ink-400">以上方案均可在低预算下完成，不依赖特定品牌。</p>
        </Section>

        <Section title="低预算替代方案">
          <ul className="space-y-2">
            {style.budgetAlternatives.map((s, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-500" />
                {s}
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={<AlertTriangle className="h-5 w-5 text-gold-600" />} title="常见搭配误区">
          <ul className="space-y-2">
            {style.mistakes.map((m, i) => (
              <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {m}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="适合人群与调整条件">
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[13px] text-ink-500">适合什么偏好的人</p>
              <p className="rounded-xl bg-cream-100/70 px-4 py-3 text-[13.5px] leading-relaxed text-ink-700">
                {style.suitedFor}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[13px] text-ink-500">哪些条件下需要调整</p>
              <p className="rounded-xl bg-rose-100/50 px-4 py-3 text-[13.5px] leading-relaxed text-ink-700">
                {style.adjustNotes}
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* 图片来源说明 */}
      <div className="mt-8">
        <Notice tone="info">
          示意图来源：{style.image.source === 'ai-generated' ? 'AI 生成示意图（本服务按提示词生成）' : style.image.source}。
          许可：{style.image.license}。用途限制：{style.image.restrictions}
        </Notice>
      </div>

      {/* 底部导航：相邻风格 */}
      {adjacent.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[13px] text-ink-500">
            <Layers className="h-4 w-4 text-rose-600" />
            探索相邻风格
          </span>
          <div className="flex flex-wrap gap-2">
            {adjacent.map((s) => (
              <Link key={s.id} to={`/styles/${s.id}`} className="btn-ghost px-4 py-2 text-[13px]">
                {s.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 混搭引导 */}
      <div className="card mt-8 flex flex-col items-start gap-4 bg-ink-900 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 font-display text-[18px] font-semibold text-cream-100">
            <Sparkles className="h-4 w-4 text-gold-400" />
            允许混合风格
          </p>
          <p className="mt-1 text-[13px] text-cream-100/70">
            例如「街头甜酷 60% + 轻熟通勤 40%」。完成形象档案后，推荐结果会为你生成专属混合方案。
          </p>
        </div>
        <Link to="/profile" className="btn-accent shrink-0">去建立我的档案</Link>
      </div>
    </div>
  )
}
