
import BackChevron from "@/components/svgs/BackChevron";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { backToProfile } from "../profile";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function terms() {
  const navigator = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
      <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { backToProfile(navigator); }}>
          <BackChevron style={{ width: 40, height: 40 }} color="#000" />
          <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold" }}>Terms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}