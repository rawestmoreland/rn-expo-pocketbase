import { useAuth } from '@/lib/contexts/pocketbaseAuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { z } from 'zod';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await signIn({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ gap: 16, marginHorizontal: 16 }}>
        <Controller
          control={form.control}
          name='email'
          render={({ field }) => (
            <View style={{ gap: 4 }}>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder='Email'
                autoCapitalize='none'
                autoComplete='email'
                keyboardType='email-address'
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 8,
                  padding: 12,
                }}
              />
              {form.formState.errors.email?.message && (
                <Text style={{ color: 'red' }}>
                  {form.formState.errors.email.message}
                </Text>
              )}
            </View>
          )}
        />
        <Controller
          control={form.control}
          name='password'
          render={({ field }) => (
            <View style={{ gap: 4 }}>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder='Password'
                autoCapitalize='none'
                autoComplete='password'
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 8,
                  padding: 12,
                }}
              />
              {form.formState.errors.password?.message && (
                <Text style={{ color: 'red' }}>
                  {form.formState.errors.password.message}
                </Text>
              )}
            </View>
          )}
        />
        <Pressable
          onPress={form.handleSubmit(onSubmit)}
          style={{
            backgroundColor: 'black',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 700 }}>Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
