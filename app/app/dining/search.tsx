import { View, Text, ScrollView, TouchableNativeFeedback, TouchableOpacity } from "react-native"
import { Dimensions } from "react-native"
import RestaurantContainer from "../../components/Dining/Search/RestaurantContainer"
import BackChevron from "../../components/svgs/BackChevron"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import RestaurantContainerSkeleton from "@/components/Dining/Search/RestaurantContainerSkeleton"
<<<<<<< HEAD
import { buildApiUrl } from "@/lib/api";
=======
import { buildApiUrl } from "@/lib/api"
>>>>>>> dev/staging

export default function DiningSearch() {
    const navigator = useRouter();

    const [restaurants, setRestaurantsData] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch(buildApiUrl("/dining"))
            .then(response => response.json())
            .then(data => {
                setRestaurantsData(data["data"]["data"]);
                setLoaded(true);
            })
            .catch(error => console.error("Error fetching restaurant data:", error));
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60, backgroundColor: "white" }}>
            <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { navigator.back() }}>
                    <BackChevron style={{ width: 40, height: 40 }} color="#000" />
                    <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold" }}>Dining</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ width: Dimensions.get("screen").width, alignItems: "center", paddingBottom: 150 }}>
                {
                    loaded ? restaurants.map((restaurant: any) => (
                        <RestaurantContainer key={restaurant.id} restaurantData={restaurant} />
                    )) : (
                        <>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <RestaurantContainerSkeleton key={index} style={{ opacity: 1/((index+1)*.6) }}/>
                            ))}
                        </>
                    )
                }
            </ScrollView>
        </View>
    )
}
