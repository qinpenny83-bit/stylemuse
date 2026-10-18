import { StrictMode, lazy, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  isRouteErrorResponse,
  useRouteError,
  Link,
} from 'react-router-dom'
import './index.css'
import { AppProvider } from './store/AppStore'
import Layout from './components/Layout'

/* 路由级代码分割：首屏只下载当前页面所需的代码 */
const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile'))
const Styles = lazy(() => import('./pages/Styles'))
const StyleDetail = lazy(() => import('./pages/StyleDetail'))
const Results = lazy(() => import('./pages/Results'))
const MakeupStudio = lazy(() => import('./pages/MakeupStudio'))
const HairStudio = lazy(() => import('./pages/HairStudio'))
const OutfitStudio = lazy(() => import('./pages/OutfitStudio'))
const Wardrobe = lazy(() => import('./pages/Wardrobe'))
const Trends = lazy(() => import('./pages/Trends'))
const Beginner = lazy(() => import('./pages/Beginner'))

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      {children}
    </div>
  )
}

/** 路由异常兜底，避免整站白屏 */
function RouteError() {
  const error = useRouteError() as unknown
  const status = isRouteErrorResponse(error) ? error.status : 0
  const message =
    isRouteErrorResponse(error) ? error.statusText : error instanceof Error ? error.message : '未知错误'

  return (
    <Shell>
      <p className="font-display text-5xl text-ink-900/20">{status || '!'}</p>
      <h1 className="mt-4 font-display text-2xl text-ink-900">页面出了点问题</h1>
      <p className="mt-2 text-sm text-ink-700/70">{message}</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-ink-900 px-6 py-2.5 text-sm text-cream-100 transition hover:bg-ink-800"
      >
        回到首页
      </Link>
    </Shell>
  )
}

function NotFound() {
  return (
    <Shell>
      <p className="font-display text-5xl text-ink-900/20">404</p>
      <h1 className="mt-4 font-display text-2xl text-ink-900">没有找到这个页面</h1>
      <p className="mt-2 text-sm text-ink-700/70">链接可能已经失效，或者地址输入有误。</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-ink-900 px-6 py-2.5 text-sm text-cream-100 transition hover:bg-ink-800"
      >
        回到首页
      </Link>
    </Shell>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      { path: 'beginner', element: <Beginner /> },
      { path: 'profile', element: <Profile /> },
      { path: 'styles', element: <Styles /> },
      { path: 'styles/:id', element: <StyleDetail /> },
      { path: 'results', element: <Results /> },
      { path: 'makeup', element: <MakeupStudio /> },
      { path: 'hair', element: <HairStudio /> },
      { path: 'outfits', element: <OutfitStudio /> },
      { path: 'trends', element: <Trends /> },
      { path: 'wardrobe', element: <Wardrobe /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
)
