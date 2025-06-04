import AsyncStorage from '@react-native-async-storage/async-storage';
import PocketBase, { AsyncAuthStore } from 'pocketbase';
import eventsource from 'react-native-sse';

// @ts-ignore
global.EventSource = eventsource;

let pb: PocketBase | null = null;

const initializePocketbase = async () => {
  if (pb) return pb;
  const store = new AsyncAuthStore({
    save: async (serialized) =>
      AsyncStorage.setItem('pb_auth_appname', serialized),
    initial: (await AsyncStorage.getItem('pb_auth_appname')) ?? undefined,
    clear: async () => AsyncStorage.removeItem('pb_auth_appname'),
  });
  pb = new PocketBase(process.env.EXPO_PUBLIC_POCKETBASE_URL, store);
  // pb.autoCancellation(false);
  return pb;
};

export default initializePocketbase;
