import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, Image, ScrollView, Button, TouchableOpacity } from "react-native";

export default function RestaurantPage({ route }: { route: any }) {
    const router = useRouter();

    const { restaurantID, restaurantName, restaurantIcon, bannerImage } = useLocalSearchParams();

    return (
        <View style={{ flex: 1, alignItems: "center" }}>
            <View style={{ width: "100%", height: 230, position: "relative", zIndex: 5 }}>
                <Image source={{ uri: bannerImage as string }} style={{ width: "100%", height: "100%" }} />
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor:"#000", opacity: 0.2 }} />
                <Image source={{ uri: restaurantIcon as string }} style={{ width: 120, height: 120, borderRadius: 8, position: "absolute", bottom: -60, left: 20, backgroundColor: "#F76902", padding: 4}} />
            </View>
            <View style={{ width: "100%", padding: 10, flex: 1, alignItems: "center", zIndex: 1 }}>
                <View style={{ width: "100%" ,height: 50, marginBottom: 10}}>
                    <ScrollView horizontal contentContainerStyle={{ alignItems: "center", paddingLeft: 150}}>
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
            </View>

        </View>
    )
}