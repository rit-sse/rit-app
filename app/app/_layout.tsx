import { Stack, useNavigation } from "expo-router";
import { View } from "react-native";
import NavigationBar from "@/components/Navigation/NavigationBar";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { useState } from "react";


export default function RootLayout() {
  const navigation = useNavigation();
  const [onScreen, setScreenName] = useState("Home");
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="map" />
          <Stack.Screen name="grid" />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="profile" />
        </Stack>
        <NavigationBar onScreen={onScreen} />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
