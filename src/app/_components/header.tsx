import Image from 'next/image'
import React from 'react'
import { getServerAuthSession } from '~/server/auth'

export const Header = async () => {
  const session = await getServerAuthSession()

  return (
    <div className="flex w-full items-center gap-4">
      <div className="relative ml-8 flex items-center">
        <div className="absolute left-0 top-0 flex h-11 w-11 -translate-x-[78%] -translate-y-[6%] items-center justify-center rounded-full bg-blue-800 cursor-pointer">
          <a href="https://mindtab.in" target="_blank">
            <h1 className="text-2xl font-medium text-white">M</h1>
          </a>
        </div>
        {session?.user?.image ? (
          <a href={`https://mindtab.in/${session.user.email}`} target="_blank" className="z-10">
            <Image
              src={session.user.image}
              alt="profile"
              className="z-10 h-10 w-10 rounded-full ring-1 ring-white"
              width={48}
              height={48}
            />
          </a>
        ) : (
          <div className="z-10 h-10 w-10 rounded-full bg-slate-300" />
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <p className="text-sm font-medium">2 days streak</p>
        </div>
      </div>
      {/* <div className="flex items-center gap-4">
        {!session && (
          <Link
            href={session ? '/api/auth/signout' : '/api/auth/signin'}
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium no-underline transition hover:bg-white/20"
          >
            {session ? 'Sign out' : 'Sign in'}
          </Link>
        )}
        <ModeToggle />
      </div> */}
    </div>
  )
}
