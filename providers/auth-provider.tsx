import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Database, Tables } from '~/database.types';

import { supabase } from '~/utils/supabase';

const AuthContext = createContext<{
  session: Session | null;
  currentUser: Tables<'profiles'> | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<Tables<'profiles'> | null>>;
  getGoogleOAuthUrl: () => Promise<string>;
  isAuthenticated: boolean;
}>({
  session: null,
  currentUser: null,
  setCurrentUser: () => null,
  getGoogleOAuthUrl: async () => '',
  isAuthenticated: false,
});

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Tables<'profiles'> | null>(null);
  const [isReady, setIsReady] = useState(false);

  const getGoogleOAuthUrl = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'exp://192.168.1.44:8081',
        // prayseapp://google-auth
        // exp://192.168.1.110:19000
      },
    });
    return result.data.url!;
  };

  async function getUser(user: User | undefined) {
    if (!user) return;
    const { data: profiles } = await supabase.from('profiles').select('*').eq('id', user.id);
    if (!profiles) return;
    setCurrentUser(profiles[0]);
    setIsReady(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      getUser(user);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      getUser(user);
    });
  }, []);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        getGoogleOAuthUrl,
        currentUser,
        setCurrentUser,
        isAuthenticated: !!session?.user,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
