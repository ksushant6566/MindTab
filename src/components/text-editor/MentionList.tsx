import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
    useRef,
    ForwardRefRenderFunction,
} from 'react'

import { goals } from '~/server/db/schema'

type Goal = typeof goals.$inferSelect


interface MentionListProps {
    items: Goal[];
    command: (item: { id: string, label: string }) => void;
}

interface MentionListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList: ForwardRefRenderFunction<MentionListRef, MentionListProps> = (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    const selectItem = (index: number) => {
        const item = props.items[index]

        if (item) {
            props.command({ id: item.id, label: item.title! })
        }
    }

    const upHandler = () => {
        setSelectedIndex((prevIndex) => {
            const newIndex = (prevIndex + props.items.length - 1) % props.items.length
            scrollToItem(newIndex)
            return newIndex
        })
    }

    const downHandler = () => {
        setSelectedIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % props.items.length
            scrollToItem(newIndex)
            return newIndex
        })
    }

    const enterHandler = () => {
        selectItem(selectedIndex)
    }

    const scrollToItem = (index: number) => {
        if (scrollAreaRef.current) {
            const itemHeight = 64 // Approximate height of each item
            const scrollPosition = index * itemHeight
            scrollAreaRef.current.scrollTop = scrollPosition
        }
    }

    useEffect(() => {
        setSelectedIndex(0)
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = 0
        }
    }, [props.items])

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                downHandler()
                return true
            }

            if (event.key === 'Enter') {
                enterHandler()
                return true
            }

            return false
        },
    }))

    return (
        <div className="z-50 bg-background flex flex-col gap-2 justify-start items-start border border-border rounded-md h-[350px]">
            <div ref={scrollAreaRef} className="flex flex-col gap-2 justify-start items-start border border-border rounded-md overflow-y-scroll px-1 py-1">
                {props.items.length
                    ? props.items.map((item, index) => (
                        <button
                            className={`${index === selectedIndex ? 'bg-secondary text-secondary-foreground' : ''} px-2 py-2 w-full text-start text-sm first:mt-0 flex flex-col gap-1 rounded-md`}
                            key={item.id}
                            onClick={() => selectItem(index)}
                        >
                            <span className='text-sm'>{item.title}</span>
                            <span className='flex items-center gap-1.5'>
                                <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs border-b 
                                    ${index === selectedIndex ? 'bg-background px-2.5 py-0.5' : 'bg-muted'} 
                                    text-blue-400`}>goal
                                </span>
                                <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs border-b 
                                    ${index === selectedIndex ? 'bg-background px-2.5 py-0.5' : 'bg-muted'} 
                                    ${item.status === 'completed' ? 'text-green-500' : 'text-white/90'}`}>{item.status}
                                </span>
                            </span>
                        </button>
                    ))
                    : <div className="item">No result</div>
                }
            </div>
        </div>
    )
}

export default forwardRef(MentionList)