import React, { useState } from 'react'
import { CheckedState } from '@radix-ui/react-checkbox'
import { Checkbox } from '~/components/ui/checkbox'
import Confetti from 'react-confetti'
import { InferSelectModel } from 'drizzle-orm'

type THabit = InferSelectModel<typeof import('~/server/db/schema').habits>

type HabitCellProps = {
    habit: THabit
    date: string
    isEditable: boolean
    isChecked: boolean
    onCheckedChange: (checked: CheckedState, date: string) => void
}

export const HabitCell: React.FC<HabitCellProps> = ({
    habit,
    date,
    isEditable,
    isChecked,
    onCheckedChange,
}) => {
    const [showConfetti, setShowConfetti] = useState(false)
    const [confettiSource, setConfettiSource] = useState({ x: 0, y: 0 })

    return (
        <div className="flex justify-center items-center">
            <button
                onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect()
                    const scrollX = window.scrollX || window.pageXOffset
                    const scrollY = window.scrollY || window.pageYOffset
                    setConfettiSource({
                        x: rect.left + rect.width / 2 + scrollX,
                        y: rect.top + rect.height / 2 + scrollY
                    })
                }}
                className="w-8 h-8 md:w-full md:h-11"
            >
                <Checkbox
                    className="w-full h-full"
                    disabled={!isEditable}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                        if (checked) setShowConfetti(true)
                        onCheckedChange(checked, date)
                    }}
                />
            </button>
            {showConfetti && (
                <Confetti
                    recycle={false}
                    gravity={0.5}
                    opacity={0.7}
                    wind={0.5}
                    initialVelocityY={40}
                    initialVelocityX={10}
                    numberOfPieces={15}
                    colors={['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF1493']}
                    confettiSource={{
                        x: confettiSource.x,
                        y: confettiSource.y,
                        w: 0,
                        h: 0
                    }}
                    style={{
                        position: 'fixed',
                        pointerEvents: 'none',
                        width: '100%',
                        height: '100%',
                        top: '0',
                        left: '0',
                    }}
                    tweenDuration={100}
                    onConfettiComplete={(confetti) => {
                        confetti?.stop();
                        confetti?.reset();
                        setShowConfetti(false);
                    }}
                />
            )}
        </div>
    )
}
