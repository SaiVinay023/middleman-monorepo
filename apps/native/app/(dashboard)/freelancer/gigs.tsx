import { memo, useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    FlatList,
    ListRenderItem,
} from 'react-native';
import { MapPin, Clock, Zap, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useGigs } from '../../../hooks/useGigs';

type Gig = {
    id: string;
    title: string;
    description: string;
    pay_amount: number;
    priority: string;
    location?: string;
    duration?: string;
    category?: string;
};

type GigCardProps = {
    gig: Gig;
    onAccept: (gigId: string) => void;
    isClaiming: boolean;
};

const GigCard = memo(function GigCard({ gig, onAccept, isClaiming }: GigCardProps) {
    const isHot = gig.pay_amount >= 300 || gig.priority === 'urgent';

    return (
        <View className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm overflow-hidden mb-4">
            <View className="absolute top-5 right-5 bg-emerald-500 px-4 py-2 rounded-2xl">
                <Text className="text-white font-black text-lg">${gig.pay_amount}</Text>
            </View>

            <View className="pr-24">
                {isHot && (
                    <View className="flex-row items-center gap-1 mb-2">
                        <Zap size={13} color="#d97706" fill="#d97706" />
                        <Text className="text-amber-600 text-[10px] font-black uppercase tracking-widest">High Value</Text>
                    </View>
                )}
                <Text className="text-gray-900 text-xl font-black leading-tight mb-1">{gig.title}</Text>
                <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>
                    {gig.description}
                </Text>

                <View className="flex-row flex-wrap gap-2 mb-5">
                    <View className="flex-row items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <MapPin size={13} color="#9ca3af" />
                        <Text className="text-gray-600 text-xs font-bold">{gig.location || '2.4 mi'}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                        <Clock size={13} color="#9ca3af" />
                        <Text className="text-gray-600 text-xs font-bold">{gig.duration || '2-3h'}</Text>
                    </View>
                    <View className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        <ShieldCheck size={13} color="#3b82f6" />
                        <Text className="text-blue-700 text-xs font-bold">{gig.category || 'IT Support'}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => onAccept(gig.id)}
                disabled={isClaiming}
                className="bg-gray-900 py-4 rounded-2xl flex-row items-center justify-center gap-2"
                style={{ opacity: isClaiming ? 0.6 : 1 }}
            >
                {isClaiming ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        <Text className="text-white font-bold text-base">Accept This Gig</Text>
                        <ChevronRight size={18} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
});

export default function GigsScreen() {
    const { user } = useAuth();
    const { availableGigs, isLoadingAvailable, claimGig, isClaiming, refresh } = useGigs(user?.id, {
        loadAvailable: true,
        loadMine: false,
    });
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refresh();
        } finally {
            setRefreshing(false);
        }
    }, [refresh]);

    const handleAccept = useCallback(
        async (gigId: string) => {
            try {
                await claimGig(gigId);
                Alert.alert('Gig accepted', 'Check My Work tab to manage your new assignment.');
            } catch (err: any) {
                Alert.alert('Already claimed', err?.message || 'This gig was just taken by another technician.');
            }
        },
        [claimGig]
    );

    const renderItem = useCallback<ListRenderItem<Gig>>(
        ({ item }) => <GigCard gig={item} onAccept={handleAccept} isClaiming={isClaiming} />,
        [handleAccept, isClaiming]
    );

    if (isLoadingAvailable) {
        return (
            <View className="flex-1 bg-gray-50 px-6 pt-14 gap-4">
                <View className="h-10 bg-gray-200 rounded-2xl animate-pulse w-48" />
                {[1, 2, 3].map((i) => (
                    <View key={i} className="h-52 bg-gray-100 rounded-[2rem]" />
                ))}
            </View>
        );
    }

    return (
        <FlatList
            className="flex-1 bg-gray-50"
            data={availableGigs}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            initialNumToRender={6}
            windowSize={7}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 128 }}
            ListHeaderComponent={
                <View className="mb-8">
                    <Text className="text-3xl font-black text-gray-900 tracking-tight mb-1">Marketplace</Text>
                    <Text className="text-gray-500 font-medium">Find work near your location</Text>
                </View>
            }
            ListEmptyComponent={
                <View className="bg-white py-20 rounded-[3rem] border-2 border-dashed border-gray-200 items-center">
                    <Text className="text-gray-400 font-bold text-center">No gigs available in your area yet.</Text>
                </View>
            }
        />
    );
}
