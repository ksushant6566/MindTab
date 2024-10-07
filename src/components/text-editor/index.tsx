import { Editor, EditorContent, ReactRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link' // Import the Link extension
import Mention from '@tiptap/extension-mention'
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  MessageSquareCode,
  MessageSquareQuote,
  Strikethrough,
  Link as LinkIcon, // Import a link icon
  X,
  Check,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Separator } from '../ui/separator'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import tippy from 'tippy.js'

import { api } from '~/trpc/react'
import MentionList from './MentionList'

type TipTapEditorProps = {
  content: string
  onContentChange: (content: string) => void
  title: string
  onTitleChange: (title: string) => void
  editable?: boolean
}

interface ComponentRef {
  onKeyDown: (props: any) => boolean;
}

export const TipTapEditor = ({
  content,
  onContentChange,
  title,
  onTitleChange,
  editable = true,
}: TipTapEditorProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const editorRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [isLinkInputVisible, setIsLinkInputVisible] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const { data: goals } = api.goals.getAll.useQuery()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: '_blank', // Ensure links open in a new tab
          rel: 'noopener noreferrer',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }: { query: string }) => {
            return goals
              ?.filter(item => item.title?.toLowerCase().includes(query.toLowerCase()))
              || []
          },

          render: () => {
            let component: ReactRenderer
            let popup: any[]

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                })

                if (!props.clientRect) {
                  return
                }

                // @ts-ignore
                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },

              onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                  return
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },

              onKeyDown(props) {
                if (props.event?.key === 'Escape') {
                  popup[0].hide()

                  return true
                }

                return (component.ref as ComponentRef)?.onKeyDown(props)
              },

              onExit() {
                popup[0].destroy()
                component.destroy()
              },
            }
          },
          command: ({ editor, range, props }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: 'mention',
                  attrs: props,
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ])
              .run()
          },
        }
      }),
    ],
    content: content,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }

      selectionTimeoutRef.current = setTimeout(() => {
        const { from, to } = editor.state.selection
        if (from !== to && editorRef.current) {
          const editorRect = editorRef.current.getBoundingClientRect()
          const { rangeRect } = getSelectionRect(editor)

          if (rangeRect) {
            const left = rangeRect.left - editorRect.left
            const top = rangeRect.top - editorRect.top
            setMenuPosition({ x: left, y: top })
            setIsMenuVisible(true)
          }
        } else {
          setIsMenuVisible(false)
        }
      }, 200)
    },
    editable: editable,
    immediatelyRender: false,
  })

  const getSelectionRect = (editor: Editor) => {
    const { from, to } = editor.state.selection
    const start = editor.view.coordsAtPos(from)
    const end = editor.view.coordsAtPos(to)

    const rangeRect = {
      left: Math.min(start.left, end.left),
      top: Math.min(start.top, end.top),
      right: Math.max(start.right, end.right),
      bottom: Math.max(start.bottom, end.bottom),
    }

    return { rangeRect }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuVisible(false)
        setIsLinkInputVisible(false) // Hide link input when clicking outside
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [])

  /**
   * This useEffect ensures that when the link input becomes visible,
   * it prepopulates the linkUrl with the current link's href if a link is active.
   */
  useEffect(() => {
    if (isLinkInputVisible && editor?.isActive('link')) {
      const currentLink = editor.getAttributes('link').href || ''
      setLinkUrl(currentLink)
    } else if (!isLinkInputVisible) {
      setLinkUrl('')
    }
  }, [isLinkInputVisible, editor])

  return (
    <div ref={editorRef} className={`relative rounded-md px-2 py-3 w-full`}>
      <div className="flex flex-col gap-0 w-full">
        <input
          type="text"
          id="title"
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-transparent border-none focus:border-none focus:outline-none text-xl font-semibold px-3 my-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              editor?.commands.focus()
            }
          }}
          disabled={!editable}
        />
        <EditorContent
          editor={editor}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && editor?.isEmpty) {
              e.preventDefault()
              const titleInput = document.getElementById(
                'title'
              ) as HTMLInputElement
              titleInput?.focus()
            }
          }}
          className="-ml-1 w-full"
        />
      </div>
      {isMenuVisible && editable && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: `${menuPosition.y - 15}px`,
            left: `${menuPosition.x}px`,
            zIndex: 50,
            transform: 'translateY(-100%)',
          }}
          className="bg-background border rounded-md shadow-md p-2 flex items-center"
        >
          <MenuBar
            editor={editor}
            isLinkInputVisible={isLinkInputVisible}
            setIsLinkInputVisible={setIsLinkInputVisible}
          />
          {isLinkInputVisible && (
            <form
              className="flex items-center space-x-2 ml-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (linkUrl) {
                  editor
                    ?.chain()
                    .focus()
                    .extendMarkRange('link')
                    .setLink({ href: linkUrl, target: '_blank' })
                    .run()
                  setLinkUrl('')
                  setIsLinkInputVisible(false)
                }
              }}
            >
              <Input
                type="url"
                placeholder="https://formonce.in"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (linkUrl) {
                    editor
                      ?.chain()
                      .focus()
                      .extendMarkRange('link')
                      .setLink({ href: linkUrl, target: '_blank' })
                      .run()
                    setLinkUrl('')
                    setIsLinkInputVisible(false)
                  }
                }}
                className="text-green-500"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsLinkInputVisible(false)
                  setLinkUrl('')
                }}
                className="text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

type MenuBarProps = {
  editor: Editor | null
  isLinkInputVisible: boolean
  setIsLinkInputVisible: (visible: boolean) => void
}

const MenuBar = ({
  editor,
  isLinkInputVisible,
  setIsLinkInputVisible,
}: MenuBarProps) => {
  if (!editor) return null

  return (
    <div className="flex gap-0 p-0 w-fit items-center">
      <ToggleGroup type="multiple">
        <ToggleGroupItem
          value="bold"
          aria-label="Toggle bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-state={editor.isActive('bold') ? 'on' : 'off'}
          className="gap-0"
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Toggle italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-state={editor.isActive('italic') ? 'on' : 'off'}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strike"
          aria-label="Toggle strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          data-state={editor.isActive('strike') ? 'on' : 'off'}
        >
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="code"
          aria-label="Toggle code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          data-state={editor.isActive('code') ? 'on' : 'off'}
        >
          <Code className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-full" />
      <ToggleGroup
        type="single"
        value={
          editor.isActive('bulletList')
            ? 'bullet'
            : editor.isActive('orderedList')
              ? 'ordered'
              : ''
        }
      >
        <ToggleGroupItem
          value="bullet"
          aria-label="Toggle bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="ordered"
          aria-label="Toggle ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-full" />
      <ToggleGroup
        type="single"
        value={
          editor.isActive('blockquote')
            ? 'blockquote'
            : editor.isActive('codeBlock')
              ? 'codeBlock'
              : ''
        }
        className="gap-0"
      >
        <ToggleGroupItem
          value="blockquote"
          aria-label="Toggle blockquote"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-state={editor.isActive('blockquote') ? 'on' : 'off'}
        >
          <MessageSquareQuote className="h-5 w-5" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="codeBlock"
          aria-label="Toggle codeblock"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          data-state={editor.isActive('codeBlock') ? 'on' : 'off'}
        >
          <MessageSquareCode className="h-5 w-5" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-full" />
      {/* Link Toggle Button */}
      <ToggleGroup type="single">
        <ToggleGroupItem
          value="link"
          aria-label="Toggle link"
          onClick={() => {
            setIsLinkInputVisible(!isLinkInputVisible)
          }}
          data-state={editor.isActive('link') ? 'on' : 'off'}
        >
          <LinkIcon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
