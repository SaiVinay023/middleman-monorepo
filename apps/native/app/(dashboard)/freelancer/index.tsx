import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Briefcase, Search, Camera, TrendingUp } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useGigs } from '../../../hooks/useGigs';

export default function FreelancerHome() {
    const router = useRouter();
    const { user, profile, signOut } = useAuth();
    const { availableGigs, myGigs, totalEarnings } = useGigs(user?.id);

    const weeklyGoal = 1000;
    const progress = Math.min((totalEarnings / weeklyGoal) * 100, 100);
    const progressDisplay = Number.isFinite(progress) ? Math.round(progress) : 0;

    const recentGigs = [...myGigs].slice(0, 3);

    const statusColor: Record<string, string> = {
        assigned: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-amber-100 text-amber-700',
        pending_review: 'bg-purple-100 text-purple-700',
        completed: 'bg-emerald-100 text-emerald-700',
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            {/* Hero Header Card */}
            <View className="bg-gray-900 px-6 pt-14 pb-10 rounded-b-[3rem]">
                <View className="flex-row justify-between items-start mb-6">
                    <View>
                        <Text className="text-gray-400 text-sm font-semibold uppercase tracking-widest">
                            System Status
                        </Text>
                        <Text className="text-white text-3xl font-black tracking-tight mt-0.5">
                            {profile?.full_name?.split(' ')[0] || 'Technician'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={signOut}
                        className="bg-white/10 px-4 py-2 rounded-xl"
                    >
                        <Text className="text-gray-300 text-xs font-bold">Sign Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Weekly Goal Card */}
                <View className="bg-white/10 p-5 rounded-3xl border border-white/10">
                    <View className="flex-row justify-between items-end mb-3">
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                                Weekly Goal
                            </Text>
                            <Text className="text-white text-3xl font-black">
                                ${totalEarnings}{' '}
                                <Text className="text-lg text-gray-500 font-normal">/ ${weeklyGoal}</Text>
                            </Text>
                        </View>
                        <Text className="text-emerald-400 font-bold text-lg">{progressDisplay}%</Text>
                    </View>
                    <View className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${progressDisplay}%` }}
                        />
                    </View>
                </View>
            </View>

            <View className="px-6 pt-8 pb-32 gap-y-8">
                {/* Performance Pulse — Stat Cards */}
                <View>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                        Performance Pulse
                    </Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/freelancer/gigs')}
                            className="flex-1 aspect-square bg-blue-50 rounded-[2.5rem] p-5 justify-between border border-blue-100 active:scale-95"
                        >
                            <View className="bg-blue-600 w-10 h-10 rounded-2xl items-center justify-center">
                                <Search size={20} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-3xl font-black text-blue-900">{availableGigs.length}</Text>
                                <Text className="text-xs font-bold text-blue-700 uppercase">Available</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/freelancer/my-work')}
                            className="flex-1 aspect-square bg-emerald-50 rounded-[2.5rem] p-5 justify-between border border-emerald-100 active:scale-95"
                        >
                            <View className="bg-emerald-600 w-10 h-10 rounded-2xl items-center justify-center">
                                <Briefcase size={20} color="#fff" />
                            </View>
                            <View>
                                <Text className="text-3xl font-black text-emerald-900">{myGigs.length}</Text>
                                <Text className="text-xs font-bold text-emerald-700 uppercase">Active</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Activity */}
                <View>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                        Recent Activity
                    </Text>
                    {recentGigs.length === 0 ? (
                        <View className="bg-white rounded-3xl p-8 items-center border border-gray-100">
                            <TrendingUp size={32} color="#d1d5db" />
                            <Text className="text-gray-400 font-bold mt-3 text-center">
                                No recent gigs yet.{'\n'}Head to the marketplace to get started.
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-y-3">
                            {recentGigs.map((gig: any) => (
                                <View key={gig.id} className="bg-white rounded-2xl p-4 flex-row items-center justify-between border border-gray-100">
                                    <View className="flex-1 mr-3">
                                        <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{gig.title}</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">${gig.pay_amount} · {gig.location}</Text>
                                    </View>
                                    <View className={`px-3 py-1.5 rounded-xl ${(statusColor[gig.status] || 'bg-gray-100 text-gray-600').split(' ')[0]}`}>
                                        <Text className={`text-xs font-bold capitalize ${(statusColor[gig.status] || 'bg-gray-100 text-gray-600').split(' ')[1]}`}>
                                            {gig.status?.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Identity Verification CTA */}
                <View className="bg-amber-50 p-5 rounded-3xl border border-amber-100 flex-row items-center gap-4">
                    <View className="bg-amber-500 w-14 h-14 rounded-2xl items-center justify-center">
                        <Camera size={26} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-amber-900 text-base">Identity Verification</Text>
                        <Text className="text-xs text-amber-700 mt-0.5">
                            Keep your documents up to date to access high-pay gigs.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(dashboard)/freelancer/profile')}
                            className="bg-white mt-3 px-4 py-2 rounded-xl w-28"
                        >
                            <Text className="text-amber-900 text-xs font-black uppercase tracking-widest">Verify Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
