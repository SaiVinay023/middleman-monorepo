import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Upload } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import * as DocumentPicker from 'expo-document-picker';

const DOC_TYPES = [
    { id: 'ID_CARD', label: 'National ID / Passport', icon: '🪪' },
    { id: 'CV', label: 'Technical Resume (CV)', icon: '📄' },
    { id: 'CERT', label: 'Professional Certification', icon: '🏆' },
    { id: 'TAX', label: 'Tax Identification', icon: '📋' },
] as const;

type DocType = typeof DOC_TYPES[number]['id'];

function DocCard({ userId, docType, label, icon }: { userId: string; docType: DocType; label: string; icon: string }) {
    const [status, setStatus] = useState<'idle' | 'uploaded' | 'uploading'>('idle');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        supabase
            .from('documents')
            .select('id')
            .eq('user_id', userId)
            .eq('doc_type', docType)
            .single()
            .then(({ data }) => {
                if (data) setStatus('uploaded');
            });
    }, [userId, docType]);

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });
            if (result.canceled || !result.assets?.[0]) return;

            setUploading(true);
            const file = result.assets[0];

            const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if (cloudName) {
                const formData = new FormData();
                formData.append('file', { uri: file.uri, type: file.mimeType || 'application/pdf', name: file.name } as any);
                formData.append('upload_preset', 'middleman_proofs');

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await res.json();

                if (uploadData.secure_url) {
                    await supabase.from('documents').upsert({
                        user_id: userId,
                        doc_type: docType,
                        file_url: uploadData.secure_url,
                        status: 'pending',
                    }, { onConflict: 'user_id,doc_type' });
                    setStatus('uploaded');
                    Alert.alert('✅ Uploaded', `${label} has been submitted for review.`);
                }
            } else {
                // Dev mode: mark uploaded without actual cloud storage
                await supabase.from('documents').upsert({
                    user_id: userId,
                    doc_type: docType,
                    file_url: file.uri,
                    status: 'pending',
                }, { onConflict: 'user_id,doc_type' });
                setStatus('uploaded');
                Alert.alert('✅ Submitted', `${label} has been recorded.`);
            }
        } catch (err: any) {
            Alert.alert('Upload Failed', err.message);
        } finally {
            setUploading(false);
        }
    };

    const isUploaded = status === 'uploaded';

    return (
        <View className={`bg-white border rounded-2xl p-5 flex-row items-center justify-between gap-4 ${isUploaded ? 'border-emerald-200' : 'border-gray-100'}`}>
            <View className="flex-row items-center gap-3 flex-1">
                <Text style={{ fontSize: 24 }}>{icon}</Text>
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold" numberOfLines={1}>{label}</Text>
                    <Text className={`text-xs mt-0.5 font-semibold ${isUploaded ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {isUploaded ? 'Submitted — Pending Review' : 'Not yet uploaded'}
                    </Text>
                </View>
            </View>
            {isUploaded ? (
                <CheckCircle size={26} color="#10b981" />
            ) : (
                <TouchableOpacity
                    onPress={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 px-4 py-2.5 rounded-xl flex-row items-center gap-2"
                    style={{ opacity: uploading ? 0.6 : 1 }}
                >
                    {uploading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Upload size={14} color="#fff" />
                            <Text className="text-white font-bold text-sm">Upload</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function ProfileScreen() {
    const { user, profile, signOut } = useAuth();
    const [docCount, setDocCount] = useState(0);

    useEffect(() => {
        if (!user?.id) return;
        supabase
            .from('documents')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .then(({ count }) => setDocCount(count || 0));
    }, [user?.id]);

    const totalDocs = DOC_TYPES.length;
    const progressPercent = Math.round((docCount / totalDocs) * 100);

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="pb-32">
                {/* Profile Header */}
                <View className="bg-gray-900 pt-14 pb-10 px-6 rounded-b-[3rem]">
                    <View className="items-center">
                        <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-3">
                            <Text className="text-white text-3xl font-black">
                                {(profile?.full_name || user?.email || 'T')[0].toUpperCase()}
                            </Text>
                        </View>
                        <Text className="text-white text-2xl font-black">{profile?.full_name || 'Technician'}</Text>
                        <Text className="text-gray-400 text-sm mt-1">{user?.email}</Text>
                        <View className="bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 rounded-full mt-3">
                            <Text className="text-blue-300 text-xs font-bold uppercase tracking-widest">
                                {profile?.role || 'Freelancer'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="px-6 pt-8 gap-y-6">
                    {/* Verification Progress */}
                    <View className="bg-white rounded-3xl p-6 border border-gray-100">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-gray-900 font-bold text-base">Verification Progress</Text>
                            <Text className="text-blue-600 font-black text-lg">{progressPercent}%</Text>
                        </View>
                        <View className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                className={`h-full rounded-full ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </View>
                        <Text className="text-gray-400 text-xs mt-2">
                            {docCount} of {totalDocs} documents submitted
                        </Text>
                    </View>

                    {/* Document Uploaders */}
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
                            Required Documents
                        </Text>
                        <View className="gap-y-3">
                            {user?.id && DOC_TYPES.map((doc) => (
                                <DocCard
                                    key={doc.id}
                                    userId={user.id}
                                    docType={doc.id}
                                    label={doc.label}
                                    icon={doc.icon}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Sign Out */}
                    <TouchableOpacity
                        onPress={signOut}
                        className="bg-red-50 border border-red-100 py-4 rounded-2xl items-center mt-4"
                    >
                        <Text className="text-red-600 font-bold">Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
