import { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Database, Tables } from '~/database.types';
import { GroupMembers } from '~/types/types';

import { supabase } from '~/utils/supabase';

const AuthContext = createContext<{
  session: Session | null;
  currentUser: Tables<'profiles'> | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<Tables<'profiles'> | null>>;
  userGroups: GroupMembers[] | null;
  getGoogleOAuthUrl: () => Promise<string>;
  getUserGroups: () => void;
  isAuthenticated: boolean;
}>({
  session: null,
  currentUser: null,
  userGroups: [],
  setCurrentUser: () => null,
  getGoogleOAuthUrl: async () => '',
  getUserGroups: async () => null,
  isAuthenticated: false,
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Tables<'profiles'> | null>(null);
  const [userGroups, setUserGroups] = useState<GroupMembers[] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const queryClient = useQueryClient();
  const getGoogleOAuthUrl = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'prayse-together://',
        // prayseapp://google-auth
        // exp://192.168.1.110:19000
      },
    });
    return result.data.url!;
  };

  async function getUser(user: User | undefined) {
    if (user) {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('id', user.id);
      if (profiles) {
        setCurrentUser(profiles[0]);
      }
    }

    setIsReady(true);
  }

  async function getUserGroups() {
    if (!currentUser) return;

    let { data, error } = await supabase
      .from('group_members')
      .select('*, study_group(*), profiles(username)')
      .eq('user_id', currentUser.id!)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user groups:', error);
      return;
    }
    return data;
  }

  async function getGroupMembers(id: any) {
    if (!currentUser) return;
    const { data: group_members, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', id)
      .neq('user_id', currentUser.id);

    if (group_members) {
      return group_members;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        getUser(user);
        getUserGroups();
      } else {
        setIsReady(true);
      }

      // setIsReady(true);
      // console.log('get session: ', user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user) {
        getUser(user);
      } else {
        setIsReady(true);
      }
    });

    // const channels = supabase
    //   .channel('groups-all-channel')
    //   .on(
    //     'postgres_changes',
    //     { event: 'INSERT', schema: 'public', table: 'group_members' },
    //     (payload) => {
    //       console.log('payload: ', payload);
    //       getUserGroups();
    //     }
    //   )
    //   .subscribe();
    // return () => {
    //   supabase.removeChannel(channels);
    // };
  }, []);

  useEffect(() => {
    const channels = supabase
      .channel('groups-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members' },
        (payload) => {
          console.log('NEW MEMBER payload: ', payload.new);
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          const newMember = payload.new;
          // getGroupMembers(newMember.group_id);
          // getUserGroups();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'study_group' },
        (payload) => {
          console.log('DELETING GROUP');
          queryClient.invalidateQueries({ queryKey: ['groups'] });
          const newMember = payload.new;
          // getGroupMembers(newMember.group_id);
          // getUserGroups();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channels);
    };
  }, []);

  if (!isReady) {
    return;
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        getGoogleOAuthUrl,
        getUserGroups,
        currentUser,
        setCurrentUser,
        userGroups,
        isAuthenticated: !!session?.user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
