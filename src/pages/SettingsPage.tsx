import { useState } from 'react'

function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [autoCheckoutReminder, setAutoCheckoutReminder] = useState(true)

  return (
    <div className="hms-page-stack">
      <section className="hms-panel">
        <h3>System Preferences</h3>
        <div className="hms-form-grid">
          <label className="hms-checkbox-field">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(event) => setEmailAlerts(event.target.checked)}
            />
            Enable email alerts for new bookings
          </label>

          <label className="hms-checkbox-field">
            <input
              type="checkbox"
              checked={autoCheckoutReminder}
              onChange={(event) => setAutoCheckoutReminder(event.target.checked)}
            />
            Enable checkout reminders at 11:00 AM
          </label>
        </div>
      </section>

      <section className="hms-panel">
        <h3>Account & Security</h3>
        <p className="hms-empty-text">
          Placeholder section for password updates, staff roles, and access control
          settings.
        </p>
      </section>
    </div>
  )
}

export default SettingsPage
