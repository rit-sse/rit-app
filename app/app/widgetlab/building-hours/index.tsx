import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import SearchIcon from "@/components/svgs/SearchIcon";
import FeaturedLocationCard from "@/components/widgetlab/building-hours/FeaturedLocationCard";
import FeaturedLocationCardSkeleton from "@/components/widgetlab/building-hours/FeaturedLocationCardSkeleton";
import LocationRow from "@/components/widgetlab/building-hours/LocationRow";
import LocationRowSkeleton from "@/components/widgetlab/building-hours/LocationRowSkeleton";
import {
    featuredLocationType,
    liveLocationType,
    locationType,
} from "@/components/widgetlab/building-hours/types";
import { buildApiUrl } from "@/lib/api";
import { openLink } from "@/lib/utils";
import BackChevron from "@/components/svgs/BackChevron";

// Maps the livetime response's keys to labels, and fixes the display order so
// it doesn't depend on how the server happens to serialize the object.
const FEATURED_LOCATIONS: { id: string; name: string }[] = [
    { id: "wiedman", name: "Wiedman Fitness Center" },
    { id: "wallace", name: "Wallace Library" },
    { id: "atriumSHED", name: "SHED Atrium" },
    { id: "generalSHED", name: "SHED General Makerspace" },
    { id: "textilesSHED", name: "SHED Textiles Makerspace" },
];

// How many list rows to add each time the user reaches the bottom.
const PAGE_SIZE = 20;

const ALL_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

// The API returns a full week; the card only shows today's line.
const todaysHours = (hours: Record<string, string>): string => {
    const today = hours?.[ALL_DAYS[new Date().getDay()]];
    if (!today || today.toLowerCase().includes("closed")) return "Closed today";
    return `Today ${today}`;
};

export default function BuildingHours() {
    const navigator = useRouter();

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [featured, setFeatured] = useState<featuredLocationType[]>([]);
    const [loadedFeatured, setLoadedFeatured] = useState<boolean>(false);
    const [featuredError, setFeaturedError] = useState<boolean>(false);

    const [locations, setLocations] = useState<locationType[]>([]);
    const [loadedLocations, setLoadedLocations] = useState<boolean>(false);
    const [locationsError, setLocationsError] = useState<boolean>(false);
    const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

    useEffect(() => {
        fetch(buildApiUrl("/building-hours/livetime"))
            .then(response => response.json())
            .then(response => {
                const live = response["data"] as Record<string, liveLocationType>;
                setFeatured(
                    FEATURED_LOCATIONS.filter(location => live[location.id]).map(location => ({
                        id: location.id,
                        name: location.name,
                        open: !live[location.id].closed,
                        hours: todaysHours(live[location.id].hours),
                    }))
                );
                setLoadedFeatured(true);
            })
            .catch(error => {
                console.error("Error fetching live building hours:", error);
                setFeaturedError(true);
                setLoadedFeatured(true);
            });

        fetch(buildApiUrl("/building-hours/locations"))
            .then(response => response.json())
            .then(response => {
                const data = response["data"] as { title: string; link: string; image: string }[];
                setLocations(
                    data.map(building => ({
                        // The link is the only field guaranteed unique — titles repeat
                        // across buildings (e.g. multiple "Seminar Room" entries).
                        id: building.link,
                        name: building.title,
                        image: building.image || undefined,
                        link: building.link || undefined,
                    }))
                );
                setLoadedLocations(true);
            })
            .catch(error => {
                console.error("Error fetching locations:", error);
                setLocationsError(true);
                setLoadedLocations(true);
            });
    }, []);

    const filteredLocations = useMemo(() => {
        if (searchQuery.trim() === "") return locations;
        return locations.filter(location =>
            location.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, locations]);

    // The whole list arrives in one response, so this paging is purely about how
    // many rows are mounted at once — each one loads a remote image.
    const visibleLocations = useMemo(
        () => filteredLocations.slice(0, visibleCount),
        [filteredLocations, visibleCount]
    );

    // A new search starts from the top, so drop back to a single page.
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [searchQuery]);

    const loadMore = () => {
        setVisibleCount(previous => Math.min(previous + PAGE_SIZE, filteredLocations.length));
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
            <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row", alignSelf: "center" }} >
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { navigator.back(); }}>
                    <BackChevron style={{ width: 40, height: 40 }} color="#000" />
                    <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold", paddingTop: 5 }}>Location Hours</Text>
                </TouchableOpacity>
            </View>
            {
                featuredError ? (
                    <View className="px-[5%] mt-[20px]">
                        <Text className="text-[15px] font-bold color-gray-500">
                            Couldn&apos;t load live hours.
                        </Text>
                    </View>
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="grow-0 mt-[20px]"
                        contentContainerStyle={{ paddingHorizontal: "5%" }}
                    >
                        {loadedFeatured
                            ? featured.map(location => (
                                <FeaturedLocationCard key={location.id} location={location} />
                            ))
                            : Array.from({ length: 3 }).map((_, index) => (
                                <FeaturedLocationCardSkeleton key={index} />
                            ))}
                    </ScrollView>
                )
            }

            <View className="px-[5%] mt-[30px] flex-1">
                <Text className="text-[15px] font-bold color-gray-400 mb-[12px]">
                    ALL LOCATIONS
                </Text>

                <View className="flex-row items-center bg-white rounded-[16px] px-[16px] mb-[12px]">
                    <SearchIcon color="#9ca3af" style={{ width: 22, height: 22 }} />
                    <Input
                        className="flex-1 h-[52px] border-0 bg-transparent shadow-none text-[18px]"
                        placeholder="Search locations"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {locationsError ? (
                    <Text className="text-[15px] font-bold color-gray-500">
                        Couldn&apos;t load locations.
                    </Text>
                ) : loadedLocations ? (
                    <FlatList
                        data={visibleLocations}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <LocationRow
                                location={item}
                                onPress={location =>
                                    location.link ? openLink(location.link, navigator) : undefined
                                }
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            visibleCount < filteredLocations.length ? <LocationRowSkeleton /> : null
                        }
                        ListEmptyComponent={
                            <Text className="text-[15px] font-bold color-gray-500">
                                No locations match &quot;{searchQuery}&quot;.
                            </Text>
                        }
                    />
                ) : (
                    Array.from({ length: 6 }).map((_, index) => (
                        <LocationRowSkeleton key={index} />
                    ))
                )}
            </View>
        </SafeAreaView >
    );
}
