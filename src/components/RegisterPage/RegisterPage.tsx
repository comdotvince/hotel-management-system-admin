import { type FormEventHandler } from 'react'
import './RegisterPage.css'

type RegisterPageProps = {
  onSubmit: FormEventHandler<HTMLFormElement>
  onGoToLogin: () => void
  errorMessage?: string | null
  isLoading?: boolean
}

function RegisterPage({
  onSubmit,
  onGoToLogin,
  errorMessage,
  isLoading = false,
}: RegisterPageProps) {
  return (
    <main className="auth-shell auth-shell--register">
      <section className="auth-visual auth-visual--blend">
        <img
          src="/ChatGPT Image Feb 17, 2026, 10_29_33 AM.png"
          alt="Hotel admin illustration"
        />
      </section>

      <section className="auth-panel">
        <div className="auth-card auth-card--register">
          <p className="auth-eyebrow">Hotel Management System</p>
          <h1>Create Account</h1>
          <p className="auth-subtitle">
            Set up your admin credentials to get started.
          </p>
          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <form className="auth-form" onSubmit={onSubmit}>
            <label className="field">
              Full Name
              <input
                type="text"
                name="fullName"
                placeholder="Jane Doe"
                autoComplete="name"
                required
                disabled={isLoading}
              />
            </label>

            <label className="field">
              Email
              <input
                type="email"
                name="email"
                placeholder="admin@example.com"
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </label>

            <div className="auth-form-row">
              <label className="field">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
              </label>

              <label className="field">
                Confirm Password
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />
              </label>
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered?{' '}
            <button
              type="button"
              className="switch-button"
              onClick={onGoToLogin}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage
