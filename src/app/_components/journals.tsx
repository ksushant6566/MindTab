'use client'

import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { TipTapEditor } from '~/components/text-editor'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '~/components/ui/dialog'
import { Skeleton } from '~/components/ui/skeleton'
import { ScrollArea } from '~/components/ui/scroll-area'
import { api } from '~/trpc/react'

import '~/styles/text-editor.css'
import { JournalDialog } from './journal-dialog'
import { CreateJournalDialog } from './create-journal-dialog'

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
  const { data: journals, refetch: refetchJournals, isFetching: isFetchingJournals } = api.journals.getAll.useQuery()

  const {
    mutate: deleteJournal,
    isPending: isDeletingJournal,
    variables: deleteJournalVariables,
  } = api.journals.delete.useMutation({
    onSuccess: () => {
      refetchJournals()
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

  const onEditJournal = (id: string) => {
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
  }

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
            {journals?.map((journal) => (
              <div
                key={journal.id}
                className="mb-6 py-2 relative rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div
                  className="max-h-56 overflow-y-hidden"
                  ref={(el) => {
                    if (el) {
                      contentRefs.current[journal.id] = el;
                    }
                  }}
                >
                  <TipTapEditor
                    content={journal.content ?? ''}
                    onContentChange={() => void {}}
                    title={journal.title ?? ''}
                    onTitleChange={() => void {}}
                    editable={false}
                  />
                </div>
                {overflowingJournals.has(journal.id) && (
                  <div className="flex justify-end -mt-2 mr-2">
                    <Button variant="link" className="text-sm hover:no-underline text-muted-foreground hover:text-foreground" onClick={() => onShowMore(journal.id)}>
                      Show more
                    </Button>
                  </div>
                )}
                <div className="flex justify-between items-center px-4 py-0 -mt-2 rounded-b-lg">
                  <span className="text-xs text-muted-foreground">
                    {journal.createdAt.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </span>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditJournal(journal.id)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-900 active:bg-red-900"
                      onClick={() => deleteJournal({ id: journal.id })}
                      disabled={isDeletingJournal && deleteJournalVariables?.id === journal.id}
                      loading={isDeletingJournal && deleteJournalVariables?.id === journal.id}
                      hideContentWhenLoading
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
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
