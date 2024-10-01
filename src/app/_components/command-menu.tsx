'use client'

import { FileText, Laptop, Loader, LogOut, LucideIcon, Moon, Notebook, PlusIcon, Sun } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '~/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '~/components/ui/command'
import { api } from '~/trpc/react'
import { CreateJournalDialog } from './create-journal-dialog'
import { JournalDialog } from './journal-dialog'

export const CommandMenu = () => {
  const { setTheme } = useTheme()

  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Create Journal Dialog states
  const [isCreateJournalDialogOpen, setIsCreateJournalDialogOpen] = useState(false)
  const onCreateJournalDialogOpenChange = (open: boolean) => {
    setIsCreateJournalDialogOpen(open)
  }

  // Journal Dialog states
  const [currentJournal, setCurrentJournal] = useState<{
    id: string
    title: string
    content: string
  } | null>(null)
  const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false)
  const onJournalDialogOpenChange = (open: boolean) => {
    setIsJournalDialogOpen(open)
    if (!open) {
      setCurrentJournal(null)
    }
  }

  const { data: journals, isFetching: isFetchingSearchResults } = api.journals.search.useQuery({
    query: searchQuery ?? '',
  }, {
    enabled: open,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleOpen = () => {
    setOpen(!open)
    if (!open) {
      setSearchQuery('')
    }
  }

  const commandMenuGroups = useMemo(() => [
    // {
    //   heading: 'Goals',
    //   items: [
    //     {
    //       label: 'Create Goal',
    //       icon: PlusIcon,
    //       shortcut: '⌘ + G',
    //       onClick: () => {
    //         setOpen(false)
    //       },
    //     },
    //     {
    //       label: 'Search Goals',
    //       icon: Goal,
    //       onClick: () => {
    //         console.log('Create Goal')
    //         setOpen(false)
    //       },
    //     },
    //   ],
    // },
    // {
    //   heading: 'Habits',
    //   items: [
    //     {
    //       label: 'Create Habit',
    //       icon: PlusIcon,
    //       shortcut: '⌘ + H',
    //       onClick: () => {
    //         setOpen(false)
    //       },
    //     },
    //     {
    //       label: 'Search Habits',
    //       icon: Grid,
    //       onClick: () => {
    //         console.log('Create Habit')
    //         setOpen(false)
    //       },
    //     },
    //   ],
    // },
    {
      heading: 'Notes',
      items: [
        {
          label: 'Create Note',
          icon: PlusIcon,
          // shortcut: '⌘ + N',
          onClick: () => {
            setIsCreateJournalDialogOpen(true)
            setOpen(false)
          },
        },
        {
          label: 'Search Notes',
          icon: Notebook,
          shortcut: 'Type to search...',
          onClick: () => {
            console.log('Search Notes')
          },
        }
      ],
    },
    {
      heading: 'Theme',
      items: [
        {
          label: 'Light mode',
          icon: Sun,
          onClick: () => {
            setTheme('light')
            setOpen(false)
          },
        },
        {
          label: 'Dark mode',
          icon: Moon,
          onClick: () => {
            setTheme('dark')
            setOpen(false)
          },
        },
        {
          label: 'System theme',
          icon: Laptop,
          onClick: () => {
            setTheme('system')
            setOpen(false)
          },
        },
      ],
    },
    {
      heading: 'Settings',
      items: [
        {
          label: 'Logout',
          icon: LogOut,
          onClick: () => {
            signOut()
            setOpen(false)
          },
        },
      ],
    },
  ], [journals])

  const searchResults = useMemo(() => {
    if (!journals) return []

    return journals.map((journal) => ({
      label: journal.title!,
      icon: FileText,
      onClick: () => {
        setCurrentJournal(journal)
        setIsJournalDialogOpen(true)
        setOpen(false)
      },
    }))
  }, [journals])

  return (
    <div className="flex items-center justify-center">
      <Button
        size={'sm'}
        variant="outline"
        className="flex items-center justify-between text-sm text-muted-foreground font-light rounded-md gap-2 h-9 w-64"
        onClick={toggleOpen}
      >
        Search... <span>⌘K</span>
      </Button>
      <CommandDialog open={open} onOpenChange={toggleOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          value={searchQuery ?? ''}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isFetchingSearchResults ?
            <CommandEmpty>
              <div className="flex items-center justify-center">
                <span className="animate-spin">
                  <Loader className="h-5 w-5" />
                </span>
              </div>
            </CommandEmpty>
            : <CommandEmpty>No results found.</CommandEmpty>}
          {commandMenuGroups.map((group) => (
            <CommandMenuGroup key={group.heading} heading={group.heading} items={group.items} />
          ))}
          {searchResults.length > 0 && (
            <CommandMenuGroup heading="Search Results" items={searchResults} />
          )}
        </CommandList>
      </CommandDialog>
      <CreateJournalDialog
        isOpen={isCreateJournalDialogOpen}
        onOpenChange={onCreateJournalDialogOpenChange}
      />
      <JournalDialog
        isOpen={isJournalDialogOpen}
        onOpenChange={onJournalDialogOpenChange}
        defaultMode={'view'}
        journal={currentJournal}
      />
    </div>
  )
}

type TCommandMenuGroupProps = {
  heading: string
  items: { label: string, shortcut?: string, icon?: LucideIcon, onClick: () => void }[]
}

const CommandMenuGroup = ({ heading, items }: TCommandMenuGroupProps) => {
  return (
    <CommandGroup key={heading} heading={heading}>
      {items.map((item, index) => (
        <CommandItem
          key={heading + index}
          onSelect={item.onClick}
          className="group"
          value={item.label}
        >
          <span className="flex items-center gap-2 text-muted-foreground group-hover:text-primary group-active:text-primary group-data-[selected=true]:text-primary">
            {item.icon && <item.icon className="!h-4 !w-4" />}
            {item.label}
          </span>
          {'shortcut' in item && <CommandShortcut>{item.shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

