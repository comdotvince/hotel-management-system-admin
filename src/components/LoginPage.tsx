import { type FormEventHandler } from 'react'

type LoginMode = 'login' | 'signup'

type LoginPageProps = {
  mode: LoginMode
  onSubmit: FormEventHandler<HTMLFormElement>
  onToggleMode: () => void
}

function LoginPage({ mode, onSubmit, onToggleMode }: LoginPageProps) {
  const isLogin = mode === 'login'

  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <img
          src="/ChatGPT Image Feb 17, 2026, 10_29_33 AM.png"
          alt="ChatGPT illustration"
        />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="auth-eyebrow">Hotel Management System</p>
          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Log in to continue managing your property.'
              : 'Sign up to start using the hotel admin dashboard.'}
          </p>

          <form className="auth-form" onSubmit={onSubmit}>
            {!isLogin && (
              <label className="field">
                Full name
                <input
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="field">
              Email
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="field">
              Password
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </label>

            {!isLogin && (
              <label className="field">
                Confirm password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </label>
            )}

            <button type="submit" className="auth-submit">
              {isLogin ? 'Log in' : 'Sign up'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
            <button type="button" className="switch-button" onClick={onToggleMode}>
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
