import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Linking } from "react-native"
import { RelativePathString } from "expo-router"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface gridBox {
  imageID: string;
  name: string;
  link: string;
}

export const storeRecentlyView = async (item: gridBox) => {
  const currentlyStored = await AsyncStorage.getItem("recentViewed");
  if (currentlyStored) {
    const parsed = JSON.parse(currentlyStored);
    let preExistingIdx = false;
    // Find the location of a pre-existing item, if it exists. Pop it and the put it at the end.
    for (let idx = 0; idx < parsed.length; idx++) {
      if (parsed[idx].link === item.link) {
        parsed.splice(idx, 1);
        parsed.push(item);
        preExistingIdx = true;
      }
    }
    if (!preExistingIdx) { parsed.push(item); }
    await AsyncStorage.setItem("recentViewed", JSON.stringify(parsed));
  } else {
    await AsyncStorage.setItem("recentViewed", JSON.stringify([item]));
  }

}

export const getRecentlyView = async (): Promise<gridBox[]> => {
  const currentlyStored = await AsyncStorage.getItem("recentViewed");
  if (currentlyStored) {
    return JSON.parse(currentlyStored);
  } else {
    return [];
  }
}

export const clearRecentlyView = async () => {
  await AsyncStorage.removeItem("recentViewed");
}

/**
   * opens a given link
   *
   * @param link
   * @returns null
   * Created by Addison A
   */
export async function openLink(link: string, routeNavigator: any) {
  // await AsyncStorage.setItem("recently_viewed", link);

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