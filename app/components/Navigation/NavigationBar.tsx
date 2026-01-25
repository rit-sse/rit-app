import { View } from "react-native"
import HomeIcon from "../svgs/HomeIcon"
import MapIcon from "../svgs/MapIcon"
import GridIcon from "../svgs/GridIcon"
import CalendarIcon from "../svgs/CalendarIcon"
import DefaultProfileIcon from "../svgs/DefaultProfile"
import NavigationButton from "./NavigationButton"
import { useRouter } from "expo-router"
import { useState } from "react"
import * as GLOBAL from "../../app/globals"

export default function NavigationBar(props: { onScreen: string, setOnScreen: Function, navigateFunc: Function }) {
    const router = useRouter();

    const [navBarVisibility, setNavBarVisibility] = useState<boolean>(true);
    const [navbarAnimationPlaying, setNavbarAnimationPlaying] = useState<boolean>(false);
    const [navbarPosition, setNavbarPosition] = useState<number>(35);
    const [navbarIntervalId, setNavbarIntervalId] = useState<number | null>(null);
    const [navbarDirection, setNavbarDirection] = useState<"hiding" | "showing" |  "notplaying">("notplaying");
    const navbarHidePosition = -100;
    const navbarShowPosition = 35;
    GLOBAL.default.navbar = {
        setState: (state: { navBarVisibility: boolean }) => {
            setNavBarVisibility(state.navBarVisibility);
        }
    }
    const pageWeights: { [key: string]: number } = {
        "home": 0,
        "map": 1,
        "grid": 2,
        "calendar": 3,
        "profile": 4
    }

    const toggleNavbar = (show: boolean) => {
        if(show && navbarDirection == "showing") return;
        if(!show && navbarDirection == "hiding") return;
        if(navbarAnimationPlaying) {
            clearInterval(navbarIntervalId!);
        };
        setNavbarAnimationPlaying(true);
        setNavbarDirection(show ? "showing" : "hiding");
        var step = 0;
        const interval = setInterval(() => {
            setNavbarPosition((prevPosition) => {
                
                let newPosition;
                if(show) {
                    newPosition = prevPosition + navbarShowPosition * (1-Math.cos((step * Math.PI)/2));
                } else {
                    newPosition = prevPosition - navbarShowPosition * (Math.sin((step * Math.PI)/2));
                }
                step += .04;
                if(show && newPosition >= navbarShowPosition) {
                    newPosition = navbarShowPosition;
                    clearInterval(interval);
                    setNavbarAnimationPlaying(false);
                    setNavbarDirection("notplaying");
                } else if(!show && newPosition <= navbarHidePosition) {
                    newPosition = navbarHidePosition;
                    clearInterval(interval);
                    setNavbarAnimationPlaying(false);
                    setNavbarDirection("notplaying");
                }
                return newPosition;
            });
        }, 10);
        setNavbarIntervalId(interval as unknown as number);
    }
    GLOBAL.default.showNavbar = toggleNavbar;
    
    const STARTINGSLIDE = 15
    const SLIDE_COEFFICIENT = 76.7
    const [currentSelectedPosition, setCurrentSelectedPosition] = useState<number>(STARTINGSLIDE);

    const initiateSlidingSelectBar = (toScreen: string) => {
        const targetPosition = STARTINGSLIDE + (pageWeights[toScreen] * (SLIDE_COEFFICIENT));
        let snapshotPosition = currentSelectedPosition;
        let step = 0;
        const interval = setInterval(() => {
            step += 0.01;
            // -(.5)cos(pi(x))+.5
            setCurrentSelectedPosition(snapshotPosition + -(currentSelectedPosition - targetPosition)*(-0.5 * Math.cos(5*Math.PI * step) + 0.5));
            if (step > .2) {
                clearInterval(interval);
                setCurrentSelectedPosition(targetPosition);
            }
        }, 10);
    }

    const navigateTo = (screen: string) => {
        props.navigateFunc("/" + screen);
        props.setOnScreen(screen === "" ? "home" : screen);
        initiateSlidingSelectBar(screen === "" ? "home" : screen);
    }
    

    return (
        <View style={{
            position: "absolute", width: "90%", height: 80, bottom: navbarPosition, left: "50%", transform: [{ translateX: "-50%" }], backgroundColor: "#000", borderRadius: 14
            , shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 4.65,
            flex: 1,
            paddingTop: 15,
            paddingBottom: 15,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            display: (navBarVisibility ? "flex" : "none")
        }}>
            <HomeIcon onPress={() => {navigateTo("")}} style={{height: 40, width: 40}} fill={(props.onScreen === "home" ? "#FFFFFF" : "#888")}/>
            <MapIcon onPress={() => {navigateTo("map")}} style={{height: 40, width: 40}} fill={(props.onScreen === "map" ? "#FFFFFF" : "#888")}/>
            <GridIcon onPress={() => {navigateTo("grid")}} style={{height: 40, width: 40}} fill={(props.onScreen === "grid" ? "#FFFFFF" : "#888")}/>
            <CalendarIcon onPress={() => {navigateTo("calendar")}} style={{height: 40, width: 40}} fill={(props.onScreen === "calendar" ? "#FFFFFF" : "#888")}/>
            <DefaultProfileIcon onPress={() => {navigateTo("profile")}} style={{height: 40, width: 40}}/>
            <View style={{position: "absolute", height: 6, width: 50, backgroundColor: "#F76902", borderRadius: 5, bottom: 7, left: currentSelectedPosition, shadowOffset: {width:0, height:0}, shadowOpacity: 0.9, shadowRadius: 4, shadowColor: "#F76902"}}>

            </View>
        </View>
    )
}