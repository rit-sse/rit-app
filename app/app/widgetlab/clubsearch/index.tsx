import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, ScrollView, FlatList, Image, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import BackChevron from "@/components/svgs/BackChevron";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { buildApiUrl } from "@/lib/api";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import ClubContainer from "@/components/widgetlab/clubs/ClubContainer";

export default function ClubSearch() {
    const navigator = useRouter();
    const contentInsets = useSafeAreaInsets();

    const [clubList, setClubList] = useState<any[]>([]);
    const [loadedClubs, setLoadedClubs] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [clubLimit, setClubLimit] = useState<number>(20);
    const [closedStatus, setClosedStatus] = useState<string>("notSelected");
    const [filterView, setFilterView] = useState<any[]>([]);

    useEffect(() => {
        fetch(buildApiUrl("/clubs"))
            .then(res => res.json())
            .then(data => { setClubList(data["data"]); setLoadedClubs(true);})
            .catch(err => { console.error("Error fetching clubs:", err); });
    }, []);
    

    const filterClub = (inputEvent: any) => {
        setSearchQuery(inputEvent.nativeEvent.text);

        console.log("Searching for clubs with the search query: ", searchQuery);
    }
    useEffect(() => {
        let filteredClubs = clubList;
        if (searchQuery && searchQuery.trim() !== "") {
            filteredClubs = filteredClubs.filter(club =>
                club.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (closedStatus !== "notSelected" && closedStatus !== undefined) {
            const isClosed = (closedStatus == "closed");
            filteredClubs = filteredClubs.filter(club => club.closed === isClosed);
        }
        setFilterView(filteredClubs);
    }, [searchQuery, closedStatus, clubList]);

    const onScrollEvent = (scrollEvent: any) => {
        const scrollPosition = scrollEvent.nativeEvent.contentOffset.y;
        const screenHeight = Dimensions.get("window").height;

        const loadThreshold = (screenHeight - scrollPosition) < screenHeight / 2;

        if (loadThreshold) {
            setClubLimit(prevLimit => prevLimit + 20);
        }
    }

    return <SafeAreaView className="flex-1  items-center">
        <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
            <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { navigator.back(); }}>
                <BackChevron style={{ width: 40, height: 40 }} color="#000" />
                <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold", paddingTop: 5 }}>Group Search</Text>
            </TouchableOpacity>
        </View>
        <View className="w-[90%] h-full">
            <Input placeholder="Search" value={searchQuery} onChange={(textEvent) => filterClub(textEvent)} />
            <ScrollView className="py-[10px] mb-[5px]" horizontal={true}>
                <Select onValueChange={(value) => {setClosedStatus(value?.value ? value.value : "notSelected");}} >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Closed Status" />
                    </SelectTrigger>
                    <SelectContent insets={contentInsets} className="w-[140px]">
                        <SelectGroup>
                            <SelectItem value="open" label="Open" />
                            <SelectItem value="closed" label="Closed" />

                        </SelectGroup>
                    </SelectContent>
                </Select>
            </ScrollView>
            <FlatList
                data={filterView}
                numColumns={2}
                contentContainerStyle={{}}
                columnWrapperStyle={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <ClubContainer club={item} />}

                onScroll={onScrollEvent}
            />

        </View>
    </SafeAreaView>
}
