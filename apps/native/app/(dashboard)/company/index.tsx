import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { Plus, CreditCard, Eye, MapPinned } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useCompanyGigs } from '../../../hooks/useCompanyGigs';
import { CreateGigScreen } from '../../../components/CreateGigScreen';
import { Gig } from '../../../../web/src/types';
import NativeMapViewer from '../../../components/maps/NativeMapViewer';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

type KanbanCardProps = {
    gig: Gig;
    isPaying: boolean;
    expandedMapGigId: string | null;
    onToggleMap: (gigId: string) => void;
    onPayForGig: (gigId: string) => Promise<void>;
};

const KanbanCard = memo(function KanbanCard({
    gig,
    isPaying,
    expandedMapGigId,
    onToggleMap,
    onPayForGig,
}: KanbanCardProps) {
    const isTrackable = gig.status === 'in_progress' || gig.status === 'assigned';
    const isMapOpen = expandedMapGigId === gig.id;

    return (
        <View className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-4">
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-2">
                    <Text className="font-bold text-gray-900 text-lg leading-tight">{gig.title}</Text>
                    <Text className="text-xs text-blue-600 font-bold mt-1 uppercase tracking-widest">{gig.category}</Text>
                </View>
                <View
                    className={`px-2 py-1 rounded-md ${gig.status === 'pending_admin'
                        ? 'bg-gray-100'
                        : gig.status === 'awaiting_payment'
                            ? 'bg-rose-100'
                            : gig.status === 'available'
                                ? 'bg-blue-100'
                                : gig.status === 'assigned' || gig.status === 'in_progress'
                                    ? 'bg-indigo-100'
                                    : gig.status === 'pending_review'
                                        ? 'bg-amber-100'
                                        : 'bg-emerald-100'
                        }`}
                >
                    <Text
                        className={`text-[10px] font-black uppercase tracking-wider ${gig.status === 'pending_admin'
                            ? 'text-gray-600'
                            : gig.status === 'awaiting_payment'
                                ? 'text-rose-700'
                                : gig.status === 'available'
                                    ? 'text-blue-700'
                                    : gig.status === 'assigned' || gig.status === 'in_progress'
                                        ? 'text-indigo-700'
                                        : gig.status === 'pending_review'
                                            ? 'text-amber-700'
                                            : 'text-emerald-700'
                            }`}
                    >
                        {gig.status.replace('_', ' ')}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between items-center mt-2 border-t border-gray-100 pt-3">
                <Text className="text-sm font-bold text-gray-600">${gig.pay_amount}</Text>
                <Text className="text-xs text-gray-400 font-medium">
                    {new Date(gig.scheduled_at || gig.created_at).toLocaleDateString()}
                </Text>
            </View>

            {isTrackable && (
                <View className="mt-3">
                    <TouchableOpacity
                        onPress={() => onToggleMap(gig.id)}
                        className="w-full bg-indigo-50 border border-indigo-200 py-3 rounded-xl flex-row justify-center items-center gap-2 active:scale-95"
                    >
                        <MapPinned size={16} color="#4338ca" />
                        <Text className="text-indigo-700 font-bold text-sm">
                            {isMapOpen ? 'Hide Live Tracking' : 'Show Live Tracking'}
                        </Text>
                    </TouchableOpacity>

                    {isMapOpen && (
                        <View className="mt-3 w-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden pb-1">
                            <NativeMapViewer latitude={37.7749} longitude={-122.4194} gigId={gig.id} />
                            <Text className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-2 px-2">
                                Live Technician Tracking
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {gig.status === 'awaiting_payment' && (
                <TouchableOpacity
                    onPress={() => onPayForGig(gig.id)}
                    disabled={isPaying}
                    className={`mt-4 w-full bg-gray-900 py-3 rounded-xl flex-row justify-center items-center gap-2 ${isPaying ? 'opacity-50' : 'active:scale-95'
                        }`}
                >
                    <CreditCard size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-sm">Pay Escrow</Text>
                </TouchableOpacity>
            )}

            {gig.status === 'completed' && gig.completion_photo_url && (
                <TouchableOpacity className="mt-4 w-full bg-blue-50 border border-blue-200 py-3 rounded-xl flex-row justify-center items-center gap-2 active:scale-95">
                    <Eye size={16} color="#1d4ed8" />
                    <Text className="text-blue-700 font-bold text-sm">Review Proof</Text>
                </TouchableOpacity>
            )}
        </View>
    );
});

export default function CompanyDashboard() {
    const { user, signOut } = useAuth();
    const { companyGigs, isLoading, createGig, payForGig, isPaying } = useCompanyGigs(user?.id || '');
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [expandedMapGigId, setExpandedMapGigId] = useState<string | null>(null);

    const handleCreateGig = useCallback(
        async (data: any) => {
            await createGig({ ...data, company_id: user?.id as string });
            setCreateModalVisible(false);
        },
        [createGig, user?.id]
    );

    const handleToggleMap = useCallback((gigId: string) => {
        setExpandedMapGigId((prev) => (prev === gigId ? null : gigId));
    }, []);

    const sections = useMemo(() => {
        const pipeline = companyGigs.filter((g) => g.status === 'pending_admin' || g.status === 'awaiting_payment');
        const active = companyGigs.filter(
            (g) => g.status === 'available' || g.status === 'assigned' || g.status === 'in_progress'
        );
        const review = companyGigs.filter((g) => g.status === 'pending_review' || g.status === 'completed');

        return [
            { key: 'pipeline', title: 'Pre-Market Pipeline', data: pipeline },
            { key: 'active', title: 'Active Jobs', data: active },
            { key: 'review', title: 'Review & Completed', data: review },
        ];
    }, [companyGigs]);

    const gigsInMarket = useMemo(
        () => companyGigs.filter((g) => g.status === 'available').length,
        [companyGigs]
    );
    const awaitingReview = useMemo(
        () => companyGigs.filter((g) => g.status === 'pending_review').length,
        [companyGigs]
    );

    const renderSection = useCallback(
        ({ item }: { item: (typeof sections)[number] }) => (
            <View style={{ width: CARD_WIDTH, marginHorizontal: 12 }}>
                <View className="flex-row justify-between items-center mb-4 px-1">
                    <Text className="text-lg font-black text-gray-900">{item.title}</Text>
                    <View className="bg-gray-200 px-2 py-0.5 rounded-full">
                        <Text className="text-xs font-bold text-gray-700">{item.data.length}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {item.data.length === 0 ? (
                        <View className="border-2 border-dashed border-gray-200 rounded-2xl h-32 items-center justify-center">
                            <Text className="text-sm font-bold text-gray-400">Empty List</Text>
                        </View>
                    ) : (
                        item.data.map((gig) => (
                            <KanbanCard
                                key={gig.id}
                                gig={gig}
                                isPaying={isPaying}
                                expandedMapGigId={expandedMapGigId}
                                onToggleMap={handleToggleMap}
                                onPayForGig={payForGig}
                            />
                        ))
                    )}
                </ScrollView>
            </View>
        ),
        [sections, isPaying, expandedMapGigId, handleToggleMap, payForGig]
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-gray-900 pt-16 pb-6 px-6 rounded-b-[2rem] z-10 shadow-sm">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-400 text-xs uppercase tracking-widest font-bold">Company</Text>
                        <Text className="text-white text-3xl font-black tracking-tight mt-1">Dashboard</Text>
                    </View>
                    <TouchableOpacity onPress={signOut} className="bg-white/10 px-4 py-2 rounded-xl active:scale-95">
                        <Text className="text-gray-300 text-xs font-bold">Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row gap-3 mt-8">
                    <View className="flex-1 bg-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
                        <Text className="text-3xl font-black text-blue-400">{gigsInMarket}</Text>
                        <Text className="text-blue-200/70 text-xs font-bold uppercase tracking-widest mt-1">In Market</Text>
                    </View>
                    <View className="flex-1 bg-amber-500/20 rounded-2xl p-4 border border-amber-500/30">
                        <Text className="text-3xl font-black text-amber-400">{awaitingReview}</Text>
                        <Text className="text-amber-200/70 text-xs font-bold uppercase tracking-widest mt-1">To Review</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => setCreateModalVisible(true)}
                    className="mt-6 bg-blue-600 py-4 rounded-xl flex-row justify-center items-center gap-2 active:scale-95 shadow-md shadow-blue-900/50"
                >
                    <Plus size={20} color="#fff" />
                    <Text className="text-white font-black text-base">Post New Gig</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 pt-6">
                {isLoading && companyGigs.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : (
                    <FlatList
                        horizontal
                        data={sections}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH + 24}
                        decelerationRate="fast"
                        contentContainerStyle={{ paddingHorizontal: 12 }}
                        keyExtractor={(item) => item.key}
                        renderItem={renderSection}
                    />
                )}
            </View>

            <CreateGigScreen
                visible={isCreateModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateGig}
                isLoading={false}
            />
        </View>
    );
}
