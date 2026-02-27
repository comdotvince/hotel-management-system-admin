import { useCallback, useEffect, useState } from 'react'
import type { RoomRecord } from '../data/hmsMockData'
import { roomService, type RoomPayload } from '../services/roomService'

type RoomMutationType = 'create' | 'update' | 'delete' | 'bulk-delete' | null

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Unexpected room operation error.'

function useRooms() {
  const [rooms, setRooms] = useState<RoomRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mutationType, setMutationType] = useState<RoomMutationType>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshRooms = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedRooms = await roomService.getRooms()
      setRooms(fetchedRooms)
    } catch (operationError) {
      setError(toErrorMessage(operationError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshRooms()
  }, [refreshRooms])

  const createRoom = useCallback(async (payload: RoomPayload) => {
    setMutationType('create')
    setError(null)

    try {
      const createdRoom = await roomService.createRoom(payload)
      setRooms((currentRooms) => [createdRoom, ...currentRooms])
      return createdRoom
    } catch (operationError) {
      const message = toErrorMessage(operationError)
      setError(message)
      throw new Error(message)
    } finally {
      setMutationType(null)
    }
  }, [])

  const updateRoom = useCallback(async (roomId: number, payload: RoomPayload) => {
    setMutationType('update')
    setError(null)

    try {
      const updatedRoom = await roomService.updateRoom(roomId, payload)
      setRooms((currentRooms) =>
        currentRooms.map((room) => (room.id === roomId ? updatedRoom : room))
      )
      return updatedRoom
    } catch (operationError) {
      const message = toErrorMessage(operationError)
      setError(message)
      throw new Error(message)
    } finally {
      setMutationType(null)
    }
  }, [])

  const deleteRoom = useCallback(async (roomId: number) => {
    setMutationType('delete')
    setError(null)

    try {
      await roomService.deleteRoom(roomId)
      setRooms((currentRooms) => currentRooms.filter((room) => room.id !== roomId))
    } catch (operationError) {
      const message = toErrorMessage(operationError)
      setError(message)
      throw new Error(message)
    } finally {
      setMutationType(null)
    }
  }, [])

  const bulkDeleteRooms = useCallback(async (roomIds: number[]) => {
    setMutationType('bulk-delete')
    setError(null)

    try {
      await roomService.bulkDeleteRooms(roomIds)
      const idSet = new Set(roomIds)
      setRooms((currentRooms) =>
        currentRooms.filter((room) => !idSet.has(room.id))
      )
    } catch (operationError) {
      const message = toErrorMessage(operationError)
      setError(message)
      throw new Error(message)
    } finally {
      setMutationType(null)
    }
  }, [])

  return {
    rooms,
    isLoading,
    isMutating: mutationType !== null,
    mutationType,
    error,
    refreshRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    bulkDeleteRooms,
  }
}

export default useRooms
