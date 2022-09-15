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
            const item = await AsyncStorage.getItem('@storage_Key')
            if (item) {
                const jsonValue = JSON.parse(item)
                setHasLogin(jsonValue.name !== null);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const HomeItemScreen = () => {
        return <HomeScreen setHasLogin={setHasLogin} />
    }

    if (hasLogin) {
        return <HomeItemScreen />
    }

    return (
        <Stack.Navigator initialRouteName="login">
            <Stack.Screen
                name='login'
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="home"
                component={HomeItemScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}