import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Model {
  id: string;
  name: string;
  description?: string;
  version?: string;
}

interface ModelState {
  activeModel: string;
  modelOptions: Model[];
  setActiveModel: (modelId: string) => void;
  addModel: (model: Model) => void;
  removeModel: (modelId: string) => void;
}

const defaultModels: Model[] = [
  {
    id: 'default',
    name: 'Default Model',
    description: 'Standard prediction model',
    version: '1.0.0',
  },
  {
    id: 'advanced',
    name: 'Advanced Model',
    description: 'Enhanced prediction model with additional features',
    version: '2.0.0',
  },
];

export const useModelStore = create<ModelState>()(
  persist(
    set => ({
      activeModel: 'default',
      modelOptions: defaultModels,
      setActiveModel: modelId => set({ activeModel: modelId }),
      addModel: model =>
        set(state => ({
          modelOptions: [...state.modelOptions, model],
        })),
      removeModel: modelId =>
        set(state => ({
          modelOptions: state.modelOptions.filter(m => m.id !== modelId),
        })),
    }),
    {
      name: 'model-storage',
      partialize: state => ({
        activeModel: state.activeModel,
        modelOptions: state.modelOptions,
      }),
    }
  )
);
