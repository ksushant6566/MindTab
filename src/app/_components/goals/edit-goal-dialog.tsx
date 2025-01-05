import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { EditGoal, EditGoalProps } from './edit-goal'

type EditGoalDialogProps = EditGoalProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const EditGoalDialog: React.FC<EditGoalDialogProps> = ({ open, onOpenChange, ...props }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="sr-only">Edit Goal</DialogTitle>
        <DialogDescription className="sr-only">Edit your goal.</DialogDescription>
      </DialogHeader>
      <DialogContent className="max-w-lg md:max-w-xl border-none p-0">
        <EditGoal {...props} />
      </DialogContent>
    </Dialog>
  )
}
