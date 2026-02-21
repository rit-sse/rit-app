import { View } from "react-native"
export default function RestaurantContainerSkeleton(props: {style?: any}) {
    return (
        <View style={{width: "90%", height: 100, backgroundColor: "lightgray", borderRadius: 10, marginBottom: 20, justifyContent: "center", alignItems: "center", ...props.style }}>
            
        </View>
    )
}
