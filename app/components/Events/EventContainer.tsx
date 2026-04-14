import React, { useEffect } from "react";
import { View, Image, ScrollView, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";

export default function EventContainer({ event }: { event: any }) {

  return <View className="flex flex-row items-center w-full my-[10px] ">
    <Image source={{ uri: "https://campusgroups.rit.edu" + event.eventPicture }} className="w-[90px] h-[90px] rounded-lg" />
    <View className="ml-[10px] flex-col justify-between h-[90px]">
      <Text className="font-bold line-clamp-1">{event.eventName}</Text>
      <Text className="text-gray-500">{event.clubName}</Text>
      <Text className="line-clamp-1">{event.eventLocation == "Private Location (sign in to display)" ? "Private Location. Login on site" : event.eventLocation}</Text>
    </View>
  </View>;
}