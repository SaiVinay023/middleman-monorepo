import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Zap, BarChart3, Users, AlertCircle, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

function StatCard({ label, count, color, icon: Icon, onPress }: any) {
    const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
        blue: { bg: '#eff6ff', iconBg: '#3b82f6', iconColor: '#fff' },
        emerald: { bg: '#ecfdf5', iconBg: '#10b981', iconColor: '#fff' },
        purple: { bg: '#f5f3ff', iconBg: '#8b5cf6', iconColor: '#fff' },
    };
    const colors = colorMap[color] || colorMap.blue;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-1 rounded-[2rem] p-5 items-center border"
            style={{ backgroundColor: colors.bg, borderColor: colors.bg }}
        >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: colors.iconBg }}>
                <Icon size={26} color={colors.iconColor} />
            </View>
            <Text className="text-4xl font-black text-gray-900 mb-1">{count}</Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{label}</Text>
        </TouchableOpacity>
    );
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState({ pendingGigs: 0, pendingReview: 0, pendingDocs: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const [gigsRes, reviewRes, docsRes] = await Promise.all([
                supabase.from('gigs').select('id', { count: 'exact' }).eq('status', 'available'),
                supabase.from('gigs').select('id', { count: 'exact' }).eq('status', 'pending_review'),
                supabase.from('documents').select('id', { count: 'exact' }).eq('status', 'pending'),
            ]);
            setStats({
                pendingGigs: gigsRes.count || 0,
                pendingReview: reviewRes.count || 0,
                pendingDocs: docsRes.count || 0,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const hasAlerts = stats.pendingGigs > 0 || stats.pendingReview > 0;

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View className="bg-gray-900 pt-14 pb-10 px-6 rounded-b-[3rem]">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-400 text-xs uppercase tracking-widest font-bold">Admin</Text>
                        <Text className="text-white text-3xl font-black tracking-tight">Operations Hub</Text>
                        <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">System Oversight</Text>
                    </View>
                    <TouchableOpacity onPress={signOut} className="bg-white/10 px-4 py-2 rounded-xl">
                        <Text className="text-gray-300 text-xs font-bold">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="px-6 pt-8 pb-32 gap-y-6">
                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" />
                ) : (
                    <>
                        {/* Stat Cards Grid */}
                        <View className="flex-row gap-3">
                            <StatCard
                                label="New Gig Requests"
                                count={stats.pendingGigs}
                                color="blue"
                                icon={Zap}
                                onPress={() => { }}
                            />
                            <StatCard
                                label="Work Proofs"
                                count={stats.pendingReview}
                                color="emerald"
                                icon={BarChart3}
                                onPress={() => { }}
                            />
                        </View>
                        <StatCard
                            label="ID Verifications"
                            count={stats.pendingDocs}
                            color="purple"
                            icon={Users}
                            onPress={() => { }}
                        />

                        {/* Critical Alerts */}
                        {hasAlerts ? (
                            <View className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex-row items-center gap-4">
                                <View className="bg-amber-500 p-2.5 rounded-xl">
                                    <AlertCircle size={20} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-amber-900">Attention Required</Text>
                                    <Text className="text-amber-700 text-sm mt-0.5">
                                        Pending items in the pipeline are delaying user payouts.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex-row items-center gap-4">
                                <View className="bg-emerald-500 p-2.5 rounded-xl">
                                    <CheckCircle size={20} color="#fff" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-black text-emerald-900">All Clear</Text>
                                    <Text className="text-emerald-700 text-sm mt-0.5">
                                        No pending items. System is running smoothly.
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Quick Actions */}
                        <View>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                                Quick Actions
                            </Text>
                            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                {[
                                    { label: 'Review Pending Work Proofs', sub: `${stats.pendingReview} items waiting`, color: '#10b981' },
                                    { label: 'Verify Identity Documents', sub: `${stats.pendingDocs} documents to review`, color: '#8b5cf6' },
                                    { label: 'Manage Gig Listings', sub: `${stats.pendingGigs} available gigs`, color: '#3b82f6' },
                                ].map((item, i) => (
                                    <TouchableOpacity key={i} className="px-5 py-4 flex-row items-center justify-between border-b border-gray-50">
                                        <View className="flex-row items-center gap-3">
                                            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <View>
                                                <Text className="text-gray-900 font-bold">{item.label}</Text>
                                                <Text className="text-gray-400 text-xs">{item.sub}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-300 font-bold">›</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </View>
        </ScrollView>
    );
}
