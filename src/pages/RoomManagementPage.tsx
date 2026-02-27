import { useCallback, useMemo, useState } from 'react'
import DeleteConfirmation from '../components/rooms/DeleteConfirmation'
import RoomDetails from '../components/rooms/RoomDetails'
import RoomForm from '../components/rooms/RoomForm'
import RoomList from '../components/rooms/RoomList'
import type { RoomRecord } from '../data/hmsMockData'
import type { RoomPayload } from '../services/roomService'

type RoomManagementPageProps = {
  rooms: RoomRecord[]
  isLoading: boolean
  mutationType: 'create' | 'update' | 'delete' | 'bulk-delete' | null
  error: string | null
  onCreateRoom: (payload: RoomPayload) => Promise<void>
  onUpdateRoom: (roomId: number, payload: RoomPayload) => Promise<void>
  onDeleteRoom: (roomId: number) => Promise<void>
  onBulkDeleteRooms: (roomIds: number[]) => Promise<void>
}

type RoomFormState =
  | {
      mode: 'create'
      roomId: null
    }
  | {
      mode: 'edit'
      roomId: number
    }
  | null

type PendingDeleteState =
  | {
      type: 'single'
      roomId: number
    }
  | {
      type: 'bulk'
      roomIds: number[]
    }
  | null

type ToastType = 'success' | 'error'

type ToastItem = {
  id: number
  message: string
  type: ToastType
}

function RoomManagementPage({
  rooms,
  isLoading,
  mutationType,
  error,
  onCreateRoom,
  onUpdateRoom,
  onDeleteRoom,
  onBulkDeleteRooms,
}: RoomManagementPageProps) {
  const [formState, setFormState] = useState<RoomFormState>(null)
  const [detailsRoomId, setDetailsRoomId] = useState<number | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDeleteState>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const detailsRoom = useMemo(
    () => rooms.find((room) => room.id === detailsRoomId) ?? null,
    [detailsRoomId, rooms]
  )

  const formRoom = useMemo(
    () =>
      formState?.mode === 'edit'
        ? (rooms.find((room) => room.id === formState.roomId) ?? null)
        : null,
    [formState, rooms]
  )

  const pushToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((currentToasts) => [...currentToasts, { id, message, type }])
    window.setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      )
    }, 3000)
  }, [])

  const closeForm = () => setFormState(null)

  const handleFormSubmit = async (payload: RoomPayload) => {
    try {
      if (formState?.mode === 'edit' && formState.roomId) {
        await onUpdateRoom(formState.roomId, payload)
        pushToast('success', `Room ${payload.roomNumber} updated successfully.`)
      } else {
        await onCreateRoom(payload)
        pushToast('success', `Room ${payload.roomNumber} created successfully.`)
      }
      closeForm()
    } catch (operationError) {
      pushToast(
        'error',
        operationError instanceof Error
          ? operationError.message
          : 'Unable to save room details.'
      )
    }
  }

  const handleRequestDeleteRoom = (room: RoomRecord) => {
    setPendingDelete({
      type: 'single',
      roomId: room.id,
    })
  }

  const handleRequestBulkDelete = (roomIds: number[]) => {
    const validRoomIds = roomIds.filter((roomId) =>
      rooms.some((room) => room.id === roomId)
    )
    if (!validRoomIds.length) {
      pushToast('error', 'Select at least one room for bulk delete.')
      return
    }

    setPendingDelete({
      type: 'bulk',
      roomIds: validRoomIds,
    })
  }

  const isDeleting =
    mutationType === 'delete' || mutationType === 'bulk-delete'
  const isSubmitting =
    mutationType === 'create' || mutationType === 'update'

  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      return
    }

    try {
      if (pendingDelete.type === 'single') {
        const targetRoom = rooms.find((room) => room.id === pendingDelete.roomId)
        await onDeleteRoom(pendingDelete.roomId)
        setDetailsRoomId((currentId) =>
          currentId === pendingDelete.roomId ? null : currentId
        )
        pushToast(
          'success',
          `Room ${targetRoom?.roomNumber ?? pendingDelete.roomId} deleted.`
        )
      } else {
        await onBulkDeleteRooms(pendingDelete.roomIds)
        pushToast(
          'success',
          `${pendingDelete.roomIds.length} room(s) deleted successfully.`
        )
      }
      setPendingDelete(null)
    } catch (operationError) {
      pushToast(
        'error',
        operationError instanceof Error
          ? operationError.message
          : 'Delete operation failed.'
      )
    }
  }

  const deleteTitle =
    pendingDelete?.type === 'bulk'
      ? 'Delete Multiple Rooms'
      : 'Delete Room'

  const singleDeleteRoomNumber =
    pendingDelete?.type === 'single'
      ? (rooms.find((room) => room.id === pendingDelete.roomId)?.roomNumber ?? '')
      : ''

  const deleteMessage =
    pendingDelete?.type === 'bulk'
      ? `Delete ${pendingDelete.roomIds.length} selected rooms? This cannot be undone.`
      : `Delete room ${singleDeleteRoomNumber}? This cannot be undone.`

  return (
    <div className="hms-page-stack">
      {error ? (
        <section className="hms-panel">
          <p className="hms-field-error">{error}</p>
        </section>
      ) : null}

      <RoomList
        rooms={rooms}
        isLoading={isLoading}
        isBulkDeleting={mutationType === 'bulk-delete'}
        onAddNew={() =>
          setFormState({
            mode: 'create',
            roomId: null,
          })
        }
        onView={(room) => setDetailsRoomId(room.id)}
        onEdit={(room) =>
          setFormState({
            mode: 'edit',
            roomId: room.id,
          })
        }
        onDelete={handleRequestDeleteRoom}
        onBulkDelete={handleRequestBulkDelete}
      />

      <RoomDetails
        room={detailsRoom}
        onClose={() => setDetailsRoomId(null)}
        onEdit={(room) => {
          setDetailsRoomId(null)
          setFormState({
            mode: 'edit',
            roomId: room.id,
          })
        }}
        onDelete={handleRequestDeleteRoom}
      />

      <RoomForm
        key={formState ? `${formState.mode}-${formState.roomId ?? 'new'}` : 'room-form-closed'}
        isOpen={Boolean(formState)}
        mode={formState?.mode ?? 'create'}
        initialRoom={formRoom}
        isSubmitting={isSubmitting}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmation
        isOpen={Boolean(pendingDelete)}
        title={deleteTitle}
        message={deleteMessage}
        isDeleting={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <div className="hms-toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <article key={toast.id} className={`hms-toast ${toast.type}`}>
            {toast.message}
          </article>
        ))}
      </div>
    </div>
  )
}

export default RoomManagementPage
