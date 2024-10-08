'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import React, { useEffect, useState } from "react"
import { TipTapEditor } from "~/components/text-editor"
import { api } from "~/trpc/react"
import { Edit, Edit2, Edit3 } from "lucide-react"
import { ToggleGroupItem } from "~/components/ui/toggle-group"
import { ToggleGroup } from "~/components/ui/toggle-group"

type TMentionedItem = {
    label: string
    id: string
    type: 'journal' | 'goal' | 'habit'

}
type TMentionedItems = {
    journal: TMentionedItem[]
    goal: TMentionedItem[]
    habit: TMentionedItem[]
}

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
            // onOpenChange(false)
            setMode('view')
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

    // function to extract mentioned items from the journal content
    const getMentionedItems = () => {
        const mentionedItems: TMentionedItems = {
            journal: [],
            goal: [],
            habit: [],
        }

        // 1. get all spans in this journal content with class 'mention'
        // Parse the HTML string into a DOM object
        const parser = new DOMParser()
        const doc = parser.parseFromString(info.content, 'text/html')

        // Select all span elements with the class 'mention'
        const mentionSpans = doc.querySelectorAll('.mention')

        if (!mentionSpans) return mentionedItems

        // 2. loop through each span
        mentionSpans.forEach(span => {
            const [type, id] = span.getAttribute('data-id')?.split(':') || []
            const label = span.getAttribute('data-label')

            if (id && label && type) {
                console.log({ id, label, type })
                mentionedItems[type as keyof TMentionedItems].push({ id, label, type } as TMentionedItem)
            }
        })

        return mentionedItems
    }

    const mentionedItems = getMentionedItems()

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
                <ToggleGroup type="single" className="absolute top-2.5 right-9 cursor-pointer z-10">
                    <ToggleGroupItem
                        value="edit"
                        aria-label="Toggle edit"
                        onClick={toggleMode}
                        data-state={mode === 'edit' ? 'on' : 'off'}
                        className="p-1.5 h-7 w-7"
                    >
                        <Edit3 className="h-3 w-3" />
                    </ToggleGroupItem>
                </ToggleGroup>

                <div className={`border border-input rounded-lg overflow-y-auto overflow-x-visible ${mode === 'view' ? "max-h-[calc(100vh-8rem)] p-4 rounded-b-none" : "max-h-[calc(100vh-14rem)] p-1"}`}>
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
                    ) : (
                            <div className="p-4 pt-2 flex flex-wrap gap-1 -mt-2">
                                <div className='flex flex-wrap gap-1'>
                                    {mentionedItems.goal.map(item => (
                                        <span
                                            key={item.id}
                                            data-id={`goal:${item.id}`}
                                            data-label={item.label}
                                            className="text-sm bg-muted rounded-md px-2 py-0.5 hover:bg-muted/50 text-blue-400 cursor-pointer"
                                        >
                                            {item.label.split(':')[1]}
                                        </span>
                                    ))}
                                </div>
                            </div>
                    )
                }
            </DialogContent>
        </Dialog>
    )
}