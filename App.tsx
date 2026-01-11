import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { RosterScreen } from './src/screens/RosterScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { AppProvider, useAppContext } from './src/store/AppContext';
import { theme } from './src/theme';
import { TabBarIcon } from './src/components/TabBarIcon';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { channels, getUnreadCount } = useAppContext();
  const unreadCount = channels.reduce((sum, channel) => sum + getUnreadCount(channel.id), 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingTop: 6,
          paddingBottom: 8,
          height: 68,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon
              name="chatbubble-ellipses"
              color={color}
              size={size ?? 24}
              badgeCount={unreadCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Roster"
        component={RosterScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="people" color={color} size={size ?? 24} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="ellipsis-horizontal" color={color} size={size ?? 24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AppProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
