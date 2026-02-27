export type MockRoomStatus = 'available' | 'occupied' | 'maintenance'

export type MockRoomSnapshot = {
  id: number
  roomNumber: string
  status: MockRoomStatus
}

export type MockBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'canceled'

export type MockBooking = {
  id: number
  clientName: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
  status: MockBookingStatus
  totalPrice: number
}

export type MockRevenueEntry = {
  id: number
  date: string
  amount: number
}

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateFromOffset = (offsetDays: number) => {
  const baseDate = new Date()
  baseDate.setHours(0, 0, 0, 0)
  baseDate.setDate(baseDate.getDate() + offsetDays)
  return toLocalIsoDate(baseDate)
}

export const mockRoomInventory: MockRoomSnapshot[] = [
  { id: 1, roomNumber: '101', status: 'available' },
  { id: 2, roomNumber: '102', status: 'occupied' },
  { id: 3, roomNumber: '103', status: 'maintenance' },
  { id: 4, roomNumber: '104', status: 'available' },
  { id: 5, roomNumber: '105', status: 'occupied' },
  { id: 6, roomNumber: '106', status: 'occupied' },
  { id: 7, roomNumber: '107', status: 'available' },
  { id: 8, roomNumber: '108', status: 'occupied' },
  { id: 9, roomNumber: '109', status: 'maintenance' },
  { id: 10, roomNumber: '110', status: 'available' },
  { id: 11, roomNumber: '201', status: 'occupied' },
  { id: 12, roomNumber: '202', status: 'available' },
  { id: 13, roomNumber: '203', status: 'occupied' },
  { id: 14, roomNumber: '204', status: 'maintenance' },
  { id: 15, roomNumber: '205', status: 'available' },
  { id: 16, roomNumber: '206', status: 'occupied' },
  { id: 17, roomNumber: '207', status: 'available' },
  { id: 18, roomNumber: '208', status: 'occupied' },
  { id: 19, roomNumber: '209', status: 'available' },
  { id: 20, roomNumber: '210', status: 'occupied' },
  { id: 21, roomNumber: '301', status: 'available' },
  { id: 22, roomNumber: '302', status: 'occupied' },
  { id: 23, roomNumber: '303', status: 'maintenance' },
  { id: 24, roomNumber: '304', status: 'available' },
  { id: 25, roomNumber: '305', status: 'occupied' },
  { id: 26, roomNumber: '306', status: 'available' },
  { id: 27, roomNumber: '307', status: 'occupied' },
  { id: 28, roomNumber: '308', status: 'available' },
]

export const mockOverviewBookings: MockBooking[] = [
  {
    id: 1,
    clientName: 'Maria Santos',
    roomNumber: '205',
    checkInDate: dateFromOffset(1),
    checkOutDate: dateFromOffset(4),
    status: 'pending',
    totalPrice: 12400,
  },
  {
    id: 2,
    clientName: 'John Carlo Reyes',
    roomNumber: '302',
    checkInDate: dateFromOffset(0),
    checkOutDate: dateFromOffset(2),
    status: 'confirmed',
    totalPrice: 7600,
  },
  {
    id: 3,
    clientName: 'Alyssa Dela Cruz',
    roomNumber: '304',
    checkInDate: dateFromOffset(-1),
    checkOutDate: dateFromOffset(2),
    status: 'checked-in',
    totalPrice: 9800,
  },
  {
    id: 4,
    clientName: 'Paolo Mendoza',
    roomNumber: '110',
    checkInDate: dateFromOffset(-3),
    checkOutDate: dateFromOffset(0),
    status: 'checked-out',
    totalPrice: 6400,
  },
  {
    id: 5,
    clientName: 'Patricia Lim',
    roomNumber: '208',
    checkInDate: dateFromOffset(2),
    checkOutDate: dateFromOffset(5),
    status: 'canceled',
    totalPrice: 13800,
  },
  {
    id: 6,
    clientName: 'Ramon Garcia',
    roomNumber: '101',
    checkInDate: dateFromOffset(0),
    checkOutDate: dateFromOffset(1),
    status: 'confirmed',
    totalPrice: 4100,
  },
  {
    id: 7,
    clientName: 'Angela Panganiban',
    roomNumber: '307',
    checkInDate: dateFromOffset(3),
    checkOutDate: dateFromOffset(6),
    status: 'pending',
    totalPrice: 15300,
  },
  {
    id: 8,
    clientName: 'Dennis Navarro',
    roomNumber: '202',
    checkInDate: dateFromOffset(0),
    checkOutDate: dateFromOffset(3),
    status: 'checked-in',
    totalPrice: 11200,
  },
  {
    id: 9,
    clientName: 'Sofia Valdez',
    roomNumber: '305',
    checkInDate: dateFromOffset(-2),
    checkOutDate: dateFromOffset(1),
    status: 'confirmed',
    totalPrice: 11700,
  },
  {
    id: 10,
    clientName: 'Mark Flores',
    roomNumber: '107',
    checkInDate: dateFromOffset(-6),
    checkOutDate: dateFromOffset(-1),
    status: 'checked-out',
    totalPrice: 8900,
  },
  {
    id: 11,
    clientName: 'Nicole Tan',
    roomNumber: '210',
    checkInDate: dateFromOffset(1),
    checkOutDate: dateFromOffset(4),
    status: 'confirmed',
    totalPrice: 14200,
  },
  {
    id: 12,
    clientName: 'Leandro Bautista',
    roomNumber: '108',
    checkInDate: dateFromOffset(-1),
    checkOutDate: dateFromOffset(1),
    status: 'canceled',
    totalPrice: 5800,
  },
]

export const mockRevenueEntries: MockRevenueEntry[] = [
  { id: 1, date: dateFromOffset(-13), amount: 11200 },
  { id: 2, date: dateFromOffset(-12), amount: 8600 },
  { id: 3, date: dateFromOffset(-11), amount: 12400 },
  { id: 4, date: dateFromOffset(-10), amount: 9800 },
  { id: 5, date: dateFromOffset(-9), amount: 14300 },
  { id: 6, date: dateFromOffset(-8), amount: 11900 },
  { id: 7, date: dateFromOffset(-7), amount: 10600 },
  { id: 8, date: dateFromOffset(-6), amount: 13200 },
  { id: 9, date: dateFromOffset(-5), amount: 15100 },
  { id: 10, date: dateFromOffset(-4), amount: 12400 },
  { id: 11, date: dateFromOffset(-3), amount: 13900 },
  { id: 12, date: dateFromOffset(-2), amount: 14500 },
  { id: 13, date: dateFromOffset(-1), amount: 15800 },
  { id: 14, date: dateFromOffset(0), amount: 17400 },
]
