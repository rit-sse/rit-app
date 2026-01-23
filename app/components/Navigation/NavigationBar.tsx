import { View } from "react-native"
import HomeIcon from "../svgs/HomeIcon"
import MapIcon from "../svgs/MapIcon"
import GridIcon from "../svgs/GridIcon"
import CalendarIcon from "../svgs/CalendarIcon"
import DefaultProfileIcon from "../svgs/DefaultProfile"
import NavigationButton from "./NavigationButton"
import { useRouter } from "expo-router"

export default function NavigationBar(props: { onScreen: string }) {
    const router = useRouter();
    return (
        <View style={{
            position: "absolute", width: "90%", height: 80, bottom: 35, left: "50%", transform: [{ translateX: "-50%" }], backgroundColor: "#000", borderRadius: 14
            , shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 4.65,
            flex: 1,
            paddingTop: 15,
            paddingBottom: 15,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center"
        }}>
            <HomeIcon onPress={() => {console.log("Home pressed")}} style={{height: 40, width: 40}}/>
            <MapIcon onPress={() => {router.navigate("/map"); console.log("Map pressed")}} style={{height: 40, width: 40}} fill="#888"/>
            <GridIcon onPress={() => {console.log("Grid pressed")}} style={{height: 40, width: 40}} fill="#888"/>
            <CalendarIcon onPress={() => {console.log("Calendar pressed")}} style={{height: 40, width: 40}} fill="#888"/>
            <DefaultProfileIcon onPress={() => {console.log("Profile pressed")}} style={{height: 40, width: 40}}/>
        </View>
    )
}