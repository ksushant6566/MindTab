import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Code,
  Italic,
  List,
  ListOrdered,
  MessageSquareCode,
  MessageSquareQuote,
  Strikethrough,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Separator } from '../ui/separator'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'

type TipTapEditorProps = {
  content: string
  onChange: (content: string) => void
  title: string
  onTitleChange: (title: string) => void
  editable?: boolean
}

export const TipTapEditor = ({ content, onChange, title, onTitleChange, editable = true }: TipTapEditorProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const editorRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
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

  return (
    <div ref={editorRef} className={`relative rounded-md px-2 py-3 ${editable ? 'border border-input' : ''}`}>
      <div className="flex flex-col gap-0">
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
              const titleInput = document.getElementById('title') as HTMLInputElement
              titleInput?.focus()
            }
          }}
        />
      </div>
      {isMenuVisible && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: `${menuPosition.y - 15}px`,
            left: `${menuPosition.x}px`,
            zIndex: 50,
            transform: 'translateY(-100%)',
          }}
          className="bg-background border rounded shadow-md"
        >
          <MenuBar editor={editor} />
        </div>
      )}
    </div>
  )
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  return (
    <div className="flex gap-0 p-0 w-fit">
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
        value={editor.isActive('bulletList') ? 'bullet' : editor.isActive('orderedList') ? 'ordered' : ''}
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
        value={editor.isActive('blockquote') ? 'blockquote' : editor.isActive('codeBlock') ? 'codeBlock' : ''}
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
    </div>
  )
}
