import React, { useEffect } from "react";
import { View, Image, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { openLink } from "@/lib/utils";
import { useRouter } from "expo-router";

import globals from "@/app/globals";
export default function EventContainer({ event }: { event: any }) {
  const route = useRouter()

  function handleOnPress() {
    // openLink("https://campusgroups.rit.edu" + event.eventUrlButton, route);
    openLink("/events?eventID=" + event.eventId, route);
    globals.showNavbar ? globals.showNavbar(false) : null;
  }
  return <TouchableOpacity className="flex flex-row items-center w-full my-[10px] " onPress={handleOnPress}>
    <Image source={{ uri: "https://campusgroups.rit.edu" + event.eventPicture }} className="w-[90px] h-[90px] rounded-lg" />
    <View className="ml-[10px] flex-col justify-between ">
      <Text className="font-bold line-clamp-1">{event.eventName}</Text>
      <Text className="text-gray-500">{event.clubName}</Text>
      <Text className="text-gray-500">{event.eventDates}</Text>
      <Text className="line-clamp-1">{event.eventLocation == "Private Location (sign in to display)" ? "Private Location. Login on site" : event.eventLocation}</Text> 
    </View>
  </TouchableOpacity>;
}
