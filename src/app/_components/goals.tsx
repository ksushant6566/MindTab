"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Plus } from "lucide-react";
import { goalTypeEnum } from "~/server/db/schema";

export const Goals: React.FC = () => {
  const { data: goals, isLoading, refetch } = api.goals.getAll.useQuery();
  const { mutate: createGoal, isPending: isCreatingGoal } =
    api.goals.create.useMutation({
      onSuccess: () => {
        refetch();
      },
    });
  const { mutate: updateGoal, isPending: isUpdatingGoal } =
    api.goals.update.useMutation();
  const { mutate: deleteGoal, isPending: isDeletingGoal } =
    api.goals.delete.useMutation();

  const [selectedGoalType, setSelectedGoalType] =
    useState<(typeof goalTypeEnum.enumValues)[number]>("weekly");

  const onCreateGoal = () => {
    createGoal({
      title: "New Goal",
      description: "",
      priority: "medium",
      impact: "medium",
      category: "health",
      type: "one_time",
    });
  };

  // const onUpdateGoal = (goal: Goal) => {
  //   updateGoal(goal);
  // };

  return (
    <div className="space-y-12">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-6xl font-thin">
            {new Date().toLocaleTimeString("en-IN", {
              minute: "numeric",
              hour: "numeric",
              hour12: false,
            })}
          </h1>
          <h1 className="text-xl font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h1>
        </div>

        {/* <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-medium">Goals</h1>
          </div>
        </div> */}

        <div className="flex flex-row-reverse justify-end gap-2">
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === "yearly" ? "default" : "outline"}
            onClick={() => setSelectedGoalType("yearly")}
          >
            Yearly
          </Button>
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === "monthly" ? "default" : "outline"}
            onClick={() => setSelectedGoalType("monthly")}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === "weekly" ? "default" : "outline"}
            onClick={() => setSelectedGoalType("weekly")}
          >
            Weekly
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {goals?.map((goal, i) => (
          <div key={goal.id} className="flex items-center gap-2">
            <span className="font-medium">{i + 1}.</span>
            <div className="flex flex-col space-y-0.5">
              <h3 className="text-base">
                <span>{goal.title}</span>
              </h3>
            </div>
          </div>
        ))}
        <div>
          <Button
            onClick={onCreateGoal}
            disabled={isCreatingGoal}
            variant="ghost"
            size={"sm"}
            className="flex items-center gap-2 text-sm font-normal"
          >
            Add Goal <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
