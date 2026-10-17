import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Wand2, Layers, Palette, Scissors, Shirt, Bookmark, Compass, ClipboardCheck, DoorOpen } from 'lucide-react'
import { getStyle } from '../data/styles'
import SmartImage from '../components/SmartImage'
import { useApp } from '../store/AppStore'
import { OUTFIT_DESIGNS } from '../data/outfits'
import { MAKEUP_DESIGNS } from '../data/makeup'
import { HAIR_DESIGNS } from '../data/hair'
import { TRENDS } from '../data/trends'

function SectionTitle({
  eyebrow,
  title,
  desc,
  action,
}: {
  eyebrow: string
  title: React.ReactNode
  desc?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="h-px w-9 bg-rose-500/70" />
        <p className="eyebrow text-rose-600">{eyebrow}</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-[28px] leading-tight font-semibold text-ink-900 md:text-[36px]">
          {title}
        </h2>
        {action}
      </div>
      {desc && <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-ink-500">{desc}</p>}
    </div>
  )
}

function Hero() {
  const { currentProfile } = useApp()
  const stats = [
    { n: OUTFIT_DESIGNS.length, label: '套穿搭' },
    { n: MAKEUP_DESIGNS.length, label: '套妆容' },
    { n: HAIR_DESIGNS.length, label: '套发型' },
    { n: TRENDS.length, label: '个潮流' },
  ]
  return (
    <section className="relative overflow-hidden border-b border-cream-200/70">
      {/* 背景超大衬线字 */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 right-0 select-none font-display text-[24vw] leading-none italic text-cream-200/70 md:text-[11vw]"
      >
        Muse
      </span>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24">
        <div className="relative animate-fade-up">
          <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.34em] text-gold-600 uppercase">
            <span className="h-px w-10 bg-gold-500/70" />
            The Style Issue · N°01 — 2026
          </p>
          <h1 className="font-display text-[42px] leading-[1.08] font-semibold tracking-tight text-ink-950 md:text-[58px]">
            找到属于你的
            <br />
            <em className="italic text-rose-600">风格</em>
            ，而不是模板
          </h1>
          <p className="mt-7 max-w-lg text-[15.5px] leading-relaxed text-ink-500">
            结合你的脸型、肤色、身材比例、审美偏好与生活场景，StyleMuse
            为你生成可执行的妆容、发型与穿搭方案。分析在本机完成，档案只属于你。
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/profile" className="btn-accent">
              <Sparkles className="h-4 w-4" />
              开始形象分析
            </Link>
            <Link to="/styles" className="btn-ghost">
              先探索风格
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-[12.5px] text-ink-400">
            {currentProfile
              ? '已保存档案，可继续上次的分析进度'
              : '无需注册 · 数据保存在浏览器本地 · 可随时跳过任何问题'}
          </p>
          {/* 编辑部数据条 */}
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-cream-200/70 pt-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-[26px] leading-none font-semibold text-ink-950">{s.n}</p>
                <p className="mt-1.5 text-[11px] tracking-[0.22em] text-ink-400 uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 拍立得拼贴画廊 */}
        <div className="relative hidden animate-fade-up md:block" style={{ animationDelay: '0.15s' }}>
          <div className="absolute -top-5 -left-7 z-10 -rotate-[4deg] rounded-full border border-gold-400/70 bg-cream-50 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-gold-600 uppercase shadow-soft">
            Runway 2026
          </div>
          <div className="grid grid-cols-2 items-start gap-5">
            <div className="mt-14 -rotate-[2deg] rounded-2xl border border-cream-200 bg-white p-2.5 shadow-lift transition-transform duration-500 hover:rotate-0">
              <SmartImage image={getStyle('japanese-sweet')!.image} ratio="aspect-[3/4]" className="rounded-xl" />
            </div>
            <div className="rotate-[2deg] rounded-2xl border border-cream-200 bg-white p-2.5 shadow-lift transition-transform duration-500 hover:rotate-0">
              <SmartImage image={getStyle('cool-lady')!.image} ratio="aspect-[3/4]" className="rounded-xl" />
              <p className="mt-2 px-1 text-right text-[10px] tracking-[0.28em] text-ink-400 uppercase">
                Beauty is a language
              </p>
            </div>
          </div>
          <div className="absolute -right-4 bottom-4 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full bg-coral-500 font-display text-[13px] tracking-[0.1em] text-white shadow-lift">
            N°01
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickStart() {
  const steps = [
    {
      n: '01',
      to: '/beginner',
      icon: <Compass className="h-5 w-5" />,
      title: '测出你的风格方向',
      desc: '10 题快问快答，3 分钟出结果。不懂时尚术语也没关系，每道题都有白话解释。',
      cta: '去做风格测验',
    },
    {
      n: '02',
      to: '/wardrobe',
      icon: <ClipboardCheck className="h-5 w-5" />,
      title: '勾选你的衣柜',
      desc: '把衣柜里已有的衣服勾出来，系统直接用它们组合出今天能穿的搭配。',
      cta: '打开胶囊衣橱',
    },
    {
      n: '03',
      to: '/outfits',
      icon: <DoorOpen className="h-5 w-5" />,
      title: '照着公式穿出街',
      desc: '先看穿搭公式和雷区对照，再进设计室筛出可照搬的完整方案。',
      cta: '进入穿搭设计室',
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-12 md:px-12 md:py-14">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 right-2 select-none font-display text-[150px] leading-none italic text-cream-100/5"
        >
          New
        </span>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.34em] text-gold-400 uppercase">
              <span className="h-px w-9 bg-gold-500/60" />
              For Newcomers
            </p>
            <h2 className="mt-3 font-display text-[26px] font-semibold text-cream-50 md:text-[32px]">
              完全不懂时尚？<em className="italic text-coral-400">从这三步开始</em>
            </h2>
          </div>
          <Link
            to="/beginner"
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-5 py-2.5 text-[13.5px] font-medium text-white shadow-soft transition-all hover:bg-rose-400 hover:shadow-lift active:scale-[0.98]"
          >
            进入新手学堂
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Link
              key={s.n}
              to={s.to}
              className="group relative overflow-hidden rounded-2xl border border-cream-100/15 bg-cream-100/[0.06] p-6 transition-all hover:-translate-y-1 hover:border-rose-400/60 hover:bg-cream-100/[0.1]"
            >
              <span
                aria-hidden
                className="absolute top-4 right-5 font-display text-[40px] leading-none text-cream-100/10 select-none"
              >
                {s.n}
              </span>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-gold-400 text-white shadow-soft">
                {s.icon}
              </div>
              <h3 className="font-display text-[17px] font-semibold text-cream-50">{s.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-cream-100/70">{s.desc}</p>
              <div className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium text-gold-300">
                {s.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Principles() {
  const items = [
    {
      icon: <Layers className="h-5 w-5" />,
      title: '基于你的真实特征',
      desc: '脸型、肤色、发质、比例与场景都是分析依据，每条建议都说明「为什么适合你」。',
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      title: '方案可执行',
      desc: '妆容有步骤与耗时，发型有给理发师的描述，穿搭有可照搬的组合与预算方案。',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: '隐私留在本机',
      desc: '不上传照片、不注册账号；档案与收藏保存在浏览器本地，刷新不丢失。',
    },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
      <SectionTitle
        eyebrow="About StyleMuse"
        title={<>不是测脸型小游戏，而是<em className="italic text-rose-600">一套形象方案</em></>}
        desc="从自我描述出发，给出有依据、可落地、可持续调整的形象建议。"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <div key={it.title} className="card card-hover relative overflow-hidden p-7">
            <span
              aria-hidden
              className="absolute top-4 right-6 font-display text-[46px] leading-none text-cream-200/70 select-none"
            >
              {`0${i + 1}`}
            </span>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-rose-600 text-white shadow-soft">
              {it.icon}
            </div>
            <h3 className="font-display text-[18px] font-semibold text-ink-900">{it.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function StudioEntries() {
  const entries = [
    {
      to: '/makeup',
      icon: <Palette className="h-5 w-5" />,
      title: '妆容设计室',
      count: `${MAKEUP_DESIGNS.length} 套方案`,
      desc: '日常、通勤、约会、辣妹、御姐……每套都有步骤、耗时与可替换产品，不绑定品牌。',
    },
    {
      to: '/hair',
      icon: <Scissors className="h-5 w-5" />,
      title: '发型设计室',
      count: `${HAIR_DESIGNS.length} 套方案`,
      desc: '按脸型、发质、发量与打理时间筛选，附「可直接说给理发师听」的需求描述。',
    },
    {
      to: '/outfits',
      icon: <Shirt className="h-5 w-5" />,
      title: '穿搭设计室',
      count: `${OUTFIT_DESIGNS.length} 套方案`,
      desc: '按场景、季节与预算筛选搭配方案，上装、下装、鞋包、配色一应俱全。',
    },
  ]
  return (
    <section className="border-y border-cream-200/70 bg-cream-100/60">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <SectionTitle
          eyebrow="Three Studios"
          title={<>妆容 · 发型 · 穿搭，<em className="italic text-rose-600">三个独立设计室</em></>}
          desc="三个方案库相互独立、可自由浏览，也会与你的推荐结果联动。"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {entries.map((e, i) => (
            <Link
              key={e.to}
              to={e.to}
              className="group card card-hover relative flex flex-col overflow-hidden p-7"
            >
              <span
                aria-hidden
                className="absolute top-4 right-6 font-display text-[46px] leading-none text-cream-200/70 transition-colors select-none group-hover:text-rose-200"
              >
                {`0${i + 1}`}
              </span>
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-gold-300 shadow-soft">
                  {e.icon}
                </div>
                <span className="pill-rose">{e.count}</span>
              </div>
              <h3 className="font-display text-[19px] font-semibold text-ink-900">{e.title}</h3>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-ink-500">{e.desc}</p>
              <div className="mt-5 flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                进入设计室
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedStyles() {
  const featured = ['japanese-sweet', 'korean-sweet', 'street-sweet', 'dark-cool', 'gentle-lady', 'minimal-lux', 'french-lazy', 'new-chinese']
    .map((id) => getStyle(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-24">
      <SectionTitle
        eyebrow="Style Gallery"
        title={<>精选<em className="italic text-rose-600">风格</em></>}
        desc="第一批共 16 种细分风格，每一种都有完整的内容体系与详情页，支持风格混搭。"
        action={
          <Link
            to="/styles"
            className="mb-10 inline-flex items-center gap-1.5 text-[14px] font-medium text-rose-600 transition-colors hover:text-rose-700"
          >
            查看全部 16 种风格
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
        {featured.map((s) => (
          <Link key={s.id} to={`/styles/${s.id}`} className="group">
            <div className="rounded-2xl border border-cream-200/80 bg-white p-2 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
              <div className="relative overflow-hidden rounded-xl">
                <SmartImage image={s.image} ratio="aspect-[3/4]" />
                <div
                  className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-ink-950/50 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <span className="text-[10.5px] tracking-[0.22em] text-cream-50 uppercase">View →</span>
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex items-baseline justify-between gap-2 px-0.5">
              <div>
                <p className="font-display text-[16.5px] font-semibold text-ink-900">{s.name}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-400">{s.tagline}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', title: '建立形象档案', desc: '照片可选，其余问题都可跳过；信息越完整，建议越贴合。' },
    { n: '02', title: '生成专属推荐', desc: '规则引擎结合你的特征与偏好，给出前三种风格与混合方案。' },
    { n: '03', title: '深入探索与调整', desc: '妆容、发型、穿搭三室联动；7 种调整方向可随时微调。' },
    { n: '04', title: '收藏进我的衣橱', desc: '收藏喜欢的方案与搭配，逐步建立起属于你的风格体系。' },
  ]
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:pb-24">
      <SectionTitle eyebrow="How it works" title={<>四个步骤，建立你的<em className="italic text-rose-600">风格体系</em></>} />
      <div className="grid gap-8 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.n} className="relative">
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className="absolute top-6 left-12 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-rose-300 to-gold-300 md:block"
              />
            )}
            <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-200 bg-white font-display text-[16px] tracking-[0.1em] text-rose-600 shadow-soft">
              {s.n}
            </div>
            <h3 className="mt-5 font-display text-[17px] font-semibold text-ink-900">{s.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CtaBanner() {
  const { currentProfile } = useApp()
  return (
    <section className="mx-auto max-w-6xl px-4 pb-4">
      <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-16 md:px-14 md:py-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 right-2 select-none font-display text-[160px] leading-none italic text-cream-100/5"
        >
          Muse
        </span>
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.34em] text-gold-400 uppercase">
              <span className="h-px w-9 bg-gold-500/60" />
              Get Started
            </p>
            <h2 className="mt-4 font-display text-[30px] leading-tight font-semibold text-cream-50 md:text-[38px]">
              现在就开始，
              <em className="italic text-coral-400">认识你的风格</em>
            </h2>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-cream-100/70">
              几分钟完成档案，立刻获得专属建议；随时调整，让风格跟随你的生活一起生长。
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-7 py-3.5 text-[15px] text-white shadow-soft transition-all hover:bg-rose-400 hover:shadow-lift active:scale-[0.98]"
            >
              {currentProfile ? <Bookmark className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              {currentProfile ? '继续我的形象档案' : '开始形象分析'}
            </Link>
            <Link
              to="/styles"
              className="inline-flex items-center justify-center rounded-full border border-cream-100/40 px-7 py-3.5 text-[15px] text-cream-100 transition-colors hover:border-cream-100"
            >
              浏览风格库
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <Hero />
      <QuickStart />
      <Principles />
      <StudioEntries />
      <FeaturedStyles />
      <HowItWorks />
      <CtaBanner />
    </div>
  )
}
