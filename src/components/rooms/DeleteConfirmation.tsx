import AppModal from '../AppModal'

type DeleteConfirmationProps = {
  isOpen: boolean
  title: string
  message: string
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteConfirmation({
  isOpen,
  title,
  message,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmationProps) {
  return (
    <AppModal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="hms-empty-text">{message}</p>
      <div className="hms-button-row">
        <button
          type="button"
          className="hms-primary-button"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </button>
        <button
          type="button"
          className="hms-ghost-button"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
      </div>
    </AppModal>
  )
}

export default DeleteConfirmation
