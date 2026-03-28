import { TouchableOpacity, Text, View } from "react-native";

const HEIGHT = 50;

export default function CategoryContainer({ categoryName }: { categoryName?: string }) {
    return (
        <TouchableOpacity style={{ height: HEIGHT, borderRadius: 7, borderWidth: 2,borderColor: "rgba(0,0,0,0.3)", paddingRight: 15, paddingLeft: 15, marginRight: 10 }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{textAlign: "center", fontSize: 18}}>{categoryName}</Text>
            </View>
        </TouchableOpacity>
    )
}