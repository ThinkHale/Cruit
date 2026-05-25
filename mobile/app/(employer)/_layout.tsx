import { Tabs } from 'expo-router';
import { Layers, Briefcase, Star, User } from 'lucide-react-native';

export default function EmployerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#1e293b', paddingBottom: 4 },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Swipe', tabBarIcon: ({ color }) => <Layers size={22} color={color} /> }} />
      <Tabs.Screen name="jobs" options={{ title: 'Jobs', tabBarIcon: ({ color }) => <Briefcase size={22} color={color} /> }} />
      <Tabs.Screen name="matches" options={{ title: 'Matches', tabBarIcon: ({ color }) => <Star size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={22} color={color} /> }} />
    </Tabs>
  );
}
