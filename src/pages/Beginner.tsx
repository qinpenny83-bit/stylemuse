/* 新手学堂：风格测验 / 穿搭公式 / 雷区对照 / 时尚词典 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, RefreshCcw, CheckCircle2, XCircle, Palette, Shirt, Zap, Layers, Backpack,
  CalendarDays, Search, Sparkles, Shuffle, BookOpen, Heart, Wand2, Lightbulb,
} from 'lucide-react'
import { QUIZ_QUESTIONS, runQuiz } from '../data/quiz'
import { GLOSSARY, type GlossaryCategory } from '../data/glossary'
import { getStyle } from '../data/styles'
import SmartImage from '../components/SmartImage'

const TABS = [
  { id: 'quiz', label: '风格测验' },
  { id: 'formula', label: '穿搭公式' },
  { id: 'mistake', label: '雷区对照' },
  { id: 'glossary', label: '时尚词典' },
] as const

function Header() {
  return (
    <div className="mb-10">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-9 bg-rose-500/70" />
        <p className="eyebrow text-rose-600">Style 101 · 新手学堂</p>
      </div>
      <h1 className="font-display text-[30px] font-semibold text-ink-900 md:text-[38px]">
        不懂时尚？<em className="italic text-rose-600">从这里开始</em>
      </h1>
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-ink-500">
        3 分钟测出你的风格方向，学会几条万能公式，避开常见雷区，再查查术语——照着做就能出门。
      </p>
      <nav className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="chip">
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

/* ---------------- 风格测验 ---------------- */

function QuizCard() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const q = QUIZ_QUESTIONS[step]
  const result = useMemo(() => (done ? runQuiz(answers) : null), [done, answers])
  const top = result ? getStyle(result.top.styleId) : undefined
  const second = result ? getStyle(result.second.styleId) : undefined
  const third = result ? getStyle(result.third.styleId) : undefined

  const choose = (i: number) => {
    const next = [...answers]
    next[step] = i
    setAnswers(next)
    if (step < QUIZ_QUESTIONS.length - 1) setStep(step + 1)
    else setDone(true)
  }

  const restart = () => {
    setStep(0)
    setAnswers([])
    setDone(false)
  }

  if (done && top) {
    return (
      <div className="card card-hover overflow-hidden">
        <div className="relative">
          <SmartImage image={top.image} ratio="aspect-[16/9]" eager />
          <span className="absolute top-3 left-3 rounded-full bg-ink-900/85 px-3 py-1 font-display text-[13px] text-cream-100">
            你的主风格 · No.1
          </span>
        </div>
        <div className="p-6">
          <h3 className="font-display text-[24px] font-semibold text-ink-900">
            {top.name}
            <span className="ml-2 text-[13px] font-normal text-ink-400">{top.enName}</span>
          </h3>
          <p className="mt-1 text-[13.5px] text-rose-600">{top.tagline}</p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-700">{top.suitedFor}</p>

          <div className="mt-4 space-y-2 rounded-xl bg-cream-100/70 p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-900">
              <Shuffle className="h-4 w-4 text-rose-600" />
              可以这样混搭
            </p>
            {second && <p className="text-[13px] leading-relaxed text-ink-700">主要走「{top.name}」的氛围，用「{second.name}」的单品做点缀：{second.tagline}</p>}
            {third && <p className="text-[13px] leading-relaxed text-ink-700">偶尔想换心情，可以借鉴「{third.name}」的配色或配饰。</p>}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={`/styles/${top.id}`} className="btn-accent px-5 py-2.5 text-[13.5px]">
              查看风格详情
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/outfits" className="btn-ghost px-5 py-2.5 text-[13.5px]">
              去穿搭设计室
            </Link>
            <button type="button" onClick={restart} className="btn-ghost px-5 py-2.5 text-[13.5px]">
              <RefreshCcw className="h-4 w-4" />
              重测一次
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="eyebrow text-rose-600">第 {step + 1} / {QUIZ_QUESTIONS.length} 题</p>
        <button
          type="button"
          onClick={restart}
          disabled={step === 0 && answers.length === 0}
          className="inline-flex items-center gap-1 text-[12.5px] text-ink-400 transition-colors hover:text-rose-600 disabled:opacity-40"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          重新开始
        </button>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-cream-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-gold-400 transition-all duration-500"
          style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
        />
      </div>
      <h3 className="font-display text-[20px] font-semibold text-ink-900 md:text-[24px]">{q.title}</h3>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {q.options.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => choose(i)}
            className="group flex items-center gap-4 rounded-xl border border-cream-300 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-soft active:scale-[0.98]"
          >
            {o.swatch && (
              <span className="flex shrink-0 items-center overflow-hidden rounded-full border border-cream-200">
                {o.swatch.map((c) => (
                  <span key={c} className="h-6 w-6" style={{ background: c }} />
                ))}
              </span>
            )}
            <span className="flex-1">
              <span className="block text-[14.5px] font-medium text-ink-900">{o.label}</span>
              {o.hint && <span className="mt-0.5 block text-[12px] text-ink-400">{o.hint}</span>}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-rose-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>
      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-ink-400 transition-colors hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          上一题
        </button>
      )}
    </div>
  )
}

/* ---------------- 穿搭公式 ---------------- */

const FORMULAS = [
  {
    icon: <Palette className="h-5 w-5" />,
    title: '三色原则',
    desc: '全身主色不超过 3 个，立刻告别"穿得乱"。',
    steps: ['主色占 60%：上衣或下装的大面积色', '辅色占 30%：第二大面积，负责协调', '点缀色占 10%：鞋、包或配饰选一处'],
  },
  {
    icon: <Shirt className="h-5 w-5" />,
    title: '上紧下松 / 上松下紧',
    desc: '上下只突出一个重点，比例立刻好。',
    steps: ['上身修身 → 下装选宽松的（阔腿裤、A字裙）', '上身宽松 → 下装收紧（直筒裤、短裙）', '两头都松 = 没形；两头都紧 = 不自在'],
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: '腰线 = 比例之王',
    desc: '把腰线亮出来，显高显瘦第一步。',
    steps: ['上衣塞进下装，露出裤腰/裙腰', '或用腰带、短外套强调腰的位置', '上短下长最省力：短上衣+高腰下装'],
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: '同色系叠穿',
    desc: '同色深浅搭配，最不费力的"高级感"。',
    steps: ['选一个主色，如米色或棕色系', '深色外 + 浅色内，或反过来', '材质错开：针织+衬衫+外套，层次更分明'],
  },
  {
    icon: <Backpack className="h-5 w-5" />,
    title: '胶囊衣橱 10 件套',
    desc: '10 件基础款 = 30 种组合，够穿一个月。',
    steps: ['5 件上装：白T、条纹衫、针织开衫、衬衫、打底衫', '3 件下装：直筒牛仔裤、阔腿裤、半身裙', '2 双鞋：小白鞋 + 乐福鞋'],
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: '场合速查表',
    desc: '先定调再穿衣，不会穿错场合。',
    steps: ['通勤：衬衫/针织 + 西装裤/直筒裤 + 乐福鞋', '约会：裙装或浅色系 + 腋下包', '聚会：小黑裙/西装 + 高跟鞋 + 亮色点缀'],
  },
]

function FormulaSection() {
  return (
    <section id="formula" className="scroll-mt-24">
      <SectionHead num="02" title="穿搭万能公式" desc="不用懂潮流也能照抄的 6 条公式。" icon={<Lightbulb className="h-4 w-4" />} />
      <div className="grid gap-4 md:grid-cols-3">
        {FORMULAS.map((f) => (
          <div key={f.title} className="card card-hover p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-gold-300">
              {f.icon}
            </div>
            <h3 className="font-display text-[17px] font-semibold text-ink-900">{f.title}</h3>
            <p className="mt-1 text-[12.5px] text-ink-500">{f.desc}</p>
            <ul className="mt-3 space-y-1.5">
              {f.steps.map((s) => (
                <li key={s} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- 雷区对照 ---------------- */

const MISTAKES = [
  { bad: '颜色堆太满', badDesc: '红裤子+绿上衣+黄包，全身上下一堆亮色。', good: '先按三色原则收', goodDesc: '只留一个亮色做点缀，其余用黑白灰压住。' },
  { bad: '腰线被淹没', badDesc: '长上衣+长裙，上下一样长，人显矮。', good: '把上衣塞进下装', goodDesc: '露出腰线，或用腰带、短外套重新切比例。' },
  { bad: '全身都宽松', badDesc: 'oversize 上衣+阔腿裤+大包，找不到重点。', good: '一处收紧', goodDesc: '露脚踝、扎腰、或换修身上装，松紧结合才有型。' },
  { bad: '件件都想抢戏', badDesc: '印花+亮片+夸张首饰全上身。', good: '一次只留一个亮点', goodDesc: '衣服花就配饰素，衣服素就配饰点睛。' },
  { bad: '场合错配', badDesc: '去聚会穿得像去开会，或约会穿得像去健身。', good: '先定场合基调', goodDesc: '按「场合速查表」选大类，再往里加细节。' },
  { bad: '盲目跟风', badDesc: '博主穿好看就买同款，回家发现不适合自己。', good: '先看适不适合自己', goodDesc: '先做风格测验，再对照身形、肤色挑选类似款。' },
]

function MistakeSection() {
  return (
    <section id="mistake" className="scroll-mt-24">
      <SectionHead num="03" title="新手雷区对照" desc="穿错的 6 个常见坑，一正一反马上看懂。" icon={<Heart className="h-4 w-4" />} />
      <div className="grid gap-4 md:grid-cols-2">
        {MISTAKES.map((m) => (
          <div key={m.bad} className="card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-cream-200/70 bg-rose-100/50 px-5 py-3">
              <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="text-[13px] font-semibold text-rose-700">{m.bad}</span>
            </div>
            <p className="px-5 pt-3 text-[12.5px] leading-relaxed text-ink-500">{m.badDesc}</p>
            <div className="flex items-center gap-2 border-b border-cream-200/70 bg-gold-300/30 px-5 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-600" />
              <span className="text-[13px] font-semibold text-gold-600">{m.good}</span>
            </div>
            <p className="px-5 py-3 text-[12.5px] leading-relaxed text-ink-700">{m.goodDesc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------------- 时尚词典 ---------------- */

const CAT_LABELS: Record<GlossaryCategory | '全部', string> = {
  全部: '全部',
  trend: '趋势词',
  item: '单品词',
  makeup: '妆容词',
}

function GlossarySection() {
  const [kw, setKw] = useState('')
  const [cat, setCat] = useState<GlossaryCategory | '全部'>('全部')
  const list = useMemo(
    () =>
      GLOSSARY.filter(
        (g) =>
          (cat === '全部' || g.category === cat) &&
          (!kw.trim() || g.term.includes(kw.trim()) || g.en.toLowerCase().includes(kw.trim().toLowerCase())),
      ),
    [kw, cat],
  )
  return (
    <section id="glossary" className="scroll-mt-24">
      <SectionHead num="04" title="时尚词典" desc="看不懂的词，搜一下马上明白。" icon={<BookOpen className="h-4 w-4" />} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜「胶囊衣橱」「Quiet Luxury」…"
            className="field-input pl-10"
          />
        </label>
        <div className="flex gap-1.5">
          {(['全部', 'trend', 'item', 'makeup'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cat === c ? 'chip chip-on' : 'chip'}
            >
              {CAT_LABELS[c]}
              <span className="opacity-70">{c === '全部' ? GLOSSARY.length : GLOSSARY.filter((g) => g.category === c).length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {list.map((g) => (
          <div key={g.term} className="card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-display text-[16px] font-semibold text-ink-900">{g.term}</p>
              <span className="text-[11px] tracking-[0.12em] text-ink-400 uppercase">{g.en}</span>
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{g.def}</p>
            {g.link && (
              <Link to={g.link} className="mt-2 inline-flex items-center gap-1 text-[12px] text-rose-600 hover:underline">
                查看相关方案
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div className="card p-8 text-center text-[13.5px] text-ink-400 md:col-span-2">没有匹配的术语，换个词试试。</div>
        )}
      </div>
    </section>
  )
}

function SectionHead({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-gold-400 text-white shadow-soft">
          {icon}
        </span>
        <div>
          <p className="editorial-num">N°{num}</p>
          <h2 className="font-display text-[24px] font-semibold text-ink-900">{title}</h2>
        </div>
      </div>
      <p className="hidden max-w-xs text-right text-[13px] text-ink-500 sm:block">{desc}</p>
    </div>
  )
}

export default function Beginner() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Header />
      <div className="space-y-16">
        <section id="quiz" className="scroll-mt-24">
          <SectionHead num="01" title="3 分钟风格测验" desc="10 题快问快答，测出你的主风格与混搭方向。" icon={<Wand2 className="h-4 w-4" />} />
          <QuizCard />
        </section>
        <FormulaSection />
        <MistakeSection />
        <GlossarySection />
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-ink-950 px-6 py-10 text-center">
          <Sparkles className="h-6 w-6 text-gold-400" />
          <p className="font-display text-[22px] font-semibold text-cream-50">
            测完了？下一步去<em className="italic text-rose-400">设计室</em>看看完整方案
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link to="/outfits" className="btn-accent px-5 py-2.5 text-[13.5px]">穿搭设计室</Link>
            <Link to="/makeup" className="btn-ghost px-5 py-2.5 text-[13.5px] !border-cream-100/40 !text-cream-100">妆容设计室</Link>
            <Link to="/hair" className="btn-ghost px-5 py-2.5 text-[13.5px] !border-cream-100/40 !text-cream-100">发型设计室</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
