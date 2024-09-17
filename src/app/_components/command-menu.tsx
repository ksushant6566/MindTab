'use client'

import { Goal, Grid, Laptop, LogOut, LucideIcon, Moon, Notebook, PlusIcon, Sun } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useEffect, useState} from 'react'
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

export const CommandMenu = () => {
    const { setTheme } = useTheme()
  
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const commandMenuGroups = [
    {
      heading: 'Goals',
      items: [
        {
          label: 'Create Goal',
          icon: PlusIcon,
          shortcut: '⌘ + G',
          onClick: () => {
            setOpen(false)
          },
        },
        {
          label: 'Search Goals',
          icon: Goal,
          onClick: () => {
            console.log('Create Goal')
            setOpen(false)
          },
        },
      ],
    },
    {
      heading: 'Habits',
      items: [
        {
          label: 'Create Habit',
          icon: PlusIcon,
          shortcut: '⌘ + H',
          onClick: () => {
            setOpen(false)
          },
        },
        {
          label: 'Search Habits',
          icon: Grid,
          onClick: () => {
            console.log('Create Habit')
            setOpen(false)
          },
        },
      ],
    },
    {
      heading: 'Notes',
      items: [
        {
          label: 'Create Note',
          icon: PlusIcon,
          shortcut: '⌘ + N',
          onClick: () => {
            setOpen(false)
          },
        },
        {
          label: 'Search Notes',
          icon: Notebook,
          onClick: () => {
            console.log('Create Note')
            setOpen(false)
          },
        },
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
  ]

  return (
    <div className="flex items-center justify-center">
      <Button
        size={'sm'}
        variant="secondary"
        className="flex items-center justify-between text-sm text-muted-foreground font-light rounded-md gap-2 h-8 w-64"
        onClick={() => setOpen(true)}
      >
        Search... <span>⌘K</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {commandMenuGroups.map((group) => (
            <CommandMenuGroup key={group.heading} heading={group.heading} items={group.items} />
          ))}
        </CommandList>
      </CommandDialog>
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
          key={index}
          onSelect={item.onClick}
          className="group"
        >
          <span className="flex items-center gap-2 text-muted-foreground group-hover:text-primary group-active:text-primary">
            {item.icon && <item.icon className="!h-4 !w-4" />}
            {item.label}
          </span>
          {'shortcut' in item && <CommandShortcut>{item.shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}