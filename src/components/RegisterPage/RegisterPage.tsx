import { type FormEventHandler } from "react";
import "./RegisterPage.css";

type RegisterPageProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  onGoToLogin: () => void;
  errorMessage?: string | null;
};

function RegisterPage({
  onSubmit,
  onGoToLogin,
  errorMessage,
}: RegisterPageProps) {
  return (
    <main className="auth-shell auth-shell--register">
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
                />
              </label>
            </div>

            <button type="submit" className="auth-submit">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already registered?{" "}
            <button
              type="button"
              className="switch-button"
              onClick={onGoToLogin}
            >
              Back to Login
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
