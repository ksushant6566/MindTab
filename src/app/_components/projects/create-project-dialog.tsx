"use client";

import React, { useState } from "react";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { CreateProjectDto } from "~/server/api/dtos/projects";
import { projectStatusEnum } from "~/server/db/schema";

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (project: z.infer<typeof CreateProjectDto>) => void;
    onCancel: () => void;
};

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
    open,
    onOpenChange,
    onSave,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<z.infer<typeof CreateProjectDto>>({
        name: "",
        description: "",
        status: "active",
        startDate: new Date().toISOString().split("T")[0],
        endDate: undefined,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                value === "" ? (name === "endDate" ? undefined : "") : value,
        }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            onSave(formData);
            setFormData({
                name: "",
                description: "",
                status: "active",
                startDate: new Date().toISOString().split("T")[0],
                endDate: undefined,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: "",
            description: "",
            status: "active",
            startDate: new Date().toISOString().split("T")[0],
            endDate: undefined,
        });
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter project name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Enter project description (optional)"
                            value={formData.description || ""}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status || "active"}
                            onValueChange={(value) =>
                                handleSelectChange("status", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {projectStatusEnum.enumValues.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formData.endDate || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.name}
                        >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
