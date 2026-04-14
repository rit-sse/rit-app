import React, { useEffect } from "react";
import { View, Image, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";

export default function EventContainer({ event }: { event: any }) {

  return <View className="">
    <Image source={{ uri: "https://campusgroups.rit.edu" + event.eventPicture }} className="w-[50px] h-[50px]" />
  </View>;
}