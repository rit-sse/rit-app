import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, Button, TouchableOpacity, Dimensions, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { use, useEffect, useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import CategoryContainer from "@/components/Dining/Search/CategoryContainer";
import { buildApiUrl } from "@/lib/api";

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
        conditionals: string[]
    }[]>([]);
    const [viewMenu, setViewMenu] = useState<{
        name: string,
        calories: string,
        category: string,
        allergens: string[],
        conditionals: string[]
    }[]>([]);
    const [onCategory, setCategory] = useState<string>("");
    const [onConditional, setConditional] = useState<string>("");
    const [loadedMenu, setLoadedMenu] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    // Sorts categories by importance. Highest is prioritized
    const categoryWeights: { [key: string]: number } = {
        "Entree": 10,
        "Salads": 9,
        "Wraps": 8,
        "Soups": 7,
        "Bowls": 6,
        "Hot Sandwiches": 5,
        "Sandwiches": 4,
        "Pizza": 3,
        "Side": 2,
        "Sides": 2,
        "Other": 0
    }

    useEffect(() => {
        setMenu([]);
        setViewMenu([]);
        setCategories([]);
        setCategory("");
        setLoadedMenu(false);
        fetch(buildApiUrl(`/dining/menu?store=${restaurantCode}`))
            .then(response => response.json())
            .then(data => {
                setMenu(data["data"]["menu"]);
                setViewMenu(data["data"]["menu"]);

                let categories = data["data"]["categories"];
                categories.sort((a: string, b: string) => {
                    let weightA = categoryWeights[a] || 0;
                    let weightB = categoryWeights[b] || 0;
                    return weightB - weightA;
                });
                setCategories(categories);
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

    const filterChanged = (category: string, conditional: string) => {
        let filteredMenu = menu;
        console.log(conditional)
        if (category !== "") {
            filteredMenu = filteredMenu.filter(item => item.category === category);
        }
        switch (conditional) {
            case "Vegan":
                filteredMenu = filteredMenu.filter(item => item.conditionals.includes("Vegan"));
                break;
            case "Vegetarian":
                filteredMenu = filteredMenu.filter(item => item.conditionals.includes("Vegetarian"));
                break;
            case "No Pork":
                filteredMenu = filteredMenu.filter(item => !item.conditionals.includes("Pork"));
                break;
        }
        setCategory(category);
        setConditional(conditional);
        setViewMenu(filteredMenu);
    }
    const resetConditional = () => {
        setConditional("");
        filterChanged(onCategory, "");
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
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", paddingLeft: 150} }>
                        {/* <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }} onPress={() => filterChanged(onCategory, "Vegan")}>
                            <Text style={{ fontSize: 20 }}>Vegan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }} onPress={() => filterChanged(onCategory, "Vegetarian")}>
                            <Text style={{ fontSize: 20 }}>Vegetarian</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }} onPress={() => filterChanged(onCategory, "No Pork")}>
                            <Text style={{ fontSize: 20 }}>No Pork</Text>
                        </TouchableOpacity> */}
                        {
                            ["Vegan", "Vegetarian", "Pork"].map((cond, index) => (
                                // <ConditionalContainer key={index} conditionalName={cond} filterChange={filterChanged} isInConditional={onConditional === cond} />
                                // Above was an attempt to make a separate component, but it ended up bringing more trouble. (Speciically, categories variable access)
                                <TouchableOpacity key={index} style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)", backgroundColor: cond == onConditional ? "#F76902" : "" }} onPress={() => {cond === onConditional ? resetConditional() : filterChanged(onCategory, cond)}}>
                                    <Text style={{ fontSize: 20, ...(cond == onConditional ? { color: "#fff", fontWeight: "bold" } : { color: "#000", fontWeight: "normal" }) }}>{cond}</Text>
                                </TouchableOpacity>
                            ))
                        }
                    </ScrollView>

                </View>
                <View style={{ width: "95%"}}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
                        {
                            loadedMenu ? categories.map((category, index) => (
                                <CategoryContainer key={index} categoryName={category} onClick={() => filterChanged(category, onConditional)} isInCategory={onCategory === category} />
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
                        loadedMenu ? viewMenu.map((item, index) => (
                            item.name === "" ? <></> : 
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