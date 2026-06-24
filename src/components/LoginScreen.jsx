import { useState } from 'react'
import { login } from '../lib/supabase'

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = await login(email, password)
      onLogin(session)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-stone-50">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-800 text-stone-50 font-display text-2xl mb-4">
            L
          </div>
          <h1 className="font-display text-3xl text-stone-900 tracking-tight">Ledger</h1>
          <p className="font-mono text-xs text-stone-500 mt-2 uppercase tracking-widest">
            Spending from your SMS
          </p>
        </header>

        <form onSubmit={handleSubmit} className="border border-dashed border-stone-200 p-6">
          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-stone-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1 w-full bg-transparent border-b border-stone-200 py-2 font-mono text-sm text-stone-900 focus:outline-none focus:border-teal-800"
            />
          </label>

          <label className="block mb-6">
            <span className="font-mono text-xs uppercase tracking-wider text-stone-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full bg-transparent border-b border-stone-200 py-2 font-mono text-sm text-stone-900 focus:outline-none focus:border-teal-800"
            />
          </label>

          {error && (
            <p className="font-mono text-xs text-orange-700 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-800 text-stone-50 font-mono text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
