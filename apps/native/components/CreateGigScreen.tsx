import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { X } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// @ts-ignore - Handled correctly by Metro bundler cross-workspace configs
import { gigSchema, GigFormValues } from '../../../apps/web/src/lib/schemas/gig';
import { FormInput } from './FormInput';

interface CreateGigScreenProps {
    visible: boolean;
    onDismiss: () => void;
    onGigSubmit: (data: GigFormValues) => Promise<void>;
    isLoading: boolean;
}

export function CreateGigScreen({ visible, onDismiss, onGigSubmit, isLoading }: CreateGigScreenProps) {
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
        await onGigSubmit(data);
        reset();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onDismiss}>
            <View className="flex-1 bg-gray-50">
                <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-white">
                    <View>
                        <Text className="text-xl font-black text-gray-900">Post New Gig</Text>
                        <Text className="text-gray-500 text-xs mt-1">Create an opportunity for technicians</Text>
                    </View>
                    <TouchableOpacity onPress={onDismiss} className="bg-gray-100 p-2 rounded-full">
                        <X size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <FormInput
                        className="mb-6"
                        control={control}
                        name="title"
                        label="Gig Title"
                        placeholder="e.g. Install Office Network"
                        error={errors.title?.message}
                    />

                    <View className="flex-row gap-4 mb-6">
                        <FormInput
                            className="flex-1"
                            control={control}
                            name="category"
                            label="Category"
                            placeholder="Networking"
                            error={errors.category?.message}
                        />
                        <FormInput
                            className="flex-1"
                            control={control}
                            name="location"
                            label="Location"
                            placeholder="123 Main St"
                            error={errors.location?.message}
                        />
                    </View>

                    <View className="flex-row gap-4 mb-6">
                        <FormInput
                            className="flex-1"
                            control={control}
                            name="pay_amount"
                            label="Pay Amount ($)"
                            keyboardType="numeric"
                            error={errors.pay_amount?.message}
                            onChangeText={val => {
                                const parsed = parseFloat(val);
                                if (!isNaN(parsed)) control._fields.pay_amount?._f.onChange(parsed);
                            }}
                        />
                        <FormInput
                            className="flex-1"
                            control={control}
                            name="scheduled_at"
                            label="Date/Time"
                            placeholder="YYYY-MM-DD"
                            error={errors.scheduled_at?.message}
                        />
                    </View>

                    <FormInput
                        className="mb-10"
                        control={control}
                        name="description"
                        label="Description"
                        placeholder="Describe the job requirements..."
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        error={errors.description?.message}
                    />

                    <View className="pb-12" />
                </ScrollView>

                <View className="p-6 bg-white border-t border-gray-100 flex-row gap-4 justify-end">
                    <TouchableOpacity onPress={onDismiss} className="px-6 py-4 rounded-xl items-center justify-center">
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
