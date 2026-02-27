import { type FormEventHandler } from "react";

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
    <main className="auth-shell">
      <section className="auth-visual">
        <img
          src="/ChatGPT Image Feb 17, 2026, 10_29_33 AM.png"
          alt="Hotel admin illustration"
        />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="auth-eyebrow">Hotel Management System</p>
          <h1>Admin Registration</h1>
          <p className="auth-subtitle">Create an admin account to manage the system.</p>
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

            <button type="submit" className="auth-submit">
              Register
            </button>
          </form>

          <p className="auth-switch">
            Already registered?{" "}
            <button type="button" className="switch-button" onClick={onGoToLogin}>
              Back to Login
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
