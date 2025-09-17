import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum EActiveLayout {
    Goals = "Goals",
    Habits = "Habits",
    Notes = "Notes",
}

interface AppState {
    // Layout state
    layoutVersion: number;
    activeElement: EActiveLayout;
    activeProjectId: string | null;

    // Actions
    setLayoutVersion: (version: number) => void;
    setActiveElement: (element: EActiveLayout) => void;
    setActiveProjectId: (projectId: string | null) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // Initial state
            layoutVersion: 1,
            activeElement: EActiveLayout.Goals,
            activeProjectId: null,

            // Actions
            setLayoutVersion: (version: number) =>
                set({ layoutVersion: version }),
            setActiveElement: (element: EActiveLayout) =>
                set({ activeElement: element }),
            setActiveProjectId: (projectId: string | null) =>
                set({ activeProjectId: projectId }),
        }),
        {
            name: "mindtab-app-storage", // localStorage key
            // Only persist the state we need, not the actions
            partialize: (state) => ({
                layoutVersion: state.layoutVersion,
                activeElement: state.activeElement,
                activeProjectId: state.activeProjectId,
            }),
        }
    )
);
