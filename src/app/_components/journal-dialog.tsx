'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import React, { useEffect, useState } from "react"
import { TipTapEditor } from "~/components/text-editor"
import { api } from "~/trpc/react"


type TJournalDialogProps = {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    defaultMode: 'edit' | 'view' | null
    journal: {
        id: string
        title: string
        content: string
    } | null
}

export const JournalDialog = ({ isOpen, onOpenChange, defaultMode, journal }: TJournalDialogProps) => {
    const apiUtils = api.useUtils()

    const [mode, setMode] = useState<'edit' | 'view' | null>(defaultMode)
    const [info, setInfo] = useState({
        id: journal?.id ?? '',
        title: journal?.title ?? '',
        content: journal?.content ?? ''
    })

    const { mutate: updateJournal, isPending: isUpdatingJournal } = api.journals.update.useMutation({
        onSettled: () => {
            apiUtils.journals.getAll.invalidate()
            apiUtils.journals.search.invalidate()
            onOpenChange(false)
        }
    })

    useEffect(() => {
        setMode(defaultMode ?? mode ?? 'view')
        setInfo({
            id: journal?.id ?? '',
            title: journal?.title ?? '',
            content: journal?.content ?? ''
        })
    }, [defaultMode, journal])

    if (!journal || !info) return null

    const handleSubmit = () => {
        updateJournal({ id: journal.id, content: info.content, title: info.title })
    }

    const toggleMode = () => {
        setMode(mode === 'edit' ? 'view' : 'edit')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-[1000px] ${mode === 'view' ? "p-0" : ""}`}>
                {
                    mode === 'edit' ? (
                        <>
                            <DialogTitle>Edit note</DialogTitle>
                            <DialogDescription className='-mt-2'>Edit your note.</DialogDescription>
                        </>
                    ) :
                        <>
                            <DialogTitle className="sr-only">{info.title}</DialogTitle>
                            <DialogDescription className="sr-only">{info.content}</DialogDescription>
                        </>
                }

                <div className={`border border-input rounded-lg overflow-y-auto overflow-x-visible ${mode === 'view' ? "max-h-[calc(100vh-8rem)] p-4" : "max-h-[calc(100vh-14rem)] p-1"}`}>
                    <TipTapEditor
                        content={info.content}
                        onContentChange={content => setInfo({ ...info, content })}
                        title={info.title}
                        onTitleChange={title => setInfo({ ...info, title })}
                        editable={mode !== 'view'}
                    />
                </div>
                {
                    mode === 'edit' ? (
                        <DialogFooter>
                            <Button onClick={() => onOpenChange(false)} size={'sm'} variant="outline">
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} size={'sm'} disabled={isUpdatingJournal || !info.title || !info.content}>
                                {isUpdatingJournal ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    ) : null
                }
            </DialogContent>
        </Dialog>
    )
}