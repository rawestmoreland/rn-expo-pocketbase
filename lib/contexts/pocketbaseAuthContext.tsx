import {
  router,
  useNavigationContainerRef,
  useRouter,
  useSegments,
} from 'expo-router';
import type PocketBase from 'pocketbase';
import { createContext, useContext, useEffect, useState } from 'react';

import { usePocketBase } from '@/lib/contexts/pocketbaseContext';
import { View } from 'react-native';

export type AuthContextProps = {
  user: Record<string, any> | null;
  isLoggedIn: boolean;
  isLoadingUserData: boolean;
  resetPassword: (pb: PocketBase, email: string) => Promise<void>;
  signIn: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => Promise<void>;
  signUp: ({
    email,
    password,
    passwordConfirm,
  }: {
    email: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

type AuthContextProviderProps = {
  children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoggedIn: false,
  isLoadingUserData: true,
  resetPassword: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});

function useProtectedRoute(isLoggedIn: boolean, isLoadingUserData: boolean) {
  const router = useRouter();
  const segments = useSegments();

  // Check that navigation is all good
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const rootNavRef = useNavigationContainerRef();

  // Set ups a listener to check and see if the navigator is ready.
  useEffect(() => {
    const unsubscribe = rootNavRef?.addListener('state', (event) => {
      setIsNavigationReady(true);
    });
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [rootNavRef.current]);

  useEffect(() => {
    // Navigation isn't set up or we're still loading. Do nothing.
    if (!isNavigationReady || isLoadingUserData) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !isLoggedIn &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.
      router.replace('/(auth)');
    } else if (isLoggedIn && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(protected)');
    }
  }, [isLoggedIn, segments, isNavigationReady, isLoadingUserData]);
}

const transformUser = (
  user: Record<string, any> | null
): Record<string, any> | null => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
};

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const { pb, isLoading: isPocketBaseLoading } = usePocketBase();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isPocketBaseLoading) {
        return; // Wait for PocketBase to initialize
      }

      if (!pb) {
        console.error('PocketBase instance not initialized');
        setIsLoadingUserData(false);
        return;
      }

      try {
        setIsLoadingUserData(true);
        const isLoggedIn = pb.authStore.isValid;
        setIsLoggedIn(isLoggedIn);

        if (isLoggedIn && pb.authStore.record) {
          setUser({
            id: pb.authStore.record.id,
            email: pb.authStore.record.email,
            displayName: pb.authStore.record.name,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    checkAuthStatus();
  }, [pb, isPocketBaseLoading]);

  const handleSignOut = async () => {
    if (!pb) {
      throw new Error('PocketBase not initialized');
    }

    pb.authStore.clear();
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleSignIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    if (isPocketBaseLoading) {
      throw new Error('PocketBase is still initializing');
    }

    if (!pb) {
      throw new Error('PocketBase not initialized');
    }

    try {
      const user = await pb
        .collection('users')
        .authWithPassword(email, password);
      setUser(transformUser(user));

      setIsLoggedIn(true);
      router.replace('/(protected)');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const handleSignUp = async ({
    email,
    password,
    passwordConfirm,
  }: {
    email: string;
    password: string;
    passwordConfirm: string;
  }) => {
    if (isPocketBaseLoading) {
      throw new Error('PocketBase is still initializing');
    }

    if (!pb) {
      throw new Error('PocketBase not initialized');
    }

    try {
      const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm,
      });

      setUser({ id: user.user_uid, email: user.email });
      setIsLoggedIn(true);
      router.replace('/(protected)');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const handleResetPassword = async (pb: PocketBase, email: string) => {
    if (isPocketBaseLoading) {
      throw new Error('PocketBase is still initializing');
    }

    try {
      await pb.collection('users').requestPasswordReset(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  useProtectedRoute(isLoggedIn, isLoadingUserData);

  // Show loading screen while PocketBase is initializing or checking auth status
  if (isPocketBaseLoading || isLoadingUserData) {
    return <View></View>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingUserData,
        isLoggedIn,
        resetPassword: handleResetPassword,
        signIn: handleSignIn,
        signOut: handleSignOut,
        signUp: handleSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};
