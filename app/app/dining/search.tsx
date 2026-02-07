import {View, Text, ScrollView} from "react-native"
import { Dimensions } from "react-native"

export default function DiningSearch() {
    return(
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ScrollView contentContainerStyle={{ paddingTop:60, width:Dimensions.get("screen").width, alignItems: "center",}}>
                <Text>Dining Search</Text>
                <Text>Dining Search</Text>
                {
                    Array.from({ length: 50 }, (_, i) => (
                        <Text key={i}>Dining Search {i + 1}</Text>
                    ))
                }
            </ScrollView>
        </View>
    )
}