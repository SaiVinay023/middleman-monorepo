import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface DashboardActionCardProps {
    onPress: () => void;
    icon: React.ReactNode;
    count: number | string;
    label: string;
    colorScheme: 'blue' | 'emerald' | 'amber' | 'purple';
}

const colorMaps = {
    blue: {
        bg: 'bg-blue-50',
        iconBg: 'bg-blue-600',
        border: 'border-blue-100',
        count: 'text-blue-900',
        label: 'text-blue-700'
    },
    emerald: {
        bg: 'bg-emerald-50',
        iconBg: 'bg-emerald-600',
        border: 'border-emerald-100',
        count: 'text-emerald-900',
        label: 'text-emerald-700'
    },
    amber: {
        bg: 'bg-amber-50',
        iconBg: 'bg-amber-600',
        border: 'border-amber-100',
        count: 'text-amber-900',
        label: 'text-amber-700'
    },
    purple: {
        bg: 'bg-purple-50',
        iconBg: 'bg-purple-600',
        border: 'border-purple-100',
        count: 'text-purple-900',
        label: 'text-purple-700'
    }
};

export function DashboardActionCard({
    onPress,
    icon,
    count,
    label,
    colorScheme
}: DashboardActionCardProps) {
    const colors = colorMaps[colorScheme];
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 aspect-square ${colors.bg} rounded-[2.5rem] p-5 justify-between border ${colors.border} active:scale-95`}
        >
            <View className={`${colors.iconBg} w-10 h-10 rounded-2xl items-center justify-center`}>
                {icon}
            </View>
            <View>
                <Text className={`text-3xl font-black ${colors.count}`}>{count}</Text>
                <Text className={`text-xs font-bold ${colors.label} uppercase`}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
}
