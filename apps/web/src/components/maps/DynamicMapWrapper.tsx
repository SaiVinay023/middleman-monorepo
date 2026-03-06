'use client';
import dynamic from 'next/dynamic';

export interface DynamicMapWrapperProps {
    latitude?: number;
    longitude?: number;
    gigId?: string;
}

// Critical fix to prevent 'window is not defined' during Next.js SSR hydration
export const DynamicMapWrapper = dynamic(
    () => import('./MapViewer'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[300px] w-full bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center border border-gray-200">
                <span className="text-gray-400 font-bold text-sm">Loading Map...</span>
            </div>
        )
    }
) as React.FC<DynamicMapWrapperProps>;
