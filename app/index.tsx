import { Image, Pressable, Text, View } from 'react-native';
import { Container } from '~/components/Container';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { ErrorBoundaryProps, Redirect } from 'expo-router';

// export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
//   return (
//     <View style={{ flex: 1, backgroundColor: 'red' }}>
//       <Text>{error.message}</Text>
//       <Text onPress={retry}>Try Again?</Text>
//     </View>
//   );
// }
export default function Home() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Redirect href={'/login'} />;
  }

  if (currentUser && currentUser.username === null) {
    return <Redirect href={'/setup'} />;
  }
  return <Redirect href={'/(tabs)/home'} />;
  // <>
  //   {/* <Stack.Screen options={{ title: 'Home' }} /> */}
  //   <Container>
  //     <View className="flex-1 gap-5 px-4">
  //       <Text className="text-2xl font-bold">Hello {currentUser?.username}</Text>
  //     </View>
  //   </Container>
  // </>
}
