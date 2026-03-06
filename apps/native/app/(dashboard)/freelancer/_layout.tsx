import { Tabs } from 'expo-router';
import { Home, Briefcase, CheckSquare, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

function TabIcon({ icon: Icon, focused, label }: { icon: any; focused: boolean; label: string }) {
    return (
        <View className="items-center justify-center pt-1">
            <Icon
                size={22}
                color={focused ? '#2563eb' : '#9ca3af'}
                strokeWidth={focused ? 2.5 : 1.8}
            />
            <Text
                className={`text-[10px] mt-0.5 font-${focused ? 'bold' : 'normal'}`}
                style={{ color: focused ? '#2563eb' : '#9ca3af' }}
            >
                {label}
            </Text>
        </View>
    );
}

export default function FreelancerLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                lazy: true,
                freezeOnBlur: true,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 72,
                    backgroundColor: '#fff',
                    borderTopColor: '#f3f4f6',
                    borderTopWidth: 1,
                    paddingBottom: 12,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} label="Home" />,
                }}
            />
            <Tabs.Screen
                name="gigs"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={Briefcase} focused={focused} label="Gigs" />,
                }}
            />
            <Tabs.Screen
                name="my-work"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={CheckSquare} focused={focused} label="My Work" />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} label="Profile" />,
                }}
            />
        </Tabs>
    );
}
