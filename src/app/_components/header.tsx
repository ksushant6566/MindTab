'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { CommandMenu } from './command-menu'
import Streak from './streak'
import { Session } from 'next-auth'
import { XP } from './xp'

type HeaderProps = {
  session: Session
}

export const Header = ({ session }: HeaderProps) => {

  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <div className="flex w-full justify-end items-center gap-6">
      <CommandMenu />
      <div className="flex items-center gap-4">
        <div className="relative ml-8 flex items-center">
          <div className="absolute left-0 top-0 flex h-10 w-10 -translate-x-[78%] -translate-y-[6%] items-center justify-center rounded-full bg-blue-800 cursor-pointer">
            <a href="https://mindtab.in" target="_blank">
              <h1 className="text-xl font-medium text-white">M</h1>
            </a>
          </div>
          {session?.user?.image ? (
            <a href={`https://mindtab.in/users/${session.user.email}`} target="_blank" className="z-10">
              <Image
                src={session.user.image}
                alt="profile"
                className="z-10 h-9 w-9 rounded-full ring-1 ring-white"
                width={48}
                height={48}
              />
            </a>
          ) : (
            <div className="z-10 h-10 w-10 rounded-full bg-slate-300" />
          )}
        </div>
        <Streak />
        <XP />
      </div>
    </div>
  )
}
