import { Pressable, Text, View } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import { useUserStore } from '~/store/store';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '~/providers/theme-provider';
const SeriePage = () => {
  const { serie_slug, name } = useLocalSearchParams();
  const { addPlan, studiedPlans } = useUserStore();

  const { colorScheme } = useTheme();

  const [isFinished, setIsFinished] = useState(false);

  const { data, isFetched, isLoadingError, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: fetchHtmlContent,
  });

  async function fetchHtmlContent() {
    try {
      const response = await fetch(`https://bibletalk.tv/${serie_slug}.body.html`);
      if (!response.ok) {
        throw new Error('Failed to fetch the HTML content');
      }
      let text = await response.text();

      const wrappedHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="A seven-lesson course introducing the fundamentals of Christianity, covering belief in God, the Bible, Jesus Christ, salvation, and Christian living.">
            <style>
            body {
              font-family: 'Roboto', sans-serif;
              font-size: 18px;
            }
            </style>
            <title>Serie Page</title>
          </head>
          <body>
            ${text}
          </body>
          </html>
        `;

      // setHtmlContent(wrappedHtml);
      return wrappedHtml;
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Container>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => {
              router.back();
            }}>
            <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </Pressable>
          <Text className="text-foreground flex-1 text-3xl font-bold">{name}</Text>
        </View>
      </View>
      {/* <RenderHTML contentWidth={width} source={{ html: `${htmlContent}` }} /> */}
      <WebView
        originWhitelist={['*']}
        style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#121212' : '#FAF9F6' }}
        source={{ html: `${data}` }}
        injectedJavaScript={`

          document.body.style.color = '${colorScheme === 'dark' ? '#FFFFFF' : '#000000'}';
    document.addEventListener('scroll', () => {
      const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight) {
        window.ReactNativeWebView.postMessage("reachedEnd");
      }
    });
  `}
        onMessage={(event) => {
          if (event.nativeEvent.data === 'reachedEnd') {
            setIsFinished(true);
            // Trigger any desired action when the user reaches the end
          }
        }}
      />

      <Pressable
        disabled={!isFinished}
        onPress={() => {
          addPlan(serie_slug as string);
          router.back();
        }}
        className={
          isFinished
            ? 'bg-primary w-full items-center justify-center self-center p-4'
            : 'w-full items-center justify-center self-center bg-gray-200 p-4'
        }>
        <Text
          className={isFinished ? 'text-lg font-semibold' : 'text-lg font-semibold text-gray-400'}>
          Finish
        </Text>
      </Pressable>
    </Container>
  );
};

export default SeriePage;
