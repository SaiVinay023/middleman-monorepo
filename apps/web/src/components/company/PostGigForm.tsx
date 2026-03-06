'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gigSchema, GigFormValues } from '@/lib/schemas/gig';
import { X } from 'lucide-react';

interface PostGigFormProps {
    onSubmit: (data: GigFormValues) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function PostGigForm({ onSubmit, onCancel, isLoading }: PostGigFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<GigFormValues>({
        resolver: zodResolver(gigSchema),
        defaultValues: {
            title: '',
            description: '',
            category: '',
            location: '',
            pay_amount: 10,
            scheduled_at: '',
        },
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Post New Gig</h2>
                        <p className="text-sm text-gray-500 font-medium">Create a new opportunity for technicians</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="post-gig-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Gig Title</label>
                            <input
                                {...register('title')}
                                placeholder="e.g. Install Office Network"
                                className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <input
                                    {...register('category')}
                                    placeholder="e.g. Networking"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition"
                                />
                                {errors.category && <p className="text-red-500 text-xs mt-1 font-bold">{errors.category.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                                <input
                                    {...register('location')}
                                    placeholder="e.g. 123 Main St, Remote"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition"
                                />
                                {errors.location && <p className="text-red-500 text-xs mt-1 font-bold">{errors.location.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Pay Amount ($)</label>
                                <input
                                    type="number"
                                    {...register('pay_amount')}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition"
                                />
                                {errors.pay_amount && <p className="text-red-500 text-xs mt-1 font-bold">{errors.pay_amount.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Schedule Date/Time</label>
                                <input
                                    type="datetime-local"
                                    {...register('scheduled_at')}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition"
                                />
                                {errors.scheduled_at && <p className="text-red-500 text-xs mt-1 font-bold">{errors.scheduled_at.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                placeholder="Describe the job requirements..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition resize-none"
                            />
                            {errors.description && <p className="text-red-500 text-xs mt-1 font-bold">{errors.description.message}</p>}
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl shrink-0 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="post-gig-form"
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {isLoading ? 'Posting...' : 'Post Gig'}
                    </button>
                </div>
            </div>
        </div>
    );
}
