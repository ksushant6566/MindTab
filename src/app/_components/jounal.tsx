'use client'

import { Edit3, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { TipTapEditor } from '~/components/text-editor'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '~/components/ui/dialog'
import { api } from '~/trpc/react'

import '~/styles/text-editor.css'
import { ScrollArea } from '~/components/ui/scroll-area'

export const Journals: React.FC = () => {
  const { data: journals, refetch: refetchJournals } = api.journals.getAll.useQuery()

  const { mutate: createJournal, isPending: isCreatingJournal } = api.journals.create.useMutation({
    onSuccess: () => {
      refetchJournals()
      setIsCreateJournalOpen(false)
      setContent('')
    },
  })

  const {
    mutate: deleteJournal,
    isPending: isDeletingJournal,
    variables: deleteJournalVariables,
  } = api.journals.delete.useMutation({
    onSuccess: () => {
      refetchJournals()
    },
  })

  const [isCreateJournalOpen, setIsCreateJournalOpen] = useState(false)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const handleCreateJournal = () => {
    setIsCreateJournalOpen(true)
  }

  const handleEditorChange = (value: string) => {
    setContent(value)
  }

  const handleSubmit = () => {
    if (content.trim()) {
      createJournal({ title: title, content: content })
    }
  }

  const onOpenChange = (open: boolean) => {
    setIsCreateJournalOpen(open)

    if (!open) {
      setContent('')
      setTitle('')
    }
  }

  const handleEditJournal = (id: string) => {
    setContent(journals?.find((journal) => journal.id === id)?.content ?? '')
    setTitle(journals?.find((journal) => journal.id === id)?.title ?? '')
    setIsCreateJournalOpen(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">Notes</h2>
        <Button onClick={handleCreateJournal} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar">
        {journals?.map((journal) => (
          <div
            key={journal.id}
            className="mb-6 py-2 relative rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="max-h-48 overflow-y-hidden">
              <TipTapEditor
                content={journal.content ?? ''}
                onChange={() => void {}}
                title={journal.title ?? ''}
                onTitleChange={() => void {}}
                editable={false}
              />
            </div>
            {journal.content && journal.content.length > 300 && (
              <div className="flex justify-end mt-2 mr-2">
                <Button variant="link" className="text-sm">
                  Show more
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-0 rounded-b-lg">
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
                <Button variant="ghost" size="sm" onClick={() => handleEditJournal(journal.id)}>
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
      <Dialog open={isCreateJournalOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogTitle>New note</DialogTitle>
          <DialogDescription>Create a new note to track your thoughts and ideas.</DialogDescription>

          <div className="mt-4 max-h-[calc(100vh-16rem)] border border-input rounded-lg overflow-y-auto overflow-x-visible">
            <TipTapEditor content={content} onChange={handleEditorChange} title={title} onTitleChange={setTitle} />
          </div>

          <DialogFooter>
            <Button onClick={() => setIsCreateJournalOpen(false)} size={'sm'} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} size={'sm'} disabled={isCreatingJournal || !title || !content}>
              {isCreatingJournal ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
