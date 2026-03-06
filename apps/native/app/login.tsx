import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'expo-router';

const loginSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const { loading, error, signIn } = useAuth();

    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await signIn(data.email, data.password);
            // No manual redirect needed — RootNavigation in _layout.tsx
            // listens to onAuthStateChange and redirects automatically
        } catch {
            // Error shown via the `error` state from useAuth
        }
    };

    return (
        <View className="flex-1 justify-center p-8 bg-gray-50">
            <View className="max-w-md w-full mx-auto p-8 bg-white rounded-3xl shadow-xl gap-y-4">
                <Text className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back</Text>
                <Text className="text-gray-500 mb-4">Sign in to your Middleman account</Text>

                <View className="gap-y-3">
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-1">Email</Text>
                                <TextInput
                                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-base"
                                    placeholder="you@example.com"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-1">Password</Text>
                                <TextInput
                                    className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-base"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
                                )}
                            </View>
                        )}
                    />

                    {error && (
                        <View className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <Text className="text-red-600 text-sm font-semibold">{error}</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        disabled={loading}
                        onPress={handleSubmit(onSubmit)}
                        className="w-full bg-blue-600 p-4 rounded-2xl items-center mt-2 flex-row justify-center gap-x-2"
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading && <ActivityIndicator color="#fff" size="small" />}
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text className="mt-4 text-center text-sm text-gray-600">
                    No account?{' '}
                    <Link href="/signup" className="text-blue-600 font-bold">Create one</Link>
                </Text>
            </View>
        </View>
    );
}
