"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Edit3, Flag, Loader2, Plus, Trash2, Zap } from "lucide-react";
import {
  goalCategoryEnum,
  goalImpactEnum,
  goalPriorityEnum,
  goalTypeEnum,
} from "~/server/db/schema";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "~/components/ui/select";
import { CheckedState } from "@radix-ui/react-checkbox";
import { goals } from "~/server/db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const priorityColors = {
  priority_1: "red",
  priority_2: "yellow",
  priority_3: "green",
  priority_4: "white",
};

const impactNumber = {
  low: 1,
  medium: 2,
  high: 3,
};

const ZInsertGoal = createInsertSchema(goals).omit({ userId: true });

export const Goals: React.FC = () => {
  const { data: goals, isLoading, refetch } = api.goals.getAll.useQuery();
  const { mutate: createGoal, isPending: isCreatingGoal } =
    api.goals.create.useMutation({
      onSuccess: () => {
        refetch();
      },
    });
  const {
    mutate: updateGoal,
    isPending: isUpdatingGoal,
    variables: updateGoalVariables,
  } = api.goals.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const {
    mutate: deleteGoal,
    isPending: isDeletingGoal,
    variables: deleteGoalVariables,
  } = api.goals.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [selectedGoalType, setSelectedGoalType] =
    useState<(typeof goalTypeEnum.enumValues)[number]>("daily");

  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);

  const onCreateGoal = (goal: z.infer<typeof ZInsertGoal>) => {
    createGoal(goal);
    setIsCreateGoalOpen(false);
  };

  const onCancelCreateGoal = () => {
    setIsCreateGoalOpen(false);
  };

  const toggleGoalStatus = (goalId: string, checked: CheckedState) => {
    updateGoal({
      id: goalId,
      status: checked ? "completed" : "pending",
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal({ id: goalId });
  };

  return (
    <div className="space-y-8">
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
          <Button
            size="sm"
            className="w-20 text-xs"
            variant={selectedGoalType === "daily" ? "default" : "outline"}
            onClick={() => setSelectedGoalType("daily")}
          >
            Daily
          </Button>
        </div>
      </div>
      <div className="">
        {isLoading ? (
          <div className="flex items-center justify-start">
            <Loader2 className="mb-4 ml-8 h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 pr-4">
            {goals?.map((goal, i) => (
              <div
                key={goal.id}
                className="group flex justify-between gap-2 py-3"
              >
                <div className="flex items-start gap-3">
                  {isUpdatingGoal && goal.id === updateGoalVariables?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Checkbox
                      id={goal.id}
                      className="h-4 w-4 rounded-full"
                      checked={goal.status === "completed"}
                      onCheckedChange={(checked) =>
                        toggleGoalStatus(goal.id, checked)
                      }
                    />
                  )}
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={goal.id}
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${goal.status === "completed" ? "line-through" : ""}`}
                    >
                      {goal.title}
                    </label>
                    {goal.description && (
                      <p
                        className={`text-sm text-muted-foreground ${
                          goal.status === "completed" ? "line-through" : ""
                        } `}
                      >
                        {goal.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-muted-foreground">
                        <Flag
                          className="h-3 w-3"
                          color={priorityColors[goal.priority]}
                          fill={priorityColors[goal.priority]}
                        />
                        P{goal.priority.split("_")[1]}
                      </span>
                      <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-muted-foreground text-yellow-300">
                        <Zap
                          className="mr-1 h-3 w-3"
                          color={"gold"}
                          fill={"gold"}
                        />
                        {goal.impact}
                      </span>
                      <span className="flex items-center gap-0 rounded-md bg-secondary px-1 py-0.5 text-xs capitalize text-green-300 text-muted-foreground">
                        {goal.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex -translate-y-6 gap-0 opacity-0 transition-all group-hover:-translate-y-2 group-hover:opacity-100">
                  <Button size="sm" variant="ghost" className="">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-900 active:bg-red-900"
                    onClick={() => handleDeleteGoal(goal.id)}
                    disabled={
                      isDeletingGoal && deleteGoalVariables?.id === goal.id
                    }
                    loading={
                      isDeletingGoal && deleteGoalVariables?.id === goal.id
                    }
                    hideContentWhenLoading
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {isCreateGoalOpen ? (
          <CreateGoal
            onSave={onCreateGoal}
            onCancel={onCancelCreateGoal}
            // defaultValues={}
          />
        ) : (
          <div className="">
            <Button
              onClick={() => setIsCreateGoalOpen(true)}
              disabled={isCreatingGoal}
              variant="ghost"
              size={"sm"}
              className="flex items-center gap-2 text-sm font-normal"
            >
              <Plus className="h-4 w-4" /> Add Goal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

type CreateEditGoalProps = {
  onSave: (goal: z.infer<typeof ZInsertGoal>) => void;
  onCancel: () => void;
  defaultValues?: Partial<z.infer<typeof ZInsertGoal>>;
};
// | {
//     mode: "edit";
//     goal: Goal;
//     onSave: (goal: Goal) => void;
//     onCancel: () => void;
//   };

const CreateGoal: React.FC<CreateEditGoalProps> = ({
  onSave,
  onCancel,
  defaultValues,
}) => {
  const [formData, setFormData] = React.useState<z.infer<typeof ZInsertGoal>>({
    title: defaultValues?.title,
    description: defaultValues?.description,
    priority: defaultValues?.priority || goalPriorityEnum.enumValues[0],
    impact: defaultValues?.impact || goalImpactEnum.enumValues[1],
    category: defaultValues?.category || goalCategoryEnum.enumValues[0],
    type: defaultValues?.type || goalTypeEnum.enumValues[0],
    status: "pending",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border p-4"
    >
      <div className="">
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Goal name"
          value={formData.title || ""}
          onChange={handleChange}
          required
          className="w-full bg-inherit text-base font-semibold focus:border-none focus:outline-none"
        />
        <textarea
          id="description"
          name="description"
          placeholder="Description"
          value={formData.description || ""}
          onChange={handleChange}
          className="w-full resize-none overflow-hidden bg-inherit text-sm font-normal focus:border-none focus:outline-none"
          style={{ height: "auto" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      </div>
      <div className="flex gap-2 border-b pb-2">
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
                  color={
                    priorityColors[
                      formData.priority as keyof typeof priorityColors
                    ]
                  }
                  fill={
                    priorityColors[
                      formData.priority as keyof typeof priorityColors
                    ]
                  }
                />
                P{formData.priority?.split("_")[1]}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              {goalPriorityEnum.enumValues.map((value) => (
                <SelectItem value={value} className="">
                  <span className="flex items-center gap-2 capitalize">
                    <Flag
                      className="h-4 w-4"
                      color={priorityColors[value]}
                      fill={priorityColors[value]}
                    />
                    {value.replace("_", " ")}
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
                  length:
                    impactNumber[formData.impact as keyof typeof impactNumber],
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
                      {Array.from({ length: impactNumber[value] }).map(
                        (_, i) => (
                          <Zap
                            key={i}
                            className="h-3 w-3"
                            color="gold"
                            fill="gold"
                          />
                        ),
                      )}
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
              <span className="mr-0.5 flex text-xs capitalize">
                {formData.category?.replace("_", " ")}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              {goalCategoryEnum.enumValues
                .map((value) => (
                  <SelectItem value={value} className="">
                    <span className="flex items-center gap-0 capitalize">
                      <span className="mr-1 text-sm">
                        {value.replace("_", " ")}
                      </span>
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
              <span className="mr-0.5 flex text-xs capitalize">
                {formData.type?.replace("_", " ")}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="text-sm">
            <SelectGroup>
              {goalTypeEnum.enumValues.map((value) => (
                <SelectItem value={value} className="">
                  <span className="flex items-center gap-0 capitalize">
                    <span className="mr-1 text-sm">
                      {value.replace("_", " ")}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          onClick={onCancel}
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          type="button"
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" className="h-8 text-xs">
          Add goal
        </Button>
      </div>
    </form>
  );
};
