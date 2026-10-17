import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import { AppProvider } from './store/AppStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Styles from './pages/Styles'
import StyleDetail from './pages/StyleDetail'
import Results from './pages/Results'
import MakeupStudio from './pages/MakeupStudio'
import HairStudio from './pages/HairStudio'
import OutfitStudio from './pages/OutfitStudio'
import Wardrobe from './pages/Wardrobe'
import Trends from './pages/Trends'
import Beginner from './pages/Beginner'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
