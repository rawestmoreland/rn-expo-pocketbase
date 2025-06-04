import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/contexts/pocketbaseAuthContext';

export default function CreateAccountScreen() {
  const { signUp } = useAuth();

  const schema = z
    .object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginHorizontal: 16, gap: 16 }}>
        <Controller
          control={form.control}
          name='email'
          render={({ field }) => (
            <View style={{ gap: 4 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 8,
                  padding: 12,
                }}
                autoCapitalize='none'
                autoComplete='email'
                keyboardType='email-address'
                placeholder='Email'
                value={field.value}
                onChangeText={field.onChange}
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
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 8,
                  padding: 12,
                }}
                autoCapitalize='none'
                autoComplete='password'
                secureTextEntry
                placeholder='Password'
                value={field.value}
                onChangeText={field.onChange}
              />
              {form.formState.errors.password?.message && (
                <Text style={{ color: 'red' }}>
                  {form.formState.errors.password.message}
                </Text>
              )}
            </View>
          )}
        />
        <Controller
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <View style={{ gap: 4 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 8,
                  padding: 12,
                }}
                autoCapitalize='none'
                autoComplete='password'
                secureTextEntry
                placeholder='Confirm Password'
                value={field.value}
                onChangeText={field.onChange}
              />
              {form.formState.errors.confirmPassword?.message && (
                <Text style={{ color: 'red' }}>
                  {form.formState.errors.confirmPassword.message}
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
          <Text style={{ color: 'white', fontWeight: 700 }}>
            Create Account
          </Text>
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
