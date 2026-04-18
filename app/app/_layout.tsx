import "../global.css";
import React, { useState } from "react";
import { RelativePathString, Stack, useRouter, usePathname } from "expo-router";
import NavigationBar from "@/components/Navigation/NavigationBar";
import { StackAnimationTypes } from "react-native-screens";
import { PortalHost } from "@rn-primitives/portal";

export default function RootLayout() {
  const routeNavigator = useRouter();
  const [onScreen, setScreenName] = useState<string>("home");
  const [animationType, setAnimationType] =
    useState<StackAnimationTypes>("slide_from_right");
  const [pathUsingHook, setPathUsingHook] = useState<string>("");

  const pageWeights: { [key: string]: number } = {
    home: 0,
    map: 1,
    grid: 2,
    calendar: 3,
    profile: 4,
  };

  const currentPath = usePathname();

  React.useEffect(() => {
    setPathUsingHook(currentPath);
  }, [currentPath]);

  const navigatorFunc = (screenSwitch: string) => {
    let setType = screenSwitch === "/" ? "/home" : screenSwitch;
    let pathCorrector = pathUsingHook === "/" ? "/home" : pathUsingHook;
    if (pathCorrector === setType) {
      return;
    }

    if (pageWeights[setType.substring(1)] < pageWeights[onScreen]) {
      setAnimationType("slide_from_left");
    } else {
      setAnimationType("slide_from_right");
    }

    if(!Object.keys(pageWeights).includes(pathCorrector.substring(1))) {
      setAnimationType("slide_from_left")
    }
    
    routeNavigator.replace(screenSwitch as RelativePathString);
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: animationType }} />
        <Stack.Screen name="map" options={{ animation: animationType }} />
        <Stack.Screen name="grid" options={{ animation: animationType }} />
        <Stack.Screen name="calendar" options={{ animation: animationType }} />
        <Stack.Screen name="profile" options={{ animation: animationType }} />
      </Stack>
      <NavigationBar
        onScreen={onScreen}
        setOnScreen={setScreenName}
        navigateFunc={navigatorFunc}
      />
      <PortalHost />
    </>
  );
}
