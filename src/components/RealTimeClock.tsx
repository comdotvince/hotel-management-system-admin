import { useEffect, useState } from 'react'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

function RealTimeClock() {
  const [currentDate, setCurrentDate] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    // Prevent memory leaks by removing the interval on unmount.
    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="realtime-clock" role="status" aria-live="polite">
      <p className="realtime-clock-date">
        <span className="realtime-clock-date-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v11a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1Zm11 8H5v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8ZM6 6a1 1 0 0 0-1 1v1h14V7a1 1 0 0 0-1-1H6Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span>{dateFormatter.format(currentDate)}</span>
      </p>
      <p className="realtime-clock-time">{timeFormatter.format(currentDate)}</p>
    </div>
  )
}

export default RealTimeClock
