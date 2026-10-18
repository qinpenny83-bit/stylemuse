import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Suspense, useEffect } from 'react'
import { useApp } from '../store/AppStore'
import { TRENDS } from '../data/trends'
import PageLoading from './PageLoading'

const NAV = [
  { to: '/', label: '首页' },
  { to: '/beginner', label: '新手学堂' },
  { to: '/styles', label: '风格探索' },
  { to: '/profile', label: '形象档案' },
  { to: '/results', label: '专属推荐' },
  { to: '/makeup', label: '妆容' },
  { to: '/hair', label: '发型' },
  { to: '/outfits', label: '穿搭' },
  { to: '/trends', label: '潮流' },
  { to: '/wardrobe', label: '我的衣橱' },
] as const

/* 顶部潮流跑马灯：2026 真实趋势名循环滚动 */
const SEP = ['text-rose-400', 'text-gold-400', 'text-coral-500']
function TopTicker() {
  const words = TRENDS.map((t) => t.name)
  const items = [...words, ...words]
  return (
    <div className="overflow-hidden border-b border-ink-900/10 bg-ink-950 py-2 text-[11px] tracking-[0.18em] text-cream-100/75 uppercase">
      <div className="animate-marquee flex w-max items-center whitespace-nowrap">
        {items.map((w, i) => (
          <span key={i} className="flex items-center">
            <span className="px-4">{w}</span>
            <span className={SEP[i % 3]}>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-200/70 bg-cream-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 font-display text-[15px] italic text-gold-300 shadow-soft">
            S
          </span>
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-semibold italic tracking-tight text-ink-900">
              StyleMuse
            </span>
            <span className="hidden text-[10px] tracking-[0.3em] text-ink-400 uppercase sm:block">
              AI Stylist · N°01
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-underline shrink-0 rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors ${
                  isActive
                    ? 'bg-ink-900 text-cream-100'
                    : 'text-ink-700 hover:bg-cream-200/70 hover:text-ink-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/profile"
          className="hidden shrink-0 items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-[13.5px] text-white shadow-soft transition-all hover:bg-rose-500 hover:shadow-lift active:scale-[0.97] md:inline-flex"
        >
          <Sparkles className="h-4 w-4" />
          开始分析
        </Link>
      </div>
    </header>
  )
}

function Footer() {
  const { ready } = useApp()
  return (
    <footer className="mt-24 bg-ink-950 text-cream-100/70">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="font-display text-[26px] font-semibold italic text-cream-50">
              StyleMuse<sup className="text-[13px] text-gold-400">®</sup>
            </p>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-cream-100/60">
              AI 个人形象设计师：结合脸型、肤色、身材比例、审美偏好与生活场景，找到属于你的妆容、发型与穿搭。
            </p>
            <p className="mt-5 text-[11px] tracking-[0.3em] text-gold-400 uppercase">
              The Style Issue · Est. 2026
            </p>
          </div>
          <div className="text-[12.5px] leading-relaxed text-cream-100/60">
            <p className="mb-2 font-medium tracking-[0.2em] text-cream-100 uppercase">数据与隐私</p>
            <p>所有档案、照片与收藏均保存在浏览器本地（IndexedDB），不会上传到任何服务器。</p>
            <p className="mt-1">建议仅供参考，不构成医疗或专业造型诊断。</p>
          </div>
          <div className="text-[12.5px] leading-relaxed text-cream-100/60">
            <p className="mb-2 font-medium tracking-[0.2em] text-cream-100 uppercase">图片说明</p>
            <p>页面示意图均由 AI 按提示词生成，仅作风格参考示意，</p>
            <p>不可直接用于商用印刷或二次分发。</p>
            <p className="mt-3 text-cream-100/40">
              {ready ? '● 本地数据已就绪' : '○ 正在加载本地数据…'}
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream-100/10 pt-6 text-[11.5px] text-cream-100/40 md:flex-row">
          <span>© 2026 StyleMuse — 本地运行 · 隐私优先</span>
          <span className="tracking-[0.24em] uppercase">Made for your style</span>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <TopTicker />
      <Nav />
      <main className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
