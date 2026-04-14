import { useState } from "react";
import React, { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useEffect } from "react";
import { buildApiUrl } from "@/lib/api";
import EventContainer from "@/components/Events/EventContainer";

export default function calendar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch(buildApiUrl("/events"))
      .then(response => response.json())
      .then((data: any) => {
        console.log(data);
        setEvents(data["data"].filter((event: any) => event.eventName != null));
      });
  }, []);


  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", backgroundColor: "#ffffff",}} >
      <View className="w-[90%]">
        <Text className="text-[30px] font-bold">Events</Text>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 150}}>
          {
            events.map((event: any, index: number) => (
              <EventContainer key={index} event={event} />
            ))
          }
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
