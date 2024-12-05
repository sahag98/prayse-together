import { supabase } from './supabase';

export const getGoogleOAuthUrl = async () => {
  const result = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'exp://192.168.1.44:8081',
      // prayseapp://google-auth
      // exp://192.168.1.110:19000
    },
  });

  return result.data.url;
};
