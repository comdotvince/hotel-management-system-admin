import { useEffect } from 'react'
import type { ReactNode } from 'react'

type AppModalProps = {
  isOpen: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}

function AppModal({ isOpen, title, onClose, children, footer }: AppModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="hms-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="hms-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="hms-modal-head">
          <h3>{title}</h3>
          <button type="button" className="hms-ghost-button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="hms-modal-body">{children}</div>
        {footer ? <footer className="hms-modal-foot">{footer}</footer> : null}
      </section>
    </div>
  )
}

export default AppModal
