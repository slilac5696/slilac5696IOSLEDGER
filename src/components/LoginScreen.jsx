import { useState } from 'react'
import { login, signUp } from '../lib/supabase'
import { resetPassword } from '../lib/resetPassword'
import { isValidUsername, isValidPassword } from '../lib/auth'

const MODES = {
  signin: 'signin',
  signup: 'signup',
  reset: 'reset',
}

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState(MODES.signin)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
    setSuccess('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const trimmedUser = username.trim()
    const trimmedPass = password.trim()

    if (!trimmedUser || !trimmedPass) {
      setError('Username and password are required.')
      return
    }

    if (mode === MODES.signup) {
      if (!isValidUsername(trimmedUser) && !trimmedUser.includes('@')) {
        setError('Username: 3–32 characters, letters, numbers, underscore only.')
        return
      }
      if (!isValidPassword(trimmedPass)) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (trimmedPass !== confirmPassword.trim()) {
        setError('Passwords do not match.')
        return
      }
    }

    if (mode === MODES.reset) {
      if (!isValidPassword(trimmedPass)) {
        setError('Password must be at least 6 characters.')
        return
      }
      if (trimmedPass !== confirmPassword.trim()) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === MODES.signin) {
        const session = await login(trimmedUser, trimmedPass)
        onLogin(session)
      } else if (mode === MODES.signup) {
        const session = await signUp(trimmedUser, trimmedPass)
        onLogin(session)
      } else if (mode === MODES.reset) {
        await resetPassword(trimmedUser, trimmedPass)
        setSuccess('Password updated. You can sign in now.')
        setPassword('')
        setConfirmPassword('')
        setMode(MODES.signin)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    [MODES.signin]: 'Sign in',
    [MODES.signup]: 'Create account',
    [MODES.reset]: 'Reset password',
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-stone-50">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-800 text-stone-50 font-display text-2xl mb-4">
            L
          </div>
          <h1 className="font-display text-3xl text-stone-900 tracking-tight">Ledger</h1>
          <p className="font-mono text-xs text-stone-500 mt-2 uppercase tracking-widest">
            Spending from your SMS
          </p>
        </header>

        <div className="flex gap-4 mb-6 font-mono text-[11px] uppercase tracking-wider justify-center">
          <button
            type="button"
            onClick={() => switchMode(MODES.signin)}
            className={mode === MODES.signin ? 'text-teal-800' : 'text-stone-400'}
          >
            Sign in
          </button>
          <span className="text-stone-300">·</span>
          <button
            type="button"
            onClick={() => switchMode(MODES.signup)}
            className={mode === MODES.signup ? 'text-teal-800' : 'text-stone-400'}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="border border-stone-200 p-6 bg-white">
          <p className="font-mono text-[10px] uppercase tracking-widest text-stone-400 mb-4">
            {titles[mode]}
          </p>

          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-stone-500">
              {mode === MODES.signin && username.includes('@') ? 'Username or email' : 'Username'}
            </span>
            <input
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="e.g. slilac"
              className="mt-1 w-full bg-transparent border-b border-stone-200 py-2 font-mono text-sm text-stone-900 focus:outline-none focus:border-teal-800"
            />
          </label>

          <label className="block mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-stone-500">
              {mode === MODES.reset ? 'New password' : 'Password'}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === MODES.signin ? 'current-password' : 'new-password'}
              className="mt-1 w-full bg-transparent border-b border-stone-200 py-2 font-mono text-sm text-stone-900 focus:outline-none focus:border-teal-800"
            />
          </label>

          {(mode === MODES.signup || mode === MODES.reset) && (
            <label className="block mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-stone-500">
                Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 w-full bg-transparent border-b border-stone-200 py-2 font-mono text-sm text-stone-900 focus:outline-none focus:border-teal-800"
              />
            </label>
          )}

          {mode === MODES.signup && (
            <p className="font-mono text-[10px] text-stone-400 mb-4 leading-relaxed">
              Pick a username and password. No email needed.
            </p>
          )}

          {error && <p className="font-mono text-xs text-orange-700 mb-4">{error}</p>}
          {success && <p className="font-mono text-xs text-emerald-700 mb-4">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-800 text-stone-50 font-mono text-sm uppercase tracking-wider disabled:opacity-50"
          >
            {loading
              ? 'Please wait…'
              : mode === MODES.signin
                ? 'Sign in'
                : mode === MODES.signup
                  ? 'Create account'
                  : 'Update password'}
          </button>

          {mode === MODES.signin && (
            <button
              type="button"
              onClick={() => switchMode(MODES.reset)}
              className="w-full mt-4 font-mono text-xs text-stone-500 underline underline-offset-2"
            >
              Forgot password?
            </button>
          )}

          {mode === MODES.reset && (
            <button
              type="button"
              onClick={() => switchMode(MODES.signin)}
              className="w-full mt-4 font-mono text-xs text-stone-500"
            >
              Back to sign in
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
