import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import HomeStackNavigation from './Navigation';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function App() {
  return (
    <NavigationContainer>
      <RootSiblingParent>
        <HomeStackNavigation />
      </RootSiblingParent>
    </NavigationContainer>
  );
}