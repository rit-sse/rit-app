import BackChevron from "@/components/svgs/BackChevron";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { backToProfile } from "../profile";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function info() {
  const navigator = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
      <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { backToProfile(navigator); }}>
          <BackChevron style={{ width: 40, height: 40 }} color="#000" />
          <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold" }}>App Information</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 0 }}>Developed by</Text>
      <Image source={require("../../assets/images/credits.png")} style={{ width: "80%",  resizeMode: "contain", marginTop: 10 }} />
      <Text style={{fontSize: 18, width: "80%", textAlign: "center" }}>Check us out at sse.rit.edu</Text>
      <Text style={{fontSize: 20, width: "85%", textAlign: "left", marginTop: 50, fontWeight: "bold" }}>LICENSES</Text>
    </SafeAreaView>
  );
}