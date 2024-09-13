import React from 'react'
import { Goals } from './goals'
import { Habits } from './habits'
import { Header } from './header'
import { Journals } from './jounal'

export default async function Component() {
  return (
    <div className="h-screen w-screen max-w-screen-2xl space-y-8 p-14 px-20">
      <Header />
      <div className="grid grid-cols-10 gap-0">
        <div className="col-span-3">
          <Goals />
        </div>
        <div className="col-span-4">
          <Habits />
        </div>
        <div className="col-span-3">
          <Journals />
        </div>
      </div>
    </div>
  )
}
