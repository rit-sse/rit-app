import { View, Text, Dimensions } from "react-native"

export default function VisitingChef({ chef }: {
    chef: {
        name: string,
        category: string,
        name_note: string,
        description: string
    }
}) {
    return (
        <View style={{ width: Dimensions.get("screen").width * 0.7, height: "100%", paddingHorizontal: 4 }}>

            <View
                style={{
                    flex: 1,
                    borderWidth: 2,
                    borderColor: "#A5A5A5",
                    borderRadius: 12,
                    backgroundColor: "#F3F3F3",
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    justifyContent: "space-between",
                }}
            >
                <View>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: "#111" }}>{chef.name}</Text>
                    <Text style={{ fontSize: 15, color: "#111" }}>{chef.description}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111" }}>{chef.name_note}</Text>
            </View>
        </View>
    )
}