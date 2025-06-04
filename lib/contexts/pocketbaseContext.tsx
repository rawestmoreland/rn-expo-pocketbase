import PocketBase from 'pocketbase';
import React, { createContext, useContext, useState, useEffect } from 'react';
import initializePocketbase from '@/lib/pocketbaseClient';

const PocketBaseContext = createContext<{
  pb: PocketBase | null;
  isLoading: boolean;
  error: string | null;
}>({
  pb: null,
  isLoading: true,
  error: null,
});

export const usePocketBase = () => useContext(PocketBaseContext);

export const PocketBaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pb, setPb] = useState<PocketBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeClient = async () => {
      if (pb) return;
      try {
        console.log('Initializing PocketBase...');
        const pbInstance = await initializePocketbase();

        // Test the connection
        await pbInstance.health.check();
        console.log('PocketBase connection successful');

        setPb(pbInstance);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize PocketBase:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to initialize PocketBase'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, []);

  if (error) {
    console.error('PocketBase initialization error:', error);
  }

  return (
    <PocketBaseContext.Provider value={{ pb, isLoading, error }}>
      {children}
    </PocketBaseContext.Provider>
  );
};
