import { TouchableOpacity, Text, View } from "react-native";


export default function CategoryContainer({ categoryName, onClick, isInCategory }: { categoryName?: string, onClick?: () => void, isInCategory?: boolean }) {
    return (
        <TouchableOpacity onPress={onClick} style={{ minHeight: 50, borderRadius: 7, borderWidth: 2,borderColor: isInCategory ? "rgba(0,0,0,0.0)" : "rgba(0,0,0,0.3)", paddingRight: 15, paddingLeft: 15, marginRight: 10, backgroundColor: isInCategory ? "#F76902" : ""}}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text style={{textAlign: "center", fontSize: 18, color: isInCategory ? "#fff" : "#000", fontWeight: isInCategory ? "bold" : "normal"}}>{categoryName}</Text>
            </View>
        </TouchableOpacity>
    )
}