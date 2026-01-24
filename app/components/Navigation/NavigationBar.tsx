import { View } from "react-native"
import HomeIcon from "../svgs/HomeIcon"
import MapIcon from "../svgs/MapIcon"
import GridIcon from "../svgs/GridIcon"
import CalendarIcon from "../svgs/CalendarIcon"
import DefaultProfileIcon from "../svgs/DefaultProfile"
import NavigationButton from "./NavigationButton"
import { useRouter } from "expo-router"
import { useState } from "react"

export default function NavigationBar(props: { onScreen: string, setOnScreen: Function, navigateFunc: Function }) {
    const router = useRouter();

    // const onScreen = {
    //     Home: true,
    //     Map: false,
    //     Grid:false,
    //     Calendar: false,
    //     Profile: false
    // }
    const pageWeights = {
        home: 0,
        map: 1,
        grid: 2,
        calendar: 3,
        profile: 4
    }

    const navigateTo = (screen: string) => {
        props.navigateFunc("/" + screen);
        props.setOnScreen(screen === "" ? "home" : screen);
    }
    

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
            <HomeIcon onPress={() => {navigateTo("")}} style={{height: 40, width: 40}} fill={(props.onScreen === "home" ? "#FFFFFF" : "#888")}/>
            <MapIcon onPress={() => {navigateTo("map")}} style={{height: 40, width: 40}} fill={(props.onScreen === "map" ? "#FFFFFF" : "#888")}/>
            <GridIcon onPress={() => {navigateTo("grid")}} style={{height: 40, width: 40}} fill={(props.onScreen === "grid" ? "#FFFFFF" : "#888")}/>
            <CalendarIcon onPress={() => {navigateTo("calendar")}} style={{height: 40, width: 40}} fill={(props.onScreen === "calendar" ? "#FFFFFF" : "#888")}/>
            <DefaultProfileIcon onPress={() => {navigateTo("profile")}} style={{height: 40, width: 40}}/>
        </View>
    )
}