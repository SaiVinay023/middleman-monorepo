import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'expo-router';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name is required').max(100),
    email: z.string().email('Invalid email address').toLowerCase(),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number (e.g. +12025551234)'),
    password: z.string()
        .min(12, 'Password must be at least 12 characters')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    role: z.enum(['company', 'freelancer']),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupScreen() {
    const { loading, error, signUp } = useAuth();
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { fullName: '', email: '', phone: '', password: '', role: 'freelancer' },
    });

    const role = watch('role');

    const onSubmit = async (data: SignupFormData) => {
        try {
            const result = await signUp(data.email, data.password, data.fullName, data.phone, data.role);
            // If email confirmation is required, Supabase returns a user but no session
            if (result?.user && !result?.session) {
                setSuccessMsg('Account created! Please check your email to confirm your account.');
                reset();
            }
            // If email confirmation is off, onAuthStateChange fires and
            // RootNavigation in _layout.tsx handles the redirect automatically
        } catch {
            // Error shown via the `error` state from useAuth
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50">
            <View className="flex-1 justify-center p-8">
                <View className="max-w-md w-full mx-auto p-8 bg-white rounded-3xl shadow-xl gap-y-4">
                    <Text className="text-3xl font-extrabold text-gray-900 mb-1">Create Account</Text>
                    <Text className="text-gray-500 mb-4">Join the Middleman ecosystem</Text>

                    {successMsg ? (
                        <View className="bg-green-50 border border-green-200 p-6 rounded-2xl items-center gap-y-4">
                            <Text className="text-green-700 text-base font-semibold text-center">{successMsg}</Text>
                            <Link href="/login" asChild>
                                <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-xl">
                                    <Text className="text-white font-bold">Go to Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    ) : (
                        <View className="gap-y-3">
                            {/* Segmented Control for Role */}
                            <View className="flex-row bg-gray-100 p-1 rounded-xl mb-3">
                                <Pressable
                                    onPress={() => setValue('role', 'freelancer')}
                                    className={`flex-1 py-3 rounded-lg items-center justify-center transition-all ${role === 'freelancer' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Text className={`font-bold text-sm ${role === 'freelancer' ? 'text-gray-900' : 'text-gray-500'}`}>
                                        I want to work
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setValue('role', 'company')}
                                    className={`flex-1 py-3 rounded-lg items-center justify-center transition-all ${role === 'company' ? 'bg-white shadow-sm' : ''}`}
                                >
                                    <Text className={`font-bold text-sm ${role === 'company' ? 'text-gray-900' : 'text-gray-500'}`}>
                                        I want to hire
                                    </Text>
                                </Pressable>
                            </View>
                            <Controller
                                control={control}
                                name="fullName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <Text className="text-sm font-semibold text-gray-700 mb-1">Full Name</Text>
                                        <TextInput
                                            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-base"
                                            placeholder="Jane Smith"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            autoComplete="name"
                                        />
                                        {errors.fullName && (
                                            <Text className="text-red-500 text-xs mt-1">{errors.fullName.message}</Text>
                                        )}
                                    </View>
                                )}
                            />

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
                                name="phone"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <Text className="text-sm font-semibold text-gray-700 mb-1">Phone Number</Text>
                                        <TextInput
                                            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-base"
                                            placeholder="+12025551234"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            keyboardType="phone-pad"
                                            autoComplete="tel"
                                        />
                                        {errors.phone && (
                                            <Text className="text-red-500 text-xs mt-1">{errors.phone.message}</Text>
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
                                            placeholder="••••••••••••"
                                            secureTextEntry
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            autoComplete="new-password"
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
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-bold">Sign in</Link>
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
