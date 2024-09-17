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
    <div className="h-screen w-screen flex flex-col items-center space-y-8 p-8">
      <Header />
      <div className="max-w-screen-xl grid grid-cols-12 gap-0">
        <div className="col-span-5 space-y-6">
          <Goals />
        </div>
        {/* <div className="col-span-5">
          <Habits />
        </div> */}
        <div className="col-span-5">
          <Journals />
        </div>
      </div>
    </div>
  )
}
