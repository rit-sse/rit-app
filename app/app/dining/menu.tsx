import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, Button, TouchableOpacity, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { use, useEffect, useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import CategoryContainer from "@/components/Dining/Search/CategoryContainer";

export default function Menu({ route }: { route: any }) {
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

    useEffect(() => {
        fetch(`http://localhost:3000/dining/menu?store=${restaurantCode}`)
            .then(response => response.json())
            .then(data => {
                setMenu(data["data"]["menu"]);
                setCategories(data["data"]["categories"]);
                setLoadedMenu(true);
                console.log(data["data"]["menu"])
            })
            .catch(error => console.error("Error fetching menu data:", error));
    }, [restaurantCode]);

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
                <View style={{ width: "100%", height: 50, marginBottom: 10 }}>
                    <ScrollView horizontal contentContainerStyle={{ alignItems: "center", paddingLeft: 150 }}>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }}>
                            <Text style={{ fontSize: 20 }}>Vegan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }}>
                            <Text style={{ fontSize: 20 }}>Vegetarian</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }}>
                            <Text style={{ fontSize: 20 }}>Gluten-Free</Text>
                        </TouchableOpacity>
                    </ScrollView>

                </View>
                <View style={{ width: "95%"}}>
                    <ScrollView horizontal contentContainerStyle={{ alignItems: "center" }}>
                        {
                            loadedMenu ? categories.map((category, index) => (
                                <CategoryContainer key={index} categoryName={category} />
                            )) : <></>
                        }
                    </ScrollView>
                </View>
                <ScrollView contentContainerStyle={{ alignItems: "center", width: Dimensions.get("screen").width * .9, paddingBottom: 150 }} onScroll={onScrollHandler}>

                    {/* {
                        Array.from({ length: 20 }).map((_, index) => (
                            <View key={index} style={{ height: 80, width: "100%", backgroundColor: "rgba(0,0,0,.2)", borderRadius: 5, marginTop: 10 }}></View>

                        ))
                    } */}
                    {
                        loadedMenu ? menu.map((item, index) => (
                            <View key={index} style={{ height: 80, width: "100%", backgroundColor: "rgba(0,0,0,.05)", borderRadius: 5, marginTop: 10, padding: 10 }}>
                                <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
                                <Text style={{ fontSize: 14 }}>{item.calories} calories</Text>
                                <Text style={{ fontSize: 14 }}>Category: {item.category}</Text>
                                <Text style={{ fontSize: 14 }}>Allergens: {item.allergens.join(", ")}</Text>
                            </View>
                        )) : (
                            <>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <View key={index} style={{ height: 80, width: "100%", backgroundColor: "rgba(0,0,0,.1)", borderRadius: 5, marginTop: 10, opacity: 1 / ((index + 1) * .6) }}></View>

                                ))}
                            </>
                        )
                    }
                </ScrollView>
            </View>

        </View >
    )
}