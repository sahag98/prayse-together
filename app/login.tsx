import { Image, Pressable, Text, View } from 'react-native';
import { Container } from '~/components/Container';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
export default function Login() {
  const { getGoogleOAuthUrl, currentUser, setCurrentUser } = useAuth();
  const onSignInWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
      // console.log('creden')
      if (credential.identityToken) {
        const {
          error,
          data: { user },
        } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (!error) {
          console.log('Signed in!');
          //   router.push(COMMUNITY_SCREEN);
        }
      } else {
        throw new Error('No identityToken.');
      }
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
      }
    }
  };

  const onSignInWithGoogle = async () => {
    try {
      const url = await getGoogleOAuthUrl();
      if (!url) {
        console.log('error with url');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(url, 'exp://192.168.1.44:8081', {
        showInRecents: true,
      });

      if (result.type === 'success') {
        const data = extractParamsFromUrl(result.url);

        if (!data.access_token || !data.refresh_token) {
          console.log('error', 'Failed to get authentication tokens');
          return;
        }
        const { data: authData, error } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (!authData.session) return;
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.session.user.id);

        if (!profiles) return;

        setCurrentUser(profiles[0]);

        router.push('/');
      } else if (result.type === 'cancel') {
        console.log('info', 'Google sign-in was cancelled');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const extractParamsFromUrl = (url: string) => {
    const params = new URLSearchParams(url.split('#')[1]);
    const data = {
      access_token: params.get('access_token'),
      //@ts-nocheck
      expires_in: parseInt(params.get('expires_in') || '0', 10),
      refresh_token: params.get('refresh_token'),
      token_type: params.get('token_type'),
      provider_token: params.get('provider_token'),
    };

    return data;
  };
  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        <View className="flex-1 justify-center gap-5 px-4">
          <View className="gap-2">
            <Image
              source={require('../assets/prayse-together-logo.png')}
              width={600}
              height={600}
              className="size-72 self-center"
            />
            <Text className="text-4xl font-bold">Welcome to App Name</Text>
            <Text className="">
              Your guide to exploring the Bible and growing in faith with others.
            </Text>
          </View>
          <View className="mt-5 gap-3">
            <Pressable
              onPress={onSignInWithGoogle}
              className="flex-row items-center justify-center gap-2 rounded-lg bg-light-primary p-4">
              <AntDesign name="google" size={24} color="black" />
              <Text className="font-semibold">Continue with Google</Text>
            </Pressable>
            <Pressable
              onPress={onSignInWithApple}
              className="flex-row items-center justify-center gap-2 rounded-lg bg-light-primary p-4">
              <AntDesign name="apple-o" size={24} color="black" />
              <Text className="font-semibold">Continue with Apple</Text>
            </Pressable>
          </View>
        </View>
      </Container>
    </>
  );
}
