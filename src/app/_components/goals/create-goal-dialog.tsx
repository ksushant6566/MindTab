import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { CreateGoal, CreateGoalProps } from './create-goal'

type CreateGoalDialogProps = CreateGoalProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({ open, onOpenChange, ...props }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="sr-only">Create Goal</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new goal, add a title, description, and other details.
        </DialogDescription>
      </DialogHeader>
      <DialogContent className="max-w-lg md:max-w-xl border-none p-0">
        <CreateGoal {...props} />
      </DialogContent>
    </Dialog>
  )
}
