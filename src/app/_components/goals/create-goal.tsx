import { createInsertSchema } from 'drizzle-zod'
import { Flag, Zap } from 'lucide-react'
import React, { useRef, KeyboardEvent } from 'react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { goalCategoryEnum, goalImpactEnum, goalPriorityEnum, goalTypeEnum, goals } from '~/server/db/schema'

const priorityColors = {
  priority_1: 'red',
  priority_2: 'yellow',
  priority_3: 'green',
  priority_4: 'white',
}

const impactNumber = {
  low: 1,
  medium: 2,
  high: 3,
}

export type CreateGoalProps = {
  onSave: (goal: z.infer<typeof ZInsertGoal>) => void
  onCancel: () => void
  defaultValues?: Partial<z.infer<typeof ZInsertGoal>>
  loading?: boolean
}

const ZInsertGoal = createInsertSchema(goals).omit({ userId: true })

export const CreateGoal: React.FC<CreateGoalProps> = ({ onSave, onCancel, defaultValues, loading }) => {
  const [formData, setFormData] = React.useState<z.infer<typeof ZInsertGoal>>({
    title: defaultValues?.title,
    description: defaultValues?.description,
    priority: defaultValues?.priority || goalPriorityEnum.enumValues[0],
    impact: defaultValues?.impact || goalImpactEnum.enumValues[1],
    category: defaultValues?.category || goalCategoryEnum.enumValues[0],
    type: defaultValues?.type || goalTypeEnum.enumValues[0],
    status: 'pending',
  })

  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'ArrowUp' && e.target === descriptionRef.current) {
      e.preventDefault()
      titleRef.current?.focus()
    } else if (e.key === 'ArrowDown' && e.target === titleRef.current) {
      e.preventDefault()
      descriptionRef.current?.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-lg border p-6">
      <div className="space-y-2">
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Goal name"
          value={formData.title || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          required
          className="w-full bg-inherit text-xl font-semibold focus:border-none focus:outline-none"
          ref={titleRef}
        />
        <textarea
          id="description"
          name="description"
          placeholder="Description"
          value={formData.description || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full resize-none overflow-hidden bg-inherit text-base font-normal focus:border-none focus:outline-none"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${target.scrollHeight}px`
          }}
          ref={descriptionRef}
        />
      </div>
      <div className="flex gap-2 pb-2">
        <Select
          onValueChange={(value) =>
            setFormData({
              ...formData,
              priority: value as (typeof goalPriorityEnum.enumValues)[number],
            })
          }
          value={formData.priority}
        >
          <SelectTrigger className="size-8 w-[90px] focus:ring-0">
            <SelectValue placeholder="Priority">
              <span className="flex items-center gap-2 capitalize">
                <Flag
                  className="h-4 w-4"
                  color={priorityColors[formData.priority as keyof typeof priorityColors]}
                  fill={priorityColors[formData.priority as keyof typeof priorityColors]}
                />
                P{formData.priority?.split('_')[1]}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              {goalPriorityEnum.enumValues.map((value) => (
                <SelectItem value={value} className="">
                  <span className="flex items-center gap-2 capitalize">
                    <Flag className="h-4 w-4" color={priorityColors[value]} fill={priorityColors[value]} />
                    {value.replace('_', ' ')}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            setFormData({
              ...formData,
              impact: value as (typeof goalImpactEnum.enumValues)[number],
            })
          }
          value={formData.impact}
        >
          <SelectTrigger className="size-8 w-fit focus:ring-0">
            <SelectValue placeholder="Impact">
              <span className="flex items-center gap-0 capitalize">
                {Array.from({
                  length: impactNumber[formData.impact as keyof typeof impactNumber],
                }).map((_, i) => (
                  <Zap key={i} className="h-3 w-3" color="gold" fill="gold" />
                ))}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              <SelectLabel>Impact</SelectLabel>
              {goalImpactEnum.enumValues
                .map((value) => (
                  <SelectItem value={value} className="">
                    <span className="flex items-center gap-0 capitalize">
                      <span className="mr-1 text-sm">{value}</span>
                      {Array.from({
                        length: impactNumber[value],
                      }).map((_, i) => (
                        <Zap key={i} className="h-3 w-3" color="gold" fill="gold" />
                      ))}
                    </span>
                  </SelectItem>
                ))
                .reverse()}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            setFormData({
              ...formData,
              category: value as (typeof goalCategoryEnum.enumValues)[number],
            })
          }
          value={formData.category}
        >
          <SelectTrigger className="size-8 w-fit focus:ring-0">
            <SelectValue placeholder="Category">
              <span className="mr-0.5 flex text-xs capitalize">{formData.category?.replace('_', ' ')}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              {goalCategoryEnum.enumValues
                .map((value) => (
                  <SelectItem value={value} className="">
                    <span className="flex items-center gap-0 capitalize">
                      <span className="mr-1 text-sm">{value.replace('_', ' ')}</span>
                    </span>
                  </SelectItem>
                ))
                .reverse()}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) =>
            setFormData({
              ...formData,
              type: value as (typeof goalTypeEnum.enumValues)[number],
            })
          }
          value={formData.type}
        >
          <SelectTrigger className="size-8 w-fit focus:ring-0">
            <SelectValue placeholder="Type">
              <span className="mr-0.5 flex text-xs capitalize">{formData.type?.replace('_', ' ')}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              {goalTypeEnum.enumValues.map((value) => (
                <SelectItem value={value} className="">
                  <span className="flex items-center gap-0 capitalize">
                    <span className="mr-1 text-sm">{value.replace('_', ' ')}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button onClick={onCancel} variant="secondary" size="sm" className="h-8 text-xs" type="button">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-8 text-xs" loading={loading} disabled={loading || !formData.title}>
          Add goal
        </Button>
      </div>
    </form>
  )
}
