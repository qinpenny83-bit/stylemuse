import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Trash2, Bookmark, FileText, History, UserRound, ArrowRight, Shirt, Layers, Gem, Umbrella,
  Footprints, ShoppingBag, Wand2, Check, RefreshCcw, ListChecks,
} from 'lucide-react'
import { useApp } from '../store/AppStore'
import type { FavoriteType } from '../types'
import { getStyle } from '../data/styles'
import { MAKEUP_DESIGNS } from '../data/makeup'
import { HAIR_DESIGNS } from '../data/hair'
import { OUTFIT_DESIGNS } from '../data/outfits'
import { CAPSULE_ITEMS, generateLooks, suggestShopping, type CapsuleCategory, type Occasion, type Season } from '../data/capsule'
import SmartImage from '../components/SmartImage'
import { EmptyState } from '../components/Feedback'

type Tab = 'closet' | 'styles' | 'makeup' | 'hair' | 'outfits' | 'profiles' | 'history'

const CATEGORY_ICONS: Record<CapsuleCategory, React.ReactNode> = {
  上衣: <Shirt className="h-4 w-4" />,
  下装: <Layers className="h-4 w-4" />,
  连衣裙: <Gem className="h-4 w-4" />,
  外套: <Umbrella className="h-4 w-4" />,
  鞋: <Footprints className="h-4 w-4" />,
  包: <ShoppingBag className="h-4 w-4" />,
}

const CATEGORIES: CapsuleCategory[] = ['上衣', '下装', '连衣裙', '外套', '鞋', '包']
const OCCASIONS: Occasion[] = ['通勤', '休闲', '约会', '聚会']
const SEASONS: Season[] = ['春', '夏', '秋', '冬']

/* 胶囊衣橱：勾选已有单品 → 生成今日穿搭 */
function CapsulePlanner() {
  const { closetItems, setClosetItems } = useApp()
  const [scenario, setScenario] = useState<Occasion>('通勤')
  const [season, setSeason] = useState<Season>('春')
  const [generated, setGenerated] = useState(false)

  const owned = new Set(closetItems)
  const ownedList = CAPSULE_ITEMS.filter((it) => owned.has(it.id))
  const coverage = Math.round((ownedList.length / CAPSULE_ITEMS.length) * 100)

  const toggle = (id: string) => {
    const next = owned.has(id) ? closetItems.filter((x) => x !== id) : [...closetItems, id]
    void setClosetItems(next)
  }

  const looks = useMemo(() => (generated ? generateLooks(closetItems, scenario, season) : []), [generated, closetItems, scenario, season])
  const shopping = useMemo(() => suggestShopping(closetItems, season), [closetItems, season])

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-[17px] font-semibold text-ink-900">用你已有的衣服，搭出今天的穿搭</p>
            <p className="mt-1 text-[13px] text-ink-500">勾选衣柜里真正有的单品（约 10 件就够），系统会用它们组合出可执行的穿搭。</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-display text-[24px] leading-none font-semibold text-rose-600">{coverage}%</p>
              <p className="text-[11px] tracking-[0.15em] text-ink-400 uppercase">覆盖率</p>
            </div>
            <button
              type="button"
              onClick={() => void setClosetItems([])}
              disabled={closetItems.length === 0}
              className="btn-ghost px-4 py-2 text-[12.5px]"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              清空
            </button>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-gold-400 transition-all duration-500" style={{ width: `${coverage}%` }} />
        </div>
        <p className="mt-2 text-[12px] text-ink-400">
          已选 {ownedList.length} / {CAPSULE_ITEMS.length} 件。勾满 {Math.min(10, CAPSULE_ITEMS.length)} 件以上效果最佳。
        </p>
      </div>

      {/* 单品勾选 */}
      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const items = CAPSULE_ITEMS.filter((it) => it.category === cat)
          const picked = items.filter((it) => owned.has(it.id)).length
          return (
            <div key={cat} className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-gold-300">{CATEGORY_ICONS[cat]}</span>
                <span className="text-[14px] font-semibold text-ink-900">{cat}</span>
                <span className="ml-auto text-[11.5px] text-ink-400">{picked}/{items.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((it) => {
                  const on = owned.has(it.id)
                  return (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => toggle(it.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-all ${
                        on
                          ? 'border-rose-600 bg-rose-600 text-white shadow-soft'
                          : 'border-cream-300 bg-white text-ink-700 hover:border-rose-300 hover:text-rose-700'
                      }`}
                    >
                      {on && <Check className="h-3.5 w-3.5" />}
                      {it.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 生成区 */}
      <div className="card p-5">
        <p className="mb-3 text-[14px] font-semibold text-ink-900">今天要去哪？</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {OCCASIONS.map((o) => (
              <button key={o} type="button" onClick={() => setScenario(o)} className={scenario === o ? 'chip chip-on' : 'chip'}>
                {o}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SEASONS.map((s) => (
              <button key={s} type="button" onClick={() => setSeason(s)} className={season === s ? 'chip chip-on' : 'chip'}>
                {s}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setGenerated(true)} disabled={closetItems.length < 3} className="btn-accent ml-auto px-5 py-2.5 text-[13.5px]">
            <Wand2 className="h-4 w-4" />
            生成今日穿搭
          </button>
        </div>
        {closetItems.length < 3 && (
          <p className="mt-2 text-[12.5px] text-ink-400">至少勾选 3 件单品才能生成组合。</p>
        )}
      </div>

      {/* 生成结果 */}
      {looks.length > 0 && (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-ink-900">
            <ListChecks className="h-4 w-4 text-rose-600" />
            {scenario} · {season}季 · 今日 3 套
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {looks.map((look, i) => (
              <div key={look.id} className="card card-hover p-5">
                <p className="font-display text-[16px] font-semibold text-ink-900">
                  {look.name}
                  <span className="ml-2 text-[11px] tracking-[0.15em] text-ink-400 uppercase">Look {i + 1}</span>
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-rose-600">{look.note}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {look.items.map((it) => (
                    <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-cream-100 px-2.5 py-1 text-[12px] text-ink-700">
                      {it.name}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/outfits?season=${season}&scenario=${encodeURIComponent(scenario)}`}
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
                >
                  查看完整穿搭方案
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 补购建议 */}
      {shopping.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-cream-200/70 bg-gold-300/20 px-5 py-3">
            <ShoppingBag className="h-4 w-4 text-gold-600" />
            <span className="text-[14px] font-semibold text-gold-600">补购清单 Top{shopping.length}</span>
          </div>
          <div className="divide-y divide-cream-200/60">
            {shopping.map((s) => (
              <div key={s.item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink-900 text-gold-300">{CATEGORY_ICONS[s.item.category]}</span>
                  <div>
                    <p className="text-[13.5px] font-medium text-ink-900">{s.item.name}</p>
                    <p className="text-[12px] text-ink-400">{s.reason}</p>
                  </div>
                </div>
                <Link to={`/outfits?season=${season}`} className="shrink-0 text-[12.5px] text-rose-600 hover:underline">
                  参考方案 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Wardrobe() {
  const { favorites, profiles, recommendations, closetItems, removeFavorite, removeProfile, removeRecommendation, ready } = useApp()
  const [tab, setTab] = useState<Tab>('closet')

  const favs = useMemo(() => {
    const byType = (t: FavoriteType) => favorites.filter((f) => f.type === t)
    return {
      styles: byType('style'),
      makeup: byType('makeup'),
      hair: byType('hair'),
      outfits: byType('outfit'),
    }
  }, [favorites])

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'closet', label: '胶囊衣橱', count: closetItems.length },
    { key: 'styles', label: '收藏的风格', count: favs.styles.length },
    { key: 'makeup', label: '收藏的妆容', count: favs.makeup.length },
    { key: 'hair', label: '收藏的发型', count: favs.hair.length },
    { key: 'outfits', label: '收藏的穿搭', count: favs.outfits.length },
    { key: 'profiles', label: '形象档案', count: profiles.length },
    { key: 'history', label: '推荐历史', count: recommendations.length },
  ]

  if (!ready) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-ink-400">正在加载本地数据…</div>
  }

  const favTotal = favorites.length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-2 text-rose-600">My Wardrobe</p>
        <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">我的形象衣橱</h1>
        <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-500">
          <Bookmark className="h-4 w-4 text-rose-600" />
          共 {favTotal} 项收藏、{profiles.length} 份档案、{recommendations.length} 条推荐记录，全部保存在浏览器本地。
        </p>
      </div>

      {/* 标签栏 */}
      <div className="mb-8 flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] transition-colors ${
              tab === t.key ? 'bg-ink-900 text-cream-100' : 'bg-white text-ink-700 hover:bg-cream-200'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${tab === t.key ? 'bg-cream-100/20' : 'bg-cream-200/70'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* 胶囊衣橱：勾选已有单品 → 生成穿搭 */}
      {tab === 'closet' && <CapsulePlanner />}

      {/* 收藏的风格 */}
      {tab === 'styles' &&
        (favs.styles.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-10 w-10" strokeWidth={1.2} />}
            title="还没有收藏风格"
            desc="在风格详情页点击「收藏」，把心仪的风格放进衣橱。"
            action={<Link to="/styles" className="btn-primary">去探索风格</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.styles.map((f) => {
              const s = getStyle(f.refId)
              return (
                <div key={f.id} className="card group overflow-hidden">
                  {s ? (
                    <Link to={`/styles/${s.id}`}>
                      <SmartImage image={s.image} ratio="aspect-[3/2]" />
                    </Link>
                  ) : (
                    <div className="flex aspect-[3/2] items-center justify-center bg-cream-200 text-[13px] text-ink-400">
                      内容已移除
                    </div>
                  )}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-display text-[16px] font-semibold text-ink-900">{f.name}</p>
                      <p className="text-[11.5px] text-ink-400">{new Date(f.createdAt).toLocaleDateString('zh-CN')} 收藏</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeFavorite(f.id)}
                      className="rounded-full p-2 text-ink-400 transition-colors hover:bg-rose-100 hover:text-rose-700"
                      aria-label={`删除收藏 ${f.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* 收藏的妆容 */}
      {tab === 'makeup' &&
        (favs.makeup.length === 0 ? (
          <EmptyState title="还没有收藏妆容" desc="在妆容设计室打开方案详情并收藏。" action={<Link to="/makeup" className="btn-primary">去妆容设计室</Link>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.makeup.map((f) => {
              const m = MAKEUP_DESIGNS.find((x) => x.id === f.refId)
              return (
                <div key={f.id} className="card overflow-hidden">
                  {m ? <SmartImage image={m.image} ratio="aspect-[3/2]" /> : <div className="aspect-[3/2] bg-cream-200" />}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-display text-[16px] font-semibold text-ink-900">{f.name}</p>
                      <p className="text-[11.5px] text-ink-400">{m ? `${m.type} · ${m.duration} 分钟` : '内容已移除'}</p>
                    </div>
                    <button type="button" onClick={() => void removeFavorite(f.id)} className="rounded-full p-2 text-ink-400 hover:bg-rose-100 hover:text-rose-700" aria-label="删除收藏">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* 收藏的发型 */}
      {tab === 'hair' &&
        (favs.hair.length === 0 ? (
          <EmptyState title="还没有收藏发型" desc="在发型设计室打开方案详情并收藏。" action={<Link to="/hair" className="btn-primary">去发型设计室</Link>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.hair.map((f) => {
              const h = HAIR_DESIGNS.find((x) => x.id === f.refId)
              return (
                <div key={f.id} className="card overflow-hidden">
                  {h ? <SmartImage image={h.image} ratio="aspect-[3/2]" /> : <div className="aspect-[3/2] bg-cream-200" />}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-display text-[16px] font-semibold text-ink-900">{f.name}</p>
                      <p className="text-[11.5px] text-ink-400">{h ? `${h.length} · 打理 ${h.careTime} 分钟` : '内容已移除'}</p>
                    </div>
                    <button type="button" onClick={() => void removeFavorite(f.id)} className="rounded-full p-2 text-ink-400 hover:bg-rose-100 hover:text-rose-700" aria-label="删除收藏">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* 收藏的穿搭 */}
      {tab === 'outfits' &&
        (favs.outfits.length === 0 ? (
          <EmptyState title="还没有收藏穿搭" desc="在穿搭设计室打开方案详情并收藏。" action={<Link to="/outfits" className="btn-primary">去穿搭设计室</Link>} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favs.outfits.map((f) => {
              const o = OUTFIT_DESIGNS.find((x) => x.id === f.refId)
              return (
                <div key={f.id} className="card overflow-hidden">
                  {o ? <SmartImage image={o.image} ratio="aspect-[3/2]" /> : <div className="aspect-[3/2] bg-cream-200" />}
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-display text-[16px] font-semibold text-ink-900">{f.name}</p>
                      <p className="text-[11.5px] text-ink-400">{o ? `${o.scenario} · 预算${o.budget}` : '内容已移除'}</p>
                    </div>
                    <button type="button" onClick={() => void removeFavorite(f.id)} className="rounded-full p-2 text-ink-400 hover:bg-rose-100 hover:text-rose-700" aria-label="删除收藏">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* 形象档案 */}
      {tab === 'profiles' &&
        (profiles.length === 0 ? (
          <EmptyState
            icon={<UserRound className="h-10 w-10" strokeWidth={1.2} />}
            title="还没有形象档案"
            desc="建立一份档案后，推荐结果会与它关联。"
            action={<Link to="/profile" className="btn-primary">去建立档案</Link>}
          />
        ) : (
          <div className="space-y-3">
            {profiles.map((p) => {
              const rec = recommendations.find((r) => r.profileId === p.id)
              return (
                <div key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="flex items-center gap-2 text-[15px] font-medium text-ink-900">
                        档案 {new Date(p.updatedAt).toLocaleDateString('zh-CN')} 更新
                        {p.completed && (
                          <span className="rounded-full bg-olive-500/15 px-2 py-0.5 text-[11px] text-olive-500">已完成</span>
                        )}
                      </p>
                      <p className="text-[12.5px] text-ink-500">
                        {[p.faceShape && `脸型 ${p.faceShape}`, p.skinTone && `肤色 ${p.skinTone}`, p.likedStyles.length && `喜欢 ${p.likedStyles.length} 个风格`, p.scenarios.length && `场景 ${p.scenarios.length} 个`].filter(Boolean).join(' · ') || '档案信息较少'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {rec && (
                      <Link to="/results" className="btn-ghost px-4 py-2 text-[12.5px]">
                        查看关联推荐
                      </Link>
                    )}
                    <Link to="/profile" className="btn-primary px-4 py-2 text-[12.5px]">
                      继续编辑
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('删除这份档案？关联的推荐记录会保留。')) void removeProfile(p.id)
                      }}
                      className="rounded-full p-2 text-ink-400 hover:bg-rose-100 hover:text-rose-700"
                      aria-label="删除档案"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* 推荐历史 */}
      {tab === 'history' &&
        (recommendations.length === 0 ? (
          <EmptyState
            icon={<History className="h-10 w-10" strokeWidth={1.2} />}
            title="还没有推荐记录"
            desc="完成形象档案并生成推荐后，历史版本会保存在这里。"
            action={<Link to="/profile" className="btn-primary">去生成第一份推荐</Link>}
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((r) => {
              const main = getStyle(r.topStyles[0]?.styleId)
              return (
                <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-4">
                    {main && (
                      <div className="h-14 w-14 overflow-hidden rounded-xl">
                        <SmartImage image={main.image} ratio="aspect-square" />
                      </div>
                    )}
                    <div>
                      <p className="text-[15px] font-medium text-ink-900">
                        {new Date(r.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[12.5px] text-ink-500">
                        主推：{r.topStyles.map((s) => getStyle(s.styleId)?.name).filter(Boolean).join('、')}
                        {r.appliedAdjustments.length > 0 && ' · 含调整'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to="/results" className="btn-ghost px-4 py-2 text-[12.5px]">查看</Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('删除这条推荐记录？')) void removeRecommendation(r.id)
                      }}
                      className="rounded-full p-2 text-ink-400 hover:bg-rose-100 hover:text-rose-700"
                      aria-label="删除记录"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

      {/* 底部引导 */}
      {favTotal === 0 && tab !== 'profiles' && tab !== 'history' && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed border-cream-300 py-8 text-[13.5px] text-ink-500">
          <FileText className="h-5 w-5 text-rose-600" />
          还没有收藏内容？完成形象档案后，推荐结果里的每一项都可以一键收藏。
          <Link to="/profile" className="inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700">
            去生成专属推荐 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
