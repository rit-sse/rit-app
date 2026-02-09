import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function RestaurantPage({ route }: { route: any }) {
    const router = useRouter();

    const { restaurantID, restaurantName } = useLocalSearchParams();
    
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>{restaurantName}</Text>
        </View>
    )
}