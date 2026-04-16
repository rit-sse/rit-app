import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, Button, TouchableOpacity, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, Linking } from "react-native";
import { use, useEffect, useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import VisitingChef from "@/components/Dining/RestaurantDetailComponents/VisitingChef";
import { buildApiUrl } from "@/lib/api";

export default function RestaurantPage({ route }: { route: any }) {
    const router = useRouter();

    const HEIGHT_INITIAL = 250;

    const { restaurantID, restaurantName, restaurantCode, restaurantIcon, bannerImage } = useLocalSearchParams();
    const [bannerHeight, setBannerHeight] = useState(HEIGHT_INITIAL);
    const [offset, setOffset] = useState(0);
    const [pastOffset, setPastOffset] = useState(0);
    const [restaurantData, setRestaurantData] = useState<{
        name: string,
        visitingchefs: [],
        isFDMealPlanner?: boolean,
        moreInfoLink?: string,
        hoursOfOperations: { [day: string]: string }
    }>(
        {
            isFDMealPlanner: false,
            moreInfoLink: "",
            name: "",
            visitingchefs: [],
            hoursOfOperations: {}
        }
    );
    const [visitingChefsAreHere, setVisitingChefsAreHere] = useState(false);
    const [chefs, setChefs] = useState<{
        name: string,
        category: string,
        name_note: string,
        description: string
    }[]>([]);

    const featuredCards = [
        {
            id: "halal-n-out",
            title: "Halal n Out",
            subtitle: "Middle Eastern Favorites",
            time: "2-7p.m.",
        },
    ];

    // useEffect(() => {
    //     fetch(`http://localhost:3000/dining/menu?store=${restaurantCode}`)
    //         .then(response => response.json())
    //         .then(data => {
    //             setMenu(data["data"]["menu"]);
    //             setCategories(data["data"]["categories"]);
    //             setLoadedMenu(true);
    //             console.log(data["data"]["menu"])
    //         })
    //         .catch(error => console.error("Error fetching menu data:", error));
    // }, [restaurantCode]);

    useEffect(() => {
        fetch(buildApiUrl("/dining/restaurantdetail", { restaurantCode: String(restaurantCode) }))
            .then(response => response.json())
            .then(data => {
                setRestaurantData(data["data"]);
                if (data["data"]["visitingchefs"] && data["data"]["visitingchefs"].length > 0) {
                    setVisitingChefsAreHere(true)
                    setChefs(data["data"]["visitingchefs"][0]["menus"])
                }
            })
            .catch(error => console.error("Error fetching restaurant details:", error));
    }, [restaurantCode, chefs, restaurantData, visitingChefsAreHere]);

    function seeMenu() {
        if (restaurantData.isFDMealPlanner) {
            // Fellas, if you are combing through this code and you see this monstrosity, I am so sorry for your eyes.
            // The alternative was refetching from server, async storage, or passing through a gazillion params. I chose the latter.
            // AsyncStorage would be a nightmare to manage cache and store, refetching from server could help but then we are just getting the same data twice
            // So here, this is the solution.
            // Sorry
            router.push(`/dining/menu?restaurantCode=${restaurantCode}&restaurantName=${restaurantName}&restaurantID=${restaurantID}&restaurantIcon=${restaurantIcon}&bannerImage=${bannerImage}`);
        } else if (restaurantData.moreInfoLink) {
            Linking.openURL(restaurantData.moreInfoLink);
        }
    }

    const styles = StyleSheet.create({
        bannerImage: {
            width: "100%",
            height: bannerHeight - offset,
            position: "relative",
            zIndex: 5
        },
    });

    const onScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (event.nativeEvent.contentOffset.y > 0) {
            setOffset(Math.min(90, event.nativeEvent.contentOffset.y));
        } else {
            setOffset(0);
        }

        if (event.nativeEvent.contentOffset.y != pastOffset) {
            setPastOffset(event.nativeEvent.contentOffset.y);
        }
    }

    const goBack = () => {
        router.dismissTo("/dining/search")
    }

    return (
        <View style={{ flex: 1, alignItems: "center" }}>
            <TouchableOpacity onPress={goBack} style={{ position: "absolute", top: 50, left: 20, zIndex: 10 }} onPressOut={goBack}>
                <BackChevron style={{ width: 40, height: 40 }} color="#fff" />
            </TouchableOpacity>
            <View style={styles.bannerImage}>
                <Image source={{ uri: bannerImage as string }} style={{ width: "100%", height: "100%" }} />
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000", opacity: 0.2 }} />
                <Image source={{ uri: restaurantIcon as string }} style={{ width: 120, height: 120, borderRadius: 8, position: "absolute", bottom: -60, left: 20, backgroundColor: "#F76902", padding: 4 }} />
            </View>
            <View style={{ width: "100%", padding: 10, flex: 1, alignItems: "center", zIndex: 1 }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", width: Dimensions.get("screen").width * .9, paddingBottom: 150 }} onScroll={onScrollHandler}>
                    <View style={{ marginTop: 60 }}></View>
                    {visitingChefsAreHere ? <><Text style={{ fontSize: 25, color: "#F76902", alignSelf: "flex-start" }}>Visiting Chefs</Text>
                        <ScrollView horizontal contentContainerStyle={{ minWidth: Dimensions.get("screen").width * .9, height: 120, marginTop: 5 }} showsHorizontalScrollIndicator={false}>
                            {
                                chefs.length > 0 ? chefs.map((chef, index) => (
                                    <VisitingChef key={index} chef={chef} />
                                )) : (
                                    <Text style={{ fontSize: 20, color: "#111" }}>No visiting chefs currently scheduled.</Text>
                                )
                            }
                        </ScrollView></> : null}
                    {restaurantData.moreInfoLink != undefined ? <View style={{ width: "100%", flex: 1, alignItems: "center", marginTop: 15 }}>
                        <TouchableOpacity style={{ paddingHorizontal: 18, paddingVertical: 15, backgroundColor: "#F76902" }} onPress={() => seeMenu()}>
                            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>See Full Menu</Text>
                        </TouchableOpacity>
                    </View> : null}
                    <Text style={{ fontSize: 25, color: "#F76902", alignSelf: "flex-start", marginTop: 20 }}>Hours of Operation</Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Sunday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Sunday"] ?? ""}</Text></Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Monday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Monday"] ?? ""}</Text></Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Tuesday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Tuesday"] ?? ""}</Text></Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Wednesday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Wednesday"] ?? ""}</Text></Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Thursday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Thursday"] ?? ""}</Text></Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Friday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Friday"] ?? ""}</Text></Text>
                    <Text style={{ width: "100%", marginTop: 8 }}><Text style={{ fontWeight: "bold", color: "#F76902", fontSize: 16 }}>Saturday:</Text> <Text style={{ fontSize: 14 }}>{restaurantData?.hoursOfOperations?.["Saturday"] ?? ""}</Text></Text>
                </ScrollView>

            </View>

        </View >
    )
}
