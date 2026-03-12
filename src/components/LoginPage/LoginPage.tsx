import { type FormEventHandler, useState } from "react";
import "./LoginPage.css";

/* ─── SVG Icons (inline, no extra dep) ─── */
function IconEye() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function IconAlertCircle() {
  return (
    <svg
      className="auth-error-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

/* ─── Types ─── */
type LoginPageProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  onGoToRegister: () => void;
  errorMessage?: string | null;
  isLoading?: boolean;
};

/* ─── Component ─── */
function LoginPage({
  onSubmit,
  onGoToRegister,
  errorMessage,
  isLoading = false,
}: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-shell">
      {/* ── Left: Visual ── */}
      <section className="auth-visual auth-visual--blend">
        <img
          src="/ChatGPT Image Feb 17, 2026, 10_29_33 AM.png"
          alt="Hotel admin illustration"
        />
        {/* <div className="auth-visual-overlay">
          <div className="auth-visual-content">
            <h2 className="auth-visual-title">
              Streamline Your
              <br />
              Hotel Operations
            </h2>
            <p className="auth-visual-desc">
              Manage bookings, rooms, and guests — all from one centralized
              dashboard.
            </p>
          </div>
        </div> */}
      </section>

      {/* ── Right: Form ── */}
      <section className="auth-panel" aria-label="Login panel">
        <div className="auth-card">
          {/* Header */}
          <p className="auth-eyebrow" aria-hidden="true">
            Hotel Management System
          </p>

          <h1 className="auth-heading" id="login-heading">
            Welcome <em>back</em>
          </h1>

          <p className="auth-subtitle">
            Sign in to your admin dashboard to manage bookings, guests, and
            operations.
          </p>

          {/* ── Accessible error region ──
              Keep the div in the DOM at all times so the role="alert"
              region is already registered when content is injected. */}
          <div role="alert" aria-live="assertive" aria-atomic="true">
            {errorMessage && (
              <p className="auth-error">
                <IconAlertCircle />
                {errorMessage}
              </p>
            )}
          </div>

          {/* ── Form ── */}
          <form
            className="auth-form"
            onSubmit={onSubmit}
            aria-labelledby="login-heading"
            noValidate
          >
            {/* Email */}
            <div className="field">
              <label className="field-label" htmlFor="login-email">
                Email address
                <span className="field-required" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="field-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="admin@yourhotel.com"
                  autoComplete="email"
                  required
                  aria-required="true"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label className="field-label" htmlFor="login-password">
                Password
                <span className="field-required" aria-hidden="true">
                  *
                </span>
              </label>
              <div className="field-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                  data-has-toggle="true"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="field-eye"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={0}
                  disabled={isLoading}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                "Sign in to dashboard"
              )}
            </button>
          </form>

          {/* Switch to register */}
          <div className="auth-divider" aria-hidden="true">
            <span className="auth-divider-text">or</span>
          </div>

          <p className="auth-switch">
            Need admin access?{" "}
            <button
              type="button"
              className="switch-button"
              onClick={onGoToRegister}
              disabled={isLoading}
            >
              Request an account
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
