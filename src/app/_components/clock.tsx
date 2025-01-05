'use client'

import React, { useEffect, useState } from 'react'

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col space-y-0 -mt-3">
      <h1 className="text-6xl font-thin" suppressHydrationWarning>
        {time.toLocaleTimeString('en-IN', {
          minute: 'numeric',
          hour: 'numeric',
          hour12: false,
        })}
      </h1>
      <h1 className="text-xl font-medium" suppressHydrationWarning>
        {time.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </h1>
    </div>
  )
}
