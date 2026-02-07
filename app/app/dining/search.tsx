import { View, Text, ScrollView, TouchableNativeFeedback, TouchableOpacity } from "react-native"
import { Dimensions } from "react-native"
import RestaurantContainer from "../../components/Dining/Search/RestaurantContainer"
import BackChevron from "../../components/svgs/BackChevron"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import RestaurantContainerSkeleton from "@/components/Dining/Search/RestaurantContainerSkeleton"

export default function DiningSearch() {
    const navigator = useRouter();

    const [restaurants, setRestaurantsData] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/dining")
            .then(response => response.json())
            .then(data => setRestaurantsData(data["data"]["data"]))
            .catch(error => console.error("Error fetching restaurant data:", error));
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60, backgroundColor: "white"}}>
            <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => {navigator.back()}}>
                    <BackChevron fill="#000000" style={{ width: 40, height: 40}} />
                    <Text style={{ paddingLeft: 10, fontSize: 25, fontWeight: "bold" }}>Dining</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ width: Dimensions.get("screen").width, alignItems: "center", paddingBottom: 150 }}>
                {
                    restaurants ? restaurants.map((restaurant: any) => (
                        <RestaurantContainer key={restaurant.id} restaurantData={restaurant} />
                    )) : (
                        <>
                            <RestaurantContainerSkeleton />
                            <RestaurantContainerSkeleton />
                            <RestaurantContainerSkeleton />
                            <RestaurantContainerSkeleton />
                            <RestaurantContainerSkeleton />
                        </>
                    )
                }
            </ScrollView>
        </View>
    )
}