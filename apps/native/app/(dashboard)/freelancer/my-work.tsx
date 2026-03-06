import { memo, useCallback, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    RefreshControl,
    FlatList,
    ListRenderItem,
} from 'react-native';
import { MapPin, Clock, Phone, MessageSquare, Play, Camera, CheckCircle2, Briefcase } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../contexts/AuthContext';
import { useGigs } from '../../../hooks/useGigs';

const PHASES = [
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'Active' },
    { id: 'pending_review', label: 'Review' },
    { id: 'completed', label: 'Done' },
];

type Gig = {
    id: string;
    title: string;
    status: string;
    location?: string;
    updated_at: string;
    pay_amount: number;
    client_phone?: string | null;
};

const StatusStepper = memo(function StatusStepper({ currentStatus }: { currentStatus: string }) {
    const currentIndex = PHASES.findIndex((p) => p.id === currentStatus);
    return (
        <View className="flex-row justify-between mb-5 px-1">
            {PHASES.map((phase, index) => (
                <View key={phase.id} className="items-center gap-1">
                    <View className={`w-14 h-1.5 rounded-full ${index <= currentIndex ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    <Text
                        className={`text-[9px] font-black uppercase tracking-tighter ${index <= currentIndex ? 'text-emerald-600' : 'text-gray-400'
                            }`}
                    >
                        {phase.label}
                    </Text>
                </View>
            ))}
        </View>
    );
});

type WorkCardProps = {
    gig: Gig;
    isUpdatingStatus: boolean;
    isCompleting: boolean;
    onStartWork: (gigId: string) => void;
    onFinishWork: (gigId: string) => void;
};

const WorkCard = memo(function WorkCard({
    gig,
    isUpdatingStatus,
    isCompleting,
    onStartWork,
    onFinishWork,
}: WorkCardProps) {
    return (
        <View className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-5">
            <View className="h-2 bg-blue-600" />

            <View className="p-6">
                <StatusStepper currentStatus={gig.status || 'assigned'} />

                <Text className="text-2xl font-black text-gray-900 mb-2">{gig.title}</Text>

                <View className="flex-row flex-wrap gap-4 mb-5">
                    <View className="flex-row items-center gap-1.5">
                        <MapPin size={15} color="#9ca3af" />
                        <Text className="text-gray-500 text-xs font-bold">{gig.location}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <Clock size={15} color="#9ca3af" />
                        <Text className="text-gray-500 text-xs font-bold">{new Date(gig.updated_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View className="bg-emerald-50 rounded-2xl p-4 mb-5 flex-row items-center justify-between border border-emerald-100">
                    <Text className="text-emerald-700 font-bold text-sm">Payout</Text>
                    <Text className="text-emerald-700 font-black text-xl">${gig.pay_amount}</Text>
                </View>

                <View className="flex-row gap-3 mb-5">
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${gig.client_phone || ''}`)}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-blue-50 py-4 rounded-2xl border border-blue-100"
                    >
                        <Phone size={17} color="#1d4ed8" />
                        <Text className="text-blue-700 font-black text-sm">Call Client</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => Linking.openURL(`sms:${gig.client_phone || ''}`)}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-indigo-50 py-4 rounded-2xl border border-indigo-100"
                    >
                        <MessageSquare size={17} color="#4338ca" />
                        <Text className="text-indigo-700 font-black text-sm">Message</Text>
                    </TouchableOpacity>
                </View>

                {gig.status === 'in_progress' ? (
                    <TouchableOpacity
                        onPress={() => onFinishWork(gig.id)}
                        disabled={isCompleting}
                        className="bg-emerald-600 py-4 rounded-2xl flex-row items-center justify-center gap-3"
                        style={{ opacity: isCompleting ? 0.6 : 1 }}
                    >
                        {isCompleting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Camera size={22} color="#fff" />
                                <Text className="text-white font-black text-lg">Capture Proof & Finish</Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : gig.status === 'pending_review' ? (
                    <View className="bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center gap-3">
                        <CheckCircle2 size={22} color="#10b981" />
                        <Text className="text-gray-500 font-black text-base">Pending Review</Text>
                    </View>
                ) : gig.status === 'completed' ? (
                    <View className="bg-emerald-100 py-4 rounded-2xl flex-row items-center justify-center gap-3">
                        <CheckCircle2 size={22} color="#10b981" />
                        <Text className="text-emerald-700 font-black text-base">Completed</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => onStartWork(gig.id)}
                        disabled={isUpdatingStatus}
                        className="bg-gray-900 py-4 rounded-2xl flex-row items-center justify-center gap-3"
                        style={{ opacity: isUpdatingStatus ? 0.6 : 1 }}
                    >
                        {isUpdatingStatus ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Play size={22} color="#34d399" fill="#34d399" />
                                <Text className="text-white font-black text-lg">Start Work Session</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
});

export default function MyWorkScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { myGigs, isLoadingMine, updateGigStatus, isUpdatingStatus, completeGig, isCompleting, refresh } = useGigs(
        user?.id,
        {
            loadAvailable: false,
            loadMine: true,
        }
    );
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refresh();
        } finally {
            setRefreshing(false);
        }
    }, [refresh]);

    const handleStartWork = useCallback(
        async (gigId: string) => {
            try {
                await updateGigStatus(gigId, 'in_progress');
            } catch (err: any) {
                Alert.alert('Error', err?.message || 'Unable to start this gig');
            }
        },
        [updateGigStatus]
    );

    const handleFinishWork = useCallback(
        async (gigId: string) => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Camera access is needed to capture proof of work.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 0.7,
                allowsEditing: false,
                base64: false,
            });

            if (result.canceled || !result.assets?.[0]) {
                return;
            }

            try {
                const uri = result.assets[0].uri;
                const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;

                if (!cloudName) {
                    await completeGig(gigId, uri);
                    Alert.alert('Submitted', 'Your gig has been submitted for review.');
                    return;
                }

                const formData = new FormData();
                formData.append('file', { uri, type: 'image/jpeg', name: 'proof.jpg' } as any);
                formData.append('upload_preset', 'middleman_proofs');

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();

                if (data.secure_url) {
                    await completeGig(gigId, data.secure_url);
                    Alert.alert('Submitted', 'Your proof of work has been uploaded for review.');
                }
            } catch (err: any) {
                Alert.alert('Upload failed', err?.message || 'Unable to upload completion proof');
            }
        },
        [completeGig]
    );

    const renderItem = useCallback<ListRenderItem<Gig>>(
        ({ item }) => (
            <WorkCard
                gig={item}
                isUpdatingStatus={isUpdatingStatus}
                isCompleting={isCompleting}
                onStartWork={handleStartWork}
                onFinishWork={handleFinishWork}
            />
        ),
        [isUpdatingStatus, isCompleting, handleStartWork, handleFinishWork]
    );

    if (isLoadingMine) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <FlatList
            className="flex-1 bg-gray-50"
            data={myGigs}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            initialNumToRender={5}
            windowSize={7}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 128 }}
            ListHeaderComponent={
                <View className="mb-8">
                    <Text className="text-3xl font-black text-gray-900 tracking-tight mb-1">Command Center</Text>
                    <Text className="text-gray-500 font-medium">Manage your active operations</Text>
                </View>
            }
            ListEmptyComponent={
                <View className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-gray-100 items-center">
                    <View className="bg-gray-50 w-20 h-20 rounded-full items-center justify-center mb-4">
                        <Briefcase size={32} color="#d1d5db" />
                    </View>
                    <Text className="text-gray-900 font-black text-xl mb-1">Station Idle</Text>
                    <Text className="text-gray-500 text-sm mb-6 text-center px-4">
                        You do not have any active contracts. Visit the marketplace to deploy.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(dashboard)/freelancer/gigs')}
                        className="bg-gray-900 px-8 py-4 rounded-2xl"
                    >
                        <Text className="text-white font-bold">Go to Marketplace</Text>
                    </TouchableOpacity>
                </View>
            }
        />
    );
}
