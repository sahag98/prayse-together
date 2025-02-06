import { create } from 'zustand';
import AsyncStorage from 'expo-sqlite/kv-store';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GroupMembers, Note } from '~/types/types';
import { supabase } from '~/utils/supabase';

export type note = {
  id: string;
  creationDate: string;
  groupName: string;

  data: Note[];
};
export interface AppState {
  selectedEmoji: string;
  setSelectedEmoji: (data:string)=>void;
  notes: note[];
  studiedPlans: string[];
  saveNotes: (data: { id: string; creationDate: string; groupName: string; data: Note[] }) => void;
  removeAll: () => void;
  removePlans: () => void;
  removeNote: (id:string)=>void;
  addPlan: (data: string) => void;
  studies: GroupMembers [],
  fetchStudies: (userId: string)=> Promise<void>;
   removeStudy: (userId:string, adminId:string,studyId: string) => void;
}

export const useUserStore = create(
  persist<AppState>(
    (set, get) => ({
      selectedEmoji:"",
      setSelectedEmoji: (data)=>{
        set({selectedEmoji:data})
      },
      studies:[],
      fetchStudies: async (userId) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, study_group(*), profiles(username)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error && !data) {
      console.error('Error fetching studies:', error);
      return;
    }
    //@ts-ignore
    set({ studies: data || [] });
  },
  removeStudy: async (userId, adminId,studyId) => {
      if (userId === adminId) {
      await supabase.from('study_group').delete().eq('id', studyId);
      } else {
      await supabase
        .from('group_members')
        .delete()
        .eq('user_id', userId)
        .eq('group_id', studyId);
    }
 set((state) => ({
      studies: state.studies.filter((study) => study.study_group.id !== Number(studyId)),
    }))
  },
  
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
