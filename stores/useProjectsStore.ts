import { ColorWithTranslations, Project } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OverlayConfig = NonNullable<Project["overlayConfig"]>;

interface ProjectsState {
  projects: Project[];
  activeProjectId: string | null;
  createProject: (name: string) => string;
  getProject: (id: string) => Project | undefined;
  getActiveProject: () => Project | null;
  setActiveProject: (id: string | null) => void;
  updateProject: (
    id: string,
    updates: Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>
  ) => void;
  setProjectSketch: (projectId: string, sketchImageUri: string) => void;
  setProjectWallImage: (projectId: string, wallImageUri: string) => void;
  updateOverlayConfig: (projectId: string, config: Partial<OverlayConfig>) => void;
  deleteProject: (id: string) => void;
}

const defaultOverlayConfig: OverlayConfig = {
  opacity: 0.7,
  scale: 1,
  rotation: 0,
  position: { x: 0, y: 0 },
};

const convertStoredProject = (stored: unknown): Project => {
  const s = stored as Record<string, unknown>;
  if (!s) return stored as Project;
  return {
    ...s,
    createdAt: s.createdAt ? new Date(s.createdAt as string) : new Date(),
    updatedAt: s.updatedAt ? new Date(s.updatedAt as string) : new Date(),
  } as Project;
};

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProject: (name: string) => {
        const project: Project = {
          id: `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name,
          colorPalette: [],
          overlayConfig: { ...defaultOverlayConfig },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          projects: [...state.projects, project],
          activeProjectId: state.activeProjectId ?? project.id,
        }));
        return project.id;
      },

      getProject: (id: string) => get().projects.find((p) => p.id === id),
      getActiveProject: () => {
        const { activeProjectId, projects } = get();
        if (!activeProjectId) return null;
        return projects.find((p) => p.id === activeProjectId) ?? null;
      },

      setActiveProject: (id: string | null) => set({ activeProjectId: id }),

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date() }
              : p
          ),
        }));
      },

      setProjectSketch: (projectId, sketchImageUri) => {
        get().updateProject(projectId, { sketchImageUri });
      },

      setProjectWallImage: (projectId, wallImageUri) => {
        get().updateProject(projectId, { wallImageUri });
      },

      updateOverlayConfig: (projectId, config) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            const current = p.overlayConfig ?? defaultOverlayConfig;
            const next: OverlayConfig = {
              opacity: config.opacity ?? current.opacity,
              scale: config.scale ?? current.scale,
              rotation: config.rotation ?? current.rotation,
              position: config.position ?? current.position,
            };
            return {
              ...p,
              overlayConfig: next,
              updatedAt: new Date(),
            };
          }),
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const next = state.projects.filter((p) => p.id !== id);
          const nextActive =
            state.activeProjectId === id
              ? (next[0]?.id ?? null)
              : state.activeProjectId;
          return { projects: next, activeProjectId: nextActive };
        });
      },
    }),
    {
      name: "projects-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.projects) {
          state.projects = state.projects.map(convertStoredProject);
        }
      },
    }
  )
);
