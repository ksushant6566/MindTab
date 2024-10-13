'use client'

import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { TipTapEditor } from '~/components/text-editor'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from '~/trpc/react'

import '~/styles/text-editor.css'
import { JournalDialog } from './journal-dialog'
import { CreateJournalDialog } from './create-journal-dialog'
import { JournalPreview } from './journal-preview'

const JournalSkeleton: React.FC = () => {
  return (
    <div className='pr-4 space-y-6'>
      {[...Array(2)].map((_, index) => (
        <div key={index} className="p-4 relative rounded-lg border shadow-sm space-y-4">
          <div>
            <Skeleton className="h-8 w-44" />
          </div>
          <Skeleton className="h-40 w-full rounded-t-lg" />
          <div className="flex justify-between items-center">
            <div className='flex flex-col justify-end'>
              <Skeleton className="h-4 w-32 rounded-md inline-block" />
            </div>
            <div className="space-x-2">
              <Skeleton className="h-8 w-32 rounded-md inline-block" />
              <Skeleton className="h-8 w-32 rounded-md inline-block" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const Journals: React.FC = () => {
  const apiUtils = api.useUtils()

  const { data: journals, isFetching: isFetchingJournals } = api.journals.getAll.useQuery()

  const {
    mutate: deleteJournal,
    isPending: isDeletingJournal,
    variables: deleteJournalVariables,
  } = api.journals.delete.useMutation({
    onSettled: () => {
      apiUtils.journals.getAll.invalidate()
      apiUtils.journals.search.invalidate()
    },
  })

  const [overflowingJournals, setOverflowingJournals] = useState<Set<string>>(new Set())

  const [mode, setMode] = useState<'edit' | 'view' | null>(null)
  const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false)
  const [isCreateJournalDialogOpen, setIsCreateJournalDialogOpen] = useState(false)
  const [currentJournal, setCurrentJournal] = useState<{ id: string, title: string, content: string } | null>(null)

  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const checkOverflow = useCallback(() => {
    const newOverflowingJournals = new Set<string>()
    Object.entries(contentRefs.current).forEach(([journalId, element]) => {
      if (element && element.scrollHeight > element.clientHeight) {
        newOverflowingJournals.add(journalId)
      }
    })
    setOverflowingJournals(newOverflowingJournals)
  }, [])

  useEffect(() => {
    const timer = setTimeout(checkOverflow, 0)
    return () => clearTimeout(timer)
  }, [journals, checkOverflow])

  const onCreateJournal = () => {
    setIsCreateJournalDialogOpen(true)
  }

  const onJournalDialogOpenChange = (open: boolean) => {
    setIsJournalDialogOpen(open)

    if (!open) {
      setCurrentJournal(null)
      setMode(null)
    }
  }

  const onCreateJournalDialogOpenChange = (open: boolean) => {
    setIsCreateJournalDialogOpen(open)
  }

  const onEditJournal = useCallback((id: string) => {
    const journal = journals?.find((journal) => journal.id === id)
    if (!journal) {
      console.error('Invalid journal id')
      return
    }
    setCurrentJournal({
      id: journal.id,
      title: journal.title,
      content: journal.content,
    })
    setMode('edit')
    setIsJournalDialogOpen(true)
  }, [journals])

  const onShowMore = (id: string) => {
    const journal = journals?.find((journal) => journal.id === id)
    if (!journal) {
      console.error('Invalid journal id')
      return
    }
    setCurrentJournal({
      id: journal.id,
      title: journal.title,
      content: journal.content,
    })
    setMode('view')
    setIsJournalDialogOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Notes</h2>
        <Button onClick={onCreateJournal} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-14rem)]">
        {isFetchingJournals ? <JournalSkeleton /> : (
          <div className='pr-4'>
            {journals?.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center mt-8">
                <span className="text-base">
                  No notes found
                </span>
                <Button onClick={onCreateJournal} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create First Note
                </Button>
              </div>
            ) : journals?.map((journal) => (
              <JournalPreview
                key={journal.id}
                journal={journal}
                overflowingJournals={overflowingJournals}
                contentRefs={contentRefs}
                onShowMore={onShowMore}
                onEditJournal={onEditJournal}
                deleteJournal={(id) => deleteJournal({ id })}
                isDeletingJournal={isDeletingJournal}
                deleteJournalVariables={deleteJournalVariables}
              />
            ))}
          </div>
        )}
      </ScrollArea>
      <JournalDialog
        isOpen={isJournalDialogOpen}
        onOpenChange={onJournalDialogOpenChange}
        defaultMode={mode}
        journal={currentJournal}
      />
      <CreateJournalDialog
        isOpen={isCreateJournalDialogOpen}
        onOpenChange={onCreateJournalDialogOpenChange}
      />
    </div>
  )
}
