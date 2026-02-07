import { View, Dimensions } from "react-native"
import HomeIcon from "../svgs/HomeIcon"
import MapIcon from "../svgs/MapIcon"
import GridIcon from "../svgs/GridIcon"
import CalendarIcon from "../svgs/CalendarIcon"
import DefaultProfileIcon from "../svgs/DefaultProfile"
import NavigationButton from "./NavigationButton"
import { useRouter } from "expo-router"
import React, { useState, useRef } from "react"
import Svg, { G, Path } from "react-native-svg";
import * as GLOBAL from "../../app/globals"

export default function NavigationBar(props: { onScreen: string, setOnScreen: Function, navigateFunc: Function }) {
    const router = useRouter();

    const [navBarVisibility, setNavBarVisibility] = useState<boolean>(true);
    const navbarRef = useRef<View>(null);
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
    const buttonRefs: { [key: string]: React.RefObject<Svg> | React.RefObject<null> } = {
        "home": useRef(null),
        "map": useRef(null),
        "grid": useRef(null),
        "calendar": useRef(null),
        "profile":useRef(null),
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
    
    const STARTINGSLIDE = (Dimensions.get("window").width)/28.6666666666666666667
    const SLIDE_COEFFICIENT = (Dimensions.get("window").width) / 5.60625814863; // Calculated constant to make the sliding bar align with icons. I used a percentage of my screen width to make it more adaptable to different screen sizes.
    const [currentSelectedPosition, setCurrentSelectedPosition] = useState<number>(STARTINGSLIDE);

    const initiateSlidingSelectBar = (toScreen: string) => {

        // const targetPosition = STARTINGSLIDE + (buttonRefs[toScreen](SLIDE_COEFFICIENT));

        let targetPosition = 0;
        let navbarWidth = 0;
        let navbarPageX=0;
        if(navbarRef.current) {
            navbarRef.current.measure((x, y, width, height, pageX, pageY) => {
                navbarWidth = width;
                navbarPageX = pageX;
                console.log("navbar", x,y,width,height,pageX,pageY);
            });
        }
        if(buttonRefs[toScreen].current) {
            buttonRefs[toScreen].current?.measure((x, y, width, height, pageX, pageY) => {
                targetPosition = pageX + width/2 - navbarWidth + 5; // 25 is half the width of the sliding bar
                console.log("button", x,y,width,height,pageX,pageY);
            });
        }

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
            <HomeIcon onPress={() => {navigateTo("")}} style={{height: 40, width: 40}} fill={(props.onScreen === "home" ? "#FFFFFF" : "#888")} setRef={buttonRefs["home"]}/>
            <MapIcon onPress={() => {navigateTo("map")}} style={{height: 40, width: 40}} fill={(props.onScreen === "map" ? "#FFFFFF" : "#888")} setRef={buttonRefs["map"]}/>
            <GridIcon onPress={() => {navigateTo("grid")}} style={{height: 40, width: 40}} fill={(props.onScreen === "grid" ? "#FFFFFF" : "#888")}  setRef={buttonRefs["grid"]}/>
            <CalendarIcon onPress={() => {navigateTo("calendar")}} style={{height: 40, width: 40}} fill={(props.onScreen === "calendar" ? "#FFFFFF" : "#888")} setRef={buttonRefs["calendar"]}/>
            <DefaultProfileIcon onPress={() => {navigateTo("profile")}} style={{height: 40, width: 40}} setRef={buttonRefs["profile"]}/>
            <View style={{position: "absolute", height: 6, width: 50, backgroundColor: "#F76902", borderRadius: 5, bottom: 7, left: currentSelectedPosition, shadowOffset: {width:0, height:0}, shadowOpacity: 0.9, shadowRadius: 4, shadowColor: "#F76902"}} ref={navbarRef}>

            </View>
        </View>
    )
}