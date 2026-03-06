import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

// Inner component that handles auth-based redirects at the root level
function RootNavigation() {
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inDashboard = segments[0] === '(dashboard)';
        const inAuth = segments[0] === 'login' || segments[0] === 'signup';

        if (user && profile) {
            // User is logged in — redirect to their dashboard if they're on landing/auth screens
            if (!inDashboard) {
                if (profile.role === 'admin') router.replace('/(dashboard)/admin');
                else if (profile.role === 'company') router.replace('/(dashboard)/company');
                else router.replace('/(dashboard)/freelancer');
            }
        } else if (user && !profile) {
            // User logged in but profile not loaded yet — wait
        } else {
            // Not logged in — redirect away from dashboard
            if (inDashboard) router.replace('/');
        }
    }, [user, profile, isLoading, segments]);

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <Head>
                <title>Middleman App | Native Portal</title>
                <meta name="description" content="Middleman cross-platform technician network." />
            </Head>
            <AuthProvider>
                <RootNavigation />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
