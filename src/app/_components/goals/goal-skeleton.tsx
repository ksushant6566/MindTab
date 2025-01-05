import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Skeleton } from '~/components/ui/skeleton'

export const GoalSkeleton = () => {
  return (
    <Accordion type="single" collapsible defaultValue="pending" className="mt-12 pr-8">
      <AccordionItem value="pending">
        <AccordionTrigger className="text-sm font-medium">Pending</AccordionTrigger>
        <AccordionContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="flex items-start justify-start gap-3" key={index}>
              <div className="flex items-start justify-start">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex flex-col gap-2 pt-0.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-64" />
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
