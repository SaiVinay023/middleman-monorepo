'use client';

import { PostGigForm } from '@/components/company/PostGigForm';

export default function PostGigPage() {
    return (
        <div className="p-6 pb-24 max-w-5xl mx-auto w-full">
            <div className="mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Company Portal</span>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">Manage Gigs</h1>
            </div>
            <PostGigForm onSubmit={async () => { }} onCancel={() => { }} />
        </div>
    );
}
