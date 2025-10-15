import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CheckinScreen from './src/screens/CheckinScreen';
import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Checkin"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Checkin"
          component={CheckinScreen}
          options={{ title: 'Check-in' }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'Bản đồ Check-in' }}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: 'Lịch sử Check-in' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
