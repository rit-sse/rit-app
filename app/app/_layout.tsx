import { RelativePathString, Stack, useNavigation, useRouter } from "expo-router";
import { View } from "react-native";
import NavigationBar from "@/components/Navigation/NavigationBar";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { useState } from "react";
import { StackAnimationTypes } from "react-native-screens";


export default function RootLayout() {
  const routeNavigator = useRouter();
  const [onScreen, setScreenName] = useState<string>("home");

  const [animationType, setAnimationType] = useState<StackAnimationTypes>("slide_from_right");

  const pageWeights: { [key: string]: number } = {
      "home": 0,
      "map": 1,
      "grid": 2,
      "calendar": 3,
      "profile": 4
  }

  const navigatorFunc = (screenSwitch: string) => {
    let setType = screenSwitch === "/" ? "/home" : screenSwitch;
    if(pageWeights[setType.substring(1)] < pageWeights[onScreen]) {
        setAnimationType("slide_from_left");
    } else {
        setAnimationType("slide_from_right");
    }
    routeNavigator.navigate(screenSwitch as RelativePathString);
  }

  return (
    <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{
            animation: animationType
          }}/>
          <Stack.Screen name="map" options={{
            animation: animationType
          }}/>
          <Stack.Screen name="grid" options={{
            animation: animationType
          }}/>
          <Stack.Screen name="calendar" options={{
            animation: animationType
          }}/>
          <Stack.Screen name="profile" options={{
            animation: animationType
          }}/>
        </Stack>
        <NavigationBar onScreen={onScreen} setOnScreen={setScreenName} navigateFunc={navigatorFunc}/>
      </>
  );
}
