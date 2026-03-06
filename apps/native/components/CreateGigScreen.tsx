import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// @ts-ignore - Handled correctly by Metro bundler cross-workspace configs
import { gigSchema, GigFormValues } from '../../../apps/web/src/lib/schemas/gig';

interface CreateGigScreenProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: GigFormValues) => Promise<void>;
    isLoading: boolean;
}

export function CreateGigScreen({ visible, onClose, onSubmit, isLoading }: CreateGigScreenProps) {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<GigFormValues>({
        resolver: zodResolver(gigSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            location: '',
            pay_amount: 10,
            scheduled_at: new Date().toISOString().slice(0, 16),
        }
    });

    const handleFormSubmit = async (data: GigFormValues) => {
        await onSubmit(data);
        reset();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-gray-50">
                <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-white">
                    <View>
                        <Text className="text-xl font-black text-gray-900">Post New Gig</Text>
                        <Text className="text-gray-500 text-xs mt-1">Create an opportunity for technicians</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                        <X size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-2">Gig Title</Text>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className={`bg-white border ${errors.title ? 'border-red-400' : 'border-gray-200'} rounded-2xl p-4 text-gray-900 font-medium`}
                                    placeholder="e.g. Install Office Network"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.title && <Text className="text-red-500 text-xs font-bold mt-1 max-w-full truncate">{errors.title.message}</Text>}
                    </View>

                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Category</Text>
                            <Controller
                                control={control}
                                name="category"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        className={`bg-white border ${errors.category ? 'border-red-400' : 'border-gray-200'} rounded-2xl p-4 text-gray-900 font-medium`}
                                        placeholder="Networking"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.category && <Text className="text-red-500 text-xs font-bold mt-1">{errors.category.message}</Text>}
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Location</Text>
                            <Controller
                                control={control}
                                name="location"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        className={`bg-white border ${errors.location ? 'border-red-400' : 'border-gray-200'} rounded-2xl p-4 text-gray-900 font-medium`}
                                        placeholder="123 Main St"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            {errors.location && <Text className="text-red-500 text-xs font-bold mt-1">{errors.location.message}</Text>}
                        </View>
                    </View>

                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Pay Amount ($)</Text>
                            <Controller
                                control={control}
                                name="pay_amount"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        className={`bg-white border ${errors.pay_amount ? 'border-red-400' : 'border-gray-200'} rounded-2xl p-4 text-gray-900 font-medium`}
                                        keyboardType="numeric"
                                        value={value.toString()}
                                        onChangeText={val => onChange(Number(val))}
                                    />
                                )}
                            />
                            {errors.pay_amount && <Text className="text-red-500 text-xs font-bold mt-1">{errors.pay_amount.message}</Text>}
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-2">Date/Time</Text>
                            <Controller
                                control={control}
                                name="scheduled_at"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        className={`bg-white border ${errors.scheduled_at ? 'border-red-400' : 'border-gray-200'} rounded-2xl p-4 text-gray-900 font-medium`}
                                        placeholder="YYYY-MM-DD"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View className="mb-10">
                        <Text className="text-sm font-bold text-gray-700 mb-2">Description</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    className={`bg-white border ${errors.description ? 'border-red-400' : 'border-gray-200'} rounded-2xl p-4 text-gray-900 font-medium`}
                                    placeholder="Describe the job requirements..."
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                        {errors.description && <Text className="text-red-500 text-xs font-bold mt-1">{errors.description.message}</Text>}
                    </View>

                    <View className="pb-12" />
                </ScrollView>

                <View className="p-6 bg-white border-t border-gray-100 flex-row gap-4 justify-end">
                    <TouchableOpacity onPress={onClose} className="px-6 py-4 rounded-xl items-center justify-center">
                        <Text className="text-gray-700 font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSubmit(handleFormSubmit)}
                        disabled={isLoading}
                        className={`bg-blue-600 px-8 py-4 rounded-xl flex-row items-center justify-center gap-2 ${isLoading ? 'opacity-50' : 'active:scale-95 transition'}`}
                    >
                        {isLoading && <ActivityIndicator color="#fff" size="small" />}
                        <Text className="text-white font-bold">{isLoading ? 'Posting...' : 'Post Gig'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
