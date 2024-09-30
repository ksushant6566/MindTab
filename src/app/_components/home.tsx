import React from 'react'
import { Goals } from './goals'
import { Habits } from './habits'
import { Journals } from './jounal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'


export default async function Component() {

  return (
    <div className="max-w-screen-lg w-full grid grid-cols-10 gap-2">
      <div className="col-span-4">
        <Goals />
      </div>
      <div className="col-span-6">
        <Tabs defaultValue="habits">
          <TabsList className='bg-transparent gap-2 px-0'>
            <TabsTrigger value="habits" className='bg-secondary text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>Habits</TabsTrigger>
            <TabsTrigger value="journals" className='bg-secondary text-secondary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="habits" className='pt-6'>
            <Habits />
          </TabsContent>
          <TabsContent value="journals" className='pt-6'>
            <Journals />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
