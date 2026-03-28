import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, Button, TouchableOpacity, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { use, useEffect, useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import CategoryContainer from "@/components/Dining/Search/CategoryContainer";
import PagerView from "react-native-pager-view";

export default function RestaurantPage({ route }: { route: any }) {
    const router = useRouter();

    const HEIGHT_INITIAL = 250;

    const { restaurantID, restaurantName, restaurantCode, restaurantIcon, bannerImage } = useLocalSearchParams();
    const [bannerHeight, setBannerHeight] = useState(HEIGHT_INITIAL);
    const [offset, setOffset] = useState(0);
    const [pastOffset, setPastOffset] = useState(0);
    const [menu, setMenu] = useState<{
        name: string,
        calories: string,
        category: string,
        allergens: string[],
    }[]>([]);
    const [loadedMenu, setLoadedMenu] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

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
                    <Text style={{ fontSize: 25, color: "#F76902", alignSelf: "flex-start", marginTop: 60 }}>Visiting Chefs</Text>
                    <ScrollView horizontal contentContainerStyle={{ minWidth: Dimensions.get("screen").width * .9, height: 120, marginTop: 5 }}>
                        <View style={{ width: Dimensions.get("screen").width * 0.7, height: "100%", paddingHorizontal: 4 }}>
                            <View
                                style={{
                                    flex: 1,
                                    borderWidth: 2,
                                    borderColor: "#A5A5A5",
                                    borderRadius: 12,
                                    backgroundColor: "#F3F3F3",
                                    paddingHorizontal: 18,
                                    paddingVertical: 16,
                                    justifyContent: "space-between",
                                }}
                            >
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#111" }}>Halal n' out</Text>
                                    <Text style={{ fontSize: 20, color: "#111" }}>aaa</Text>
                                </View>
                                <Text style={{ fontSize: 20, color: "#111" }}>3:00</Text>
                            </View>
                        </View>
                        <View style={{ width: Dimensions.get("screen").width * 0.7, height: "100%", paddingHorizontal: 4 }}>
                            <View
                                style={{
                                    flex: 1,
                                    borderWidth: 2,
                                    borderColor: "#A5A5A5",
                                    borderRadius: 12,
                                    backgroundColor: "#F3F3F3",
                                    paddingHorizontal: 18,
                                    paddingVertical: 16,
                                    justifyContent: "space-between",
                                }}
                            >
                                <View>
                                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#111" }}>Halal n' out</Text>
                                    <Text style={{ fontSize: 20, color: "#111" }}>aaa</Text>
                                </View>
                                <Text style={{ fontSize: 20, color: "#111" }}>3:00</Text>
                            </View>
                        </View>

                    </ScrollView>
                    <View style={{ width: "100%", flex: 1, alignItems: "center", marginTop: 15 }}>
                        <TouchableOpacity style={{ paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#F76902" }}>
                            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>See Full Menu</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 25, color: "#F76902", alignSelf: "flex-start", marginTop: 10 }}>Hours of Operation</Text>

                </ScrollView>

            </View>

        </View >
    )
}