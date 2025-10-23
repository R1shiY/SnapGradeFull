import { useNavigate } from 'react-router-dom'

type Props = { onLogin: () => void }

export function LoginPage({ onLogin }: Props) {
  const navigate = useNavigate()

  const handleLogin = () => {
    onLogin()      // mark authenticated (any credentials accepted for now)
    navigate('/')  // go to Single Grader
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-soft">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold">Welcome back</h3>
          <p className="text-sm text-slate-500">Log in to manage grading</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              placeholder="you@school.edu"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="rounded border-slate-300" />
              Remember me
            </label>
            <a href="#" className="text-sm text-sky-700 hover:underline">Forgot password?</a>
          </div>
          <button
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md px-4 py-2"
            onClick={handleLogin}
          >
            Log In
          </button>
          <p className="text-xs text-slate-500 text-center">
            Any credentials work for now. Auth will be wired later.
          </p>
        </div>
      </div>
    </div>
  )
}