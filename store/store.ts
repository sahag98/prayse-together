import { create } from 'zustand';
import AsyncStorage from 'expo-sqlite/kv-store';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Note } from '~/types/types';

export type note = {
  id: string;
  creationDate: string;
  groupName: string;

  data: Note[];
};
export interface AppState {
  notes: note[];
  studiedPlans: string[];
  saveNotes: (data: { id: string; creationDate: string; groupName: string; data: Note[] }) => void;
  removeAll: () => void;
  removePlans: () => void;
  removeNote: (id:string)=>void;
  addPlan: (data: string) => void;
}

export const useUserStore = create(
  persist<AppState>(
    (set, get) => ({
      studiedPlans: [],
      notes: [],
      saveNotes: (data: { id: string; creationDate: string; groupName: string; data: Note[] }) => {
        const currentNotes = get().notes;
        console.log('saving notes: ', data);
        set({ notes: [...currentNotes, data] });
      },
      addPlan: (data: string) => {
        const currentPlans = get().studiedPlans;
        set({ studiedPlans: [...currentPlans, data] });
      },
      removeAll: () => {
        set({ notes: [] });
      },
      removeNote: (id: string)=>{
        const currentNotes = get().notes;
  const updatedNotes = currentNotes.filter(note => note.id !== id);
  set({ notes: updatedNotes });
      },
      removePlans: () => {
        set({ studiedPlans: [] });
      },
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => AsyncStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
