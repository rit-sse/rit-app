import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { buildApiUrl } from "@/lib/api";

import globals from "../globals";
import { View, Image, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import BackChevron from "@/components/svgs/BackChevron";

const sameDate = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

export default function EventViewer() {
    const router = useRouter();
    const useSafeArea = useSafeAreaInsets();
    const { eventID } = useLocalSearchParams();
    const [eventData, setEventData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [sameDatebool, setSameDatebool] = useState<boolean>(false);

    const [startDateState, setStartDateState] = useState<Date>(new Date());
    const [endDateState, setEndDateState] = useState<Date>(new Date());

    useEffect(() => {
        console.log("Event ID:", eventID);
        if (eventID != undefined) {
            fetch(buildApiUrl(`/events/getinfo?eventID=${eventID}`), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            })
                .then(response => response.json())
                .then(data => {
                    let dataParsed = data["data"];
                    console.log("Event Info:", dataParsed);
                    setEventData(dataParsed);
                    setLoading(false);

                    if(sameDate(new Date(dataParsed["startDate"]), new Date(dataParsed["endDate"]))) {
                        setSameDatebool(true);
                    }
                    setStartDateState(new Date(dataParsed["startDate"]));
                    setEndDateState(new Date(dataParsed["endDate"]));
                })
                .catch(error => {
                    console.error("Error fetching event info:", error);
                    setLoading(false);
                });
        }
    }, [])

    function goBack() {
        router.back();
        globals.showNavbar? globals.showNavbar(true) : null;
    }

    return (
        <>
            <SafeAreaView style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 10 }}>
                <TouchableOpacity onPress={goBack} style={{ backgroundColor: "rgba(0,0,0,.6)", width: 50, height: 50, borderRadius: 200, left: "5%", justifyContent: "center", alignItems: "center" }}>
                    <BackChevron color="white" style={{ width: 40, height: 40, borderRadius: 200, left: "-5%" }} />
                </TouchableOpacity>
            </SafeAreaView>

            <View style={{ flex: 1, alignItems: "center" }}>    
                {
                    loading ? (
                        <Text className="text-white text-[20px]">Loading...</Text>
                    ) : (
                        <>

                            <Image style={{ width: Dimensions.get("screen").width, height: 200 + useSafeArea.top, borderRadius: 0, borderWidth: 0, borderColor: "#F76902" }}
                                source={{ uri: eventData["image"] ? eventData["image"][0] : undefined }} />
                            <ScrollView className={`w-full px-[5%] pt-[15px] pb-[${useSafeArea.bottom + 300}px]`} style={{ backgroundColor: "rgb(24, 24, 24)" }}>
                                <Text className="text-white text-[25px] font-bold">{eventData["name"]}</Text>
                                <Text className="text-white text-[16px]">by {eventData["organizer"]}</Text>
                                <View className="w-full h-[1px] bg-white mt-[15px]" />
                                <Text className="text-white text-[16px] mt-[10px]">{eventData["description"]}</Text>
                                <View className="flex-row items-center mt-[15px] w-full">
                                    <Image source={require("@/assets/icons/location-white.png")} className="w-[30px] h-[30px]" />
                                    <Text className="ml-[10px] text-[15px] text-white text-[16px] mt-[5px] w-4/5">{eventData["location"]["name"]}</Text>
                                </View>
                                <View className="flex-row items-center mt-[15px] w-full">
                                    <Image source={require("@/assets/icons/time-white.png")} className="w-[30px] h-[30px]" />
                                    {
                                        sameDatebool ? (
                                            <Text className="ml-[10px] text-[15px] text-white text-[16px] mt-[5px] w-4/5">{startDateState.toDateString()} from {startDateState.toLocaleTimeString()} to {endDateState.toLocaleTimeString()}</Text>
                                        ) : (
                                            <Text className="ml-[10px] text-[15px] text-white text-[16px] mt-[5px] w-4/5">{startDateState.toLocaleDateString()} from {startDateState.toTimeString()} to {endDateState.toLocaleDateString()} {endDateState.toLocaleTimeString()}</Text>
                                        )
                                    }
                                </View>
                            </ScrollView>
                        </>
                    )
                }
            </View>
        </>
    )
}   