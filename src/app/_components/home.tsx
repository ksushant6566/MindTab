import React from 'react'
import { Goals } from './goals'
import { Habits } from './habits'
import { Header } from './header'
import { Journals } from './jounal'
import { getServerAuthSession } from '~/server/auth'
import Auth from './auth'

export default async function Component() {

  const session = await getServerAuthSession()
  const user = session?.user

  if(!user) return (
    <Auth />
  )

  return (
    <div className="h-screen w-screen flex flex-col items-center space-y-8 p-6 px-12 max-w-screen-2xl mx-auto">
      <Header />
      <div className="max-w-screen-lg grid grid-cols-10 gap-2">
        <div className="col-span-4">
          <Goals />
        </div>
        <div className="col-span-6">
          <Habits />
        </div>
        {/* <div className="col-span-6">
          <Journals />
        </div> */}
      </div>
    </div>
  )
}
