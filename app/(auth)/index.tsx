import { Link } from 'expo-router';
import * as React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/contexts/pocketbaseAuthContext';

const LOGO_SOURCE = {
  uri: 'https://nativewindui.com/_next/image?url=/_next/static/media/logo.28276aeb.png&w=2048&q=75',
};

export default function AuthIndexScreen() {
  const { isLoadingUserData, isLoggedIn } = useAuth();

  if (isLoadingUserData || isLoggedIn) {
    return null;
  }

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <View style={{ gap: 16 }}>
          <View>
            <Image source={LOGO_SOURCE} resizeMode='contain' />
          </View>
          <Link href='/(auth)/(create-account)' asChild>
            <Pressable
              style={{
                backgroundColor: 'black',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 700 }}>
                Sign up free
              </Text>
            </Pressable>
          </Link>
          {/* <Button
            variant='secondary'
            className='ios:border-foreground/60'
            size={Platform.select({ ios: 'lg', default: 'md' })}
            onPress={() => {
              alertRef.current?.alert({
                title: 'Suggestion',
                message: 'Use @react-native-google-signin/google-signin',
                buttons: [{ text: 'OK', style: 'cancel' }],
              });
            }}
          >
            <Image
              source={GOOGLE_SOURCE}
              className='absolute left-4 h-4 w-4'
              resizeMode='contain'
            />
            <Text className='ios:text-foreground'>Continue with Google</Text>
          </Button>
          {Platform.OS === 'ios' && (
            <Button
              variant='secondary'
              className='ios:border-foreground/60'
              size={Platform.select({ ios: 'lg', default: 'md' })}
              onPress={() => {
                alertRef.current?.alert({
                  title: 'Suggestion',
                  message: 'Use expo-apple-authentication',
                  buttons: [{ text: 'OK', style: 'cancel' }],
                });
              }}
            >
              <Text className='ios:text-foreground absolute left-4 text-[22px]'>
                
              </Text>
              <Text className='ios:text-foreground'>Continue with Apple</Text>
            </Button>
          )} */}
          <Link href='/(auth)/(login)' asChild>
            <Pressable
              style={{
                backgroundColor: 'black',
                alignItems: 'center',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 700 }}>Log in</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
