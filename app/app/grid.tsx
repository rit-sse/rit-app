import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";

import { RelativePathString, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Quick Grid section of the app
 *
 * Last Updated: 2/14/2026
 *
 * Made by: Addison A
 * Edited by: Jetmon Deng
 *
 *
 */


interface gridBox {
  requireImage: any;
  imageURL: string;
  name: string;
  link: string;
}

export default function Grid() {
  const routeNavigator = useRouter();
  // Icons sourced from https://lucide.dev/icons
  const GRID_DATA: gridBox[] = [
    {
      requireImage: require("../assets/icons/grid/sis.png"),
      imageURL: "/assets/icons/grid/sis.png",
      name: "SIS",
      link: "https://campus.ps.rit.edu/"
    },
    {
      requireImage: require("../assets/icons/grid/course-browser.png"),
      imageURL: "/assets/icons/grid/course-browser.png",
      name: "Schedule Maker",
      link: "https://schedulemaker.csh.rit.edu/"
    },
    {
      requireImage: require("../assets/icons/grid/academic-calendar.png"),
      imageURL: "/assets/icons/grid/academic-calendar.png",
      name: "Academic Calendar",
      link: "https://www.rit.edu/calendar"
    }
  ]

  const special_Dining: gridBox = {
    requireImage: require("../assets/icons/grid/dining.png"),
    imageURL: "/assets/icons/grid/dining.png",
    name: "Dining & Menus",
    link: "/dining/search"
  }


  /**
   * opens a given link
   *
   * @param link
   * @returns null
   */
  async function openLink(link: string) {
    await AsyncStorage.setItem("recently_viewed", link);

    if (link === "PLACEHOLDER") {
      // account for placeholders
      return null;
    }

    if (link.includes("http")) {
      // open a website through a URL
      // Check if the device can open the URL
      const supported = await Linking.canOpenURL(link);

      if (supported) {
        // Open the URL in the default browser
        await Linking.openURL(link);
      } else {
        console.log("This device does not know how to open the URI: " + link);
      }
    } else {
      // switch screens to another screen on this app
      console.log("Navigating to internal link: " + link);
      routeNavigator.push(link as RelativePathString);
    }
  }

  function processQuickLink(gridItem: gridBox) {
    console.log("Processing quick link for: " + gridItem.name);
    console.log("Link: " + gridItem.link);
    openLink(gridItem.link);

  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <View className="w-full  items-center h-[80%]">
        <TouchableOpacity activeOpacity={0.8} className="w-[85%] h-24 rounded-lg overflow-hidden" onPress={() => processQuickLink(special_Dining)}>
          <LinearGradient colors={["#F76902", "#f7680271"]} start={{ x: 0.0, y: 0.5 }} end={{ x: 1.0, y: .5 }} style={{ position: "absolute", width: "100%", height: "100%", borderRadius: 8, zIndex: 1 }} />
          <Image source={require("../assets/images/special/dining.jpg")} className="w-full h-full rounded-lg absolute z-0" />
          <Text className="absolute z-20 text-white font-bold bottom-2.5 left-2.5 text-2xl">Dining & Menus</Text>
        </TouchableOpacity>
        <FlatList
          data={GRID_DATA}
          numColumns={3}
          keyExtractor={(item) => item.name}
          style={{ width: "85%", flex: 1 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.5} key={item.name} onPress={() => processQuickLink(item)} className="w-[100px] h-[120px] flex items-center justify-center bg-gray-200 rounded-lg my-3 border-[1px] border-gray-400">
              <Image source={item.requireImage} className="w-12 h-12" />
              <Text className="text-center ">{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

    </SafeAreaView>
  );
}
