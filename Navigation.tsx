import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Home';
import LoginScreen from './Login';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigation() {

    const [hasLogin, setHasLogin] = useState<boolean>(false);

    useEffect(() => {
        getData()
    })
    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem('@storage_Key');
            setHasLogin(value !== null);
        } catch (e) {
            console.error(e)
        }
    }

    if (hasLogin) {
        return <HomeScreen />
    }

    return (
        <Stack.Navigator>
            <Stack.Screen
                name='login'
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}