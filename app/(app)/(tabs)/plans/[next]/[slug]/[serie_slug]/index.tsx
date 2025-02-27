import { Button, Pressable, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { WebView } from 'react-native-webview';
import { AntDesign } from '@expo/vector-icons';
import { useUserStore } from '~/store/store';
import { useEvent } from 'expo';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '~/providers/theme-provider';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Video, ResizeMode } from 'expo-av';
const SeriePage = () => {
  const { serie_slug, name } = useLocalSearchParams();
  const { addPlan, studiedPlans } = useUserStore();
  const { colorScheme } = useTheme();

  const [isFinished, setIsFinished] = useState(false);
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const { data } = useQuery({
    queryKey: ['content'],
    queryFn: fetchHtmlContent,
  });

  async function fetchHtmlContent() {
    try {
      const videoJSON = await fetch(`https://bibletalk.tv/${serie_slug}.json`);

      const video = await videoJSON.json();

      const response = await fetch(`https://bibletalk.tv/${serie_slug}.body.html`);
      if (!response.ok) {
        throw new Error('Failed to fetch the HTML content');
      }
      let text = await response.text();
      const match = video.youtube?.embed.match(/src=['"]([^'"]+)['"]/);

      const srcValue = match ? match[1] : null;

      const videoEmbedHtml = srcValue
        ? `<iframe width="100%" style="border-radius:10px;" height="315" src="${srcValue}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><br/>`
        : `<div style="width: 100%; height: 315px; display: flex; align-items: center; justify-content: center; background-color: #ddd; color: #555; font-size: 18px; font-family: Arial, sans-serif; border-radius: 15px;">
        Loading Video...
        </div><br/>`;

      const wrappedHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="description" content="A seven-lesson course introducing the fundamentals of Christianity, covering belief in God, the Bible, Jesus Christ, salvation, and Christian living.">
            <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;700&display=swap" rel="stylesheet">
            <style>
            body {
              font-family: 'Nunito', sans-serif;
              font-size: 18px;
            }
            </style>
            <title>Serie Page</title>
          </head>
          <body>
            ${videoEmbedHtml}
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

  // if (!videoData) return;

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
          <Text className="flex-1 font-nunito-bold text-3xl text-foreground sm:text-4xl">
            {name}
          </Text>
        </View>
      </View>
      <WebView
        originWhitelist={['*']}
        style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#121212' : '#FAF9F6' }}
        source={{ html: `${data}` }}
        showsVerticalScrollIndicator={false}
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
            ? ' mt-5 w-full items-center justify-center self-center bg-primary p-4'
            : ' mt-5 w-full items-center justify-center self-center bg-card p-4'
        }>
        <Text
          className={
            isFinished
              ? 'font-nunito-semibold text-lg sm:text-xl'
              : 'font-nunito-semibold text-lg text-gray-400 sm:text-xl'
          }>
          Finish
        </Text>
      </Pressable>
    </Container>
  );
};

export default SeriePage;
