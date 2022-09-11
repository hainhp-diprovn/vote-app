import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './Home';

const Stack = createNativeStackNavigator();

export default function HomeStackNavigation() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="DIPRO"
                component={HomeScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}