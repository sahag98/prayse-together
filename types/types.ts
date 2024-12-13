export interface GroupMembers {
  id: number;
  user_id: string;
  group_id: number;
  study_group: StudyGroup; // Assuming this is the foreign key relationship
  profiles: Profile; // Assuming this is the foreign key relationship
}

export interface StudyGroup {
  id: number;
  name: string;
  description: string;
  frequency: string;
  code: number;
  admin_id: string;
  note_id: number;
  group_notes: Note;
}

export interface Lesson {
  id: number;
  title: string;
  group_id: number;
  study_admin: string; // Assuming this is the foreign key relationship
}

export interface Note {
  id: number;
  note: string | null;
  group_id: number;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  // Add other profile fields as necessary
}
