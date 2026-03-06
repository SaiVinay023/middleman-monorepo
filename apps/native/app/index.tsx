import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

// Landing page — authentication redirects are handled by
// RootNavigation inside _layout.tsx (via onAuthStateChange)
// so this page never needs to await auth state.
export default function Home() {
    return (
        <View className="flex-1 items-center justify-center p-6 bg-white">
            <View className="items-center max-w-md w-full gap-y-6">
                <Text className="text-5xl font-extrabold text-gray-900 tracking-tight text-center">
                    Middleman
                </Text>
                <Text className="text-xl text-gray-600 text-center">
                    The premium ecosystem for technicians and companies.
                </Text>

                <View className="flex flex-col gap-4 w-full pt-4">
                    <Link href="/login" asChild>
                        <TouchableOpacity className="w-full px-6 py-4 bg-blue-600 rounded-2xl items-center">
                            <Text className="text-white font-bold text-lg">Sign In</Text>
                        </TouchableOpacity>
                    </Link>

                    <Link href="/signup" asChild>
                        <TouchableOpacity className="w-full px-6 py-4 bg-white border-2 border-blue-600 rounded-2xl items-center">
                            <Text className="text-blue-600 font-bold text-lg">Signup</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <Text className="text-sm text-gray-400 pt-8 text-center">
                    Expo SDK 53 | NativeWind v4
                </Text>
            </View>
        </View>
    );
}
