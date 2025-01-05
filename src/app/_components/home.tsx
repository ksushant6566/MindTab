'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Goals } from './goals/index'
import { Habits } from './habits'
import { Journals } from './journals'

export default function Component() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) return null

  return (
    <div className="max-w-screen-xl w-full grid grid-cols-10 gap-2">
      <div className="col-span-8">
        <Goals />
      </div>
      <div className="col-span-2">
        <Tabs defaultValue="habits">
          <TabsList className="bg-transparent gap-2 px-0">
            <TabsTrigger
              value="habits"
              className="bg-secondary text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Habits
            </TabsTrigger>
            <TabsTrigger
              value="journals"
              className="bg-secondary text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Notes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="habits" className="pt-6">
            <Habits />
          </TabsContent>
          <TabsContent value="journals" className="pt-6">
            <Journals />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
