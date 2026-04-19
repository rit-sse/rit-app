import { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { buildApiUrl } from "@/lib/api";
import EventContainer from "@/components/Events/EventContainer";
import EventTagButton from "@/components/Events/EventTagButton";
import {Input} from "@/components/ui/input";

const weightedTags: { [key: string]: number } = {
  "Event": 10,
  "Recreation": 9,
  "Wellness": 8,
  "Sustainability": 7,
  "Other": 1
}

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [eventTags, setEventTags] = useState<string[]>([]);
  const [viewEvents, setViewEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetch(buildApiUrl("/events"))
      .then((response) => response.json())
      .then((data: any) => {
        console.log(data);
        setEvents(data["data"]["events"].filter((event: any) => event.eventName != null));
        setEventTags((data["data"]["eventTags"] as string[]).sort((a: string, b: string) => (weightedTags[b] || 0) - (weightedTags[a] || 0)));
        setViewEvents(data["data"]["events"].filter((event: any) => event.eventName != null));
      });
  }, []);

  useEffect(() => {
    let eventCopy = [...events];
    if (filteredEvents.length > 0) {
      eventCopy = eventCopy.filter((event: any) => event.eventTags.some((tag: string) => filteredEvents.includes(tag)));
    }
    if (searchQuery.length > 0) {
      eventCopy = eventCopy.filter((event: any) => event.eventName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setViewEvents(eventCopy);
  }, [filteredEvents, searchQuery]);

  const toggleTag = (tag: string) => {
    if (filteredEvents.includes(tag)) {
      setFilteredEvents((prev) => prev.filter((t) => t !== tag));
    } else {
      setFilteredEvents((prev) => [...prev, tag]);
    }
  }
  
  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", backgroundColor: "#ffffff" }}
    >
      <View className="w-[90%]">
        <Text className="text-[30px] font-bold">RIT Events</Text>
        <Input placeholder="Search events..."  className="mt-[10px]" value={searchQuery} onChangeText={setSearchQuery} />
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerClassName="mb-[10px]">
          {eventTags.map((tag: string, index: number) =>
            <EventTagButton tag={tag} onPress={() => toggleTag(tag)} key={index} isSelected={filteredEvents.includes(tag)} />) }
        </ScrollView>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, width: "100%" }}
        >
          {viewEvents.map((event: any, index: number) => (
            <EventContainer event={event} key={index} />
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
