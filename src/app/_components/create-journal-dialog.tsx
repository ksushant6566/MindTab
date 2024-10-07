'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import React, { useState } from "react"
import { TipTapEditor } from "~/components/text-editor/index"
import { api } from "~/trpc/react"

type TCreateJournalDialogProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export const CreateJournalDialog = ({ isOpen, onOpenChange }: TCreateJournalDialogProps) => {
    const apiUtils = api.useUtils()

    const [info, setInfo] = useState({
        title: '',
        content: ''
    })

    const { mutate: createJournal, isPending: isCreatingJournal } = api.journals.create.useMutation({
        onSettled: () => {
            apiUtils.journals.getAll.invalidate()
            onOpenChange(false)
        }
    })

    const handleSubmit = () => {
        createJournal({ title: info.title, content: info.content })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px]">
                <DialogTitle>Create new note</DialogTitle>
                <DialogDescription className='-mt-2'>Create a new note.</DialogDescription>

                <div className="border border-input rounded-lg overflow-y-auto overflow-x-visible max-h-[calc(100vh-14rem)] p-1">
                    <TipTapEditor
                        content={info.content}
                        onContentChange={content => setInfo({ ...info, content })}
                        title={info.title}
                        onTitleChange={title => setInfo({ ...info, title })}
                        editable={true}
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} size={'sm'} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} size={'sm'} disabled={isCreatingJournal || !info.title || !info.content}>
                        {isCreatingJournal ? 'Creating...' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}