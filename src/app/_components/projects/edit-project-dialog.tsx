"use client";

import React, { useState, useEffect } from "react";
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
import { UpdateProjectDto } from "~/server/api/dtos/projects";
import { projectStatusEnum } from "~/server/db/schema";
import { handleCmdEnterSubmit } from "~/lib/utils";

type Project = {
    id: string;
    name: string | null;
    description: string | null;
    status: (typeof projectStatusEnum.enumValues)[number];
    startDate: string;
    endDate: string | null;
};

type EditProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onSave: (project: z.infer<typeof UpdateProjectDto>) => Promise<void>;
    onCancel: () => void;
};

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
    open,
    onOpenChange,
    project,
    onSave,
    onCancel,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: project.name || "",
        description: project.description || "",
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate || "",
    });

    // Update form values when project changes
    useEffect(() => {
        setFormData({
            name: project.name || "",
            description: project.description || "",
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate || "",
        });
    }, [project]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                ...formData,
                id: project.id,
                endDate: formData.endDate === "" ? undefined : formData.endDate,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: project.name || "",
            description: project.description || "",
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate || "",
        });
        onCancel();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} onKeyDown={handleCmdEnterSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter project name"
                            value={formData.name}
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
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
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
                            loading={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
