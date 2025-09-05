"use client";

import React, { useEffect, useState } from "react";
import { Goals } from "./goals/index";
import { Habits } from "./habits";
import { Journals } from "./journals";
import { Button } from "~/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { Clock } from "./clock";

enum EActiveLayout {
    Goals = "Goals",
    Habits = "Habits",
    Notes = "Notes",
}

const layout1 = {
    container: {
        style: "max-w-screen-lg",
    },
    col1: {
        elements: [
            {
                element: <Goals viewMode={"list"} layoutVersion={1} />,
                title: EActiveLayout.Goals,
            },
        ],
        style: "col-span-4",
    },
    col2: {
        elements: [
            {
                element: <Habits viewMode={"table"} />,
                title: EActiveLayout.Habits,
            },
            {
                element: <Journals />,
                title: EActiveLayout.Notes,
            },
        ],
        style: "col-span-6",
    },
    activeColumn: "col2",
};

const layout2 = {
    container: {
        style: "w-full max-w-screen-xl",
    },
    col1: {
        elements: [
            {
                element: <Goals viewMode={"kanban"} layoutVersion={2} />,
                title: EActiveLayout.Goals,
            },
            {
                element: <Journals />,
                title: EActiveLayout.Notes,
            },
        ],
        style: "col-span-8",
    },
    col2: {
        elements: [
            {
                element: <Habits viewMode={"cards"} />,
                title: EActiveLayout.Habits,
            },
        ],
        style: "col-span-2",
    },
    activeColumn: "col1",
};

export default function Component() {
    const [isHydrated, setIsHydrated] = useState(false);
    const [layoutVersion, setLayoutVersion] = useState(1);
    const layout = layoutVersion === 1 ? layout1 : layout2;

    const [activeElement, setActiveElement] = useState<EActiveLayout>(
        layout[layout.activeColumn as "col1" | "col2"].elements[0]!.title
    );

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        const storedLayoutVersion = localStorage.getItem("layoutVersion");
        if (storedLayoutVersion) {
            setLayoutVersion(parseInt(storedLayoutVersion));
        }

        const storedActiveElement = localStorage.getItem("activeElement");
        if (storedActiveElement) {
            setActiveElement(storedActiveElement as EActiveLayout);
        }
    }, []);

    const handleLayoutVersionChange = (layoutVersion: number) => {
        setLayoutVersion(layoutVersion);
        localStorage.setItem("layoutVersion", layoutVersion.toString());

        // if active layout includes activeElement, set activeElement do nothing else update to the first element in the new layout
        const activeLayout = layoutVersion === 1 ? layout1 : layout2;
        const activeColumn =
            activeLayout[activeLayout.activeColumn as "col1" | "col2"];

        if (
            activeColumn.elements.some(({ title }) => title === activeElement)
        ) {
            return;
        }

        handleActiveElementChange(activeColumn.elements[0]!.title);
    };

    const handleActiveElementChange = (activeElement: EActiveLayout) => {
        setActiveElement(activeElement);
        localStorage.setItem("activeElement", activeElement);
    };

    if (!isHydrated) return null;

    return (
        <div
            className={`flex flex-col gap-2 relative transition-all ease-out duration-150 ${layout.container.style}`}
        >
            <div className="w-full grid grid-cols-10 gap-4">
                <div className="flex justify-between items-center col-span-10">
                    <Clock />
                    <div className="flex flex-row-reverse gap-8">
                        <div className="flex gap-2">
                            <Button
                                variant={
                                    layoutVersion === 1
                                        ? "default"
                                        : "secondary"
                                }
                                size="sm"
                                onClick={() => handleLayoutVersionChange(1)}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={
                                    layoutVersion === 2
                                        ? "default"
                                        : "secondary"
                                }
                                size="sm"
                                onClick={() => handleLayoutVersionChange(2)}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            {layout[
                                layout.activeColumn as "col1" | "col2"
                            ].elements.map((element) => (
                                <Button
                                    key={element.title}
                                    size={"sm"}
                                    onClick={() =>
                                        handleActiveElementChange(element.title)
                                    }
                                    variant={
                                        activeElement === element.title
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {element.title}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={`${layout.col1.style} min-w-0`}>
                    {layout.col1.elements.map((element, index) => (
                        <div
                            className={`${layout.activeColumn === "col1" ? (activeElement === element.title ? "block" : "hidden") : "block"} w-full`}
                            key={index}
                        >
                            {element.element}
                        </div>
                    ))}
                </div>
                <div className={`${layout.col2.style} min-w-0`}>
                    {layout.col2.elements.map((element, index) => (
                        <div
                            className={`${layout.activeColumn === "col2" ? (activeElement === element.title ? "block" : "hidden") : "block"} w-full`}
                            key={index}
                        >
                            {element.element}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
