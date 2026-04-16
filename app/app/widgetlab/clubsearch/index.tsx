import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, ScrollView, FlatList, Image, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import BackChevron from "@/components/svgs/BackChevron";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { buildApiUrl } from "@/lib/api";
import ClubContainer from "@/components/widgetlab/clubs/ClubContainer";

export default function ClubSearch() {
    const navigator = useRouter();

    const [clubList, setClubList] = useState<any[]>([]);
    const [loadedClubs, setLoadedClubs] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        fetch(buildApiUrl("/clubs"))
            .then(res => res.json())
            .then(data => { setClubList(data["data"]); setLoadedClubs(true); })
            .catch(err => { console.error("Error fetching clubs:", err); });
    }, []);

    const filterClub = (inputEvent: any) => {
        setSearchQuery(inputEvent.nativeEvent.text);

        console.log("Searching for clubs with the search query: ", searchQuery);
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
            {/* <ScrollView className="mt-4 h-full">
        
	    </ScrollView> */}
            <FlatList
                data={clubList.slice(0,10)}
                numColumns={3}
                contentContainerStyle={{ flex:1}}
                columnWrapperStyle={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <ClubContainer club={item} />}
            />

        </View>
    </SafeAreaView>
}
