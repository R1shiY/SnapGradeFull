import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom'
import { SingleGrader } from './pages/SingleGrader'
import { BatchGrader } from './pages/BatchGrader'
import { SettingsPage } from './pages/Settings'
import { LoginPage } from './pages/Login'
import { Sparkles, UploadCloud, Layers, Settings, LogIn } from 'lucide-react'
import { useState } from 'react'

export default function App() {
  const [isAuthenticated, setAuthenticated] = useState(false)
  const navigate = useNavigate()
  const signOut = () => {
    setAuthenticated(false)
    navigate('/login')
  }

  const Protected = ({ children }: { children: JSX.Element }) =>
    isAuthenticated ? children : <Navigate to="/login" replace />

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-accent shadow-soft grid place-items-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight">SnapGrade</span>
              <span className="text-xs text-slate-500">AI-powered STEM grader</span>
            </div>
          </div>

          {isAuthenticated && (
            <nav className="flex items-center gap-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-sky-100 text-sky-700' : 'hover:bg-slate-100'
                  }`
                }
              >
                <span className="inline-flex gap-1 items-center">
                  <UploadCloud size={16} /> Single Grade
                </span>
              </NavLink>
              <NavLink
                to="/batch"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-sky-100 text-sky-700' : 'hover:bg-slate-100'
                  }`
                }
              >
                <span className="inline-flex gap-1 items-center">
                  <Layers size={16} /> Batch Grade
                </span>
              </NavLink>
            </nav>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-2 ${
                    isActive ? 'bg-sky-100 text-sky-700' : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                  }`
                }
              >
                <Settings size={16} /> Settings
              </NavLink>
              <button
                onClick={signOut}
                className="px-3 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <LogIn size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={() => setAuthenticated(true)} />} />
          <Route path="/" element={<Protected><SingleGrader /></Protected>} />
          <Route path="/batch" element={<Protected><BatchGrader /></Protected>} />
          <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
        </Routes>
      </main>
    </div>
  )
}