import { View, Image, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const typeRedef: { [key: string]: string } = {
    "restaurant": "Restaurant",
    "coffee": "Cafe",
    "grocery": "Market",
}

export default function RestaurantContainer(props: {
    restaurantData: {
        id: string,
        name: string,
        code: string,
        image: string,
        bannerImage: string,
        type: string,
        open: boolean,
        hoursOfOperations: { [day: string]: string[] }
    }
}) {
    const router = useRouter();
    const restaurantHours = props.restaurantData["hoursOfOperations"][daysOfWeek[new Date().getDay() - 1]];
    const [closestRelevantHour, setClosestRelevantHour] = useState(""); // If restaurant is closed, this means when the next time it will open. If the restaurant is open, this will be when the restaurant closes

    const [open, setOpen] = useState(false);

    useEffect(() => {
        for (let hours = 0; hours < restaurantHours.length; hours++) {
            let [openTime, closeTime] = restaurantHours[hours].split(" - ");
            if (openTime.toLowerCase() == "open 24 hours") {
                setClosestRelevantHour("Open 24 Hours");
                break;
            }
            if(openTime == "Closed" && closeTime == undefined) {
                setClosestRelevantHour("Closed");
                break;
            }
            let addTwelveOpen = openTime.includes("pm") && !openTime.includes("12") ? 12 : 0;
            let addTwelveClose = closeTime.includes("pm") && !closeTime.includes("12") ? 12 : 0;
            let [openHour, openMinute] = openTime.split(":").map(e => parseInt(e));
            let [closeHour, closeMinute] = closeTime.split(":").map(e => parseInt(e));
            let dateNow = new Date().getTime();
            let dateOpen = new Date().setHours(openHour + addTwelveOpen, openMinute);
            let dateClose = new Date().setHours(closeHour + addTwelveClose, closeMinute)

            if (dateOpen.valueOf() < dateNow.valueOf() && dateNow.valueOf() < dateClose.valueOf()) {
                setClosestRelevantHour(closeTime);
                setOpen(true);
                break;

            } else {

                if (hours + 1 >= restaurantHours.length) {
                    setClosestRelevantHour(props.restaurantData["hoursOfOperations"][daysOfWeek[new Date().getDay()]][0].split(" - ")[0]); // Get the open time of the first time slot of the next day
                    break;
                } else {
                    let nextOpenTime = restaurantHours[hours + 1].split(" - ")[0];
                    let [nextOpenHour, nextOpenMinute] = nextOpenTime.split(":").map(e => parseInt(e));
                    let addTwelveNextOpen = nextOpenTime.includes("pm") && !nextOpenTime.includes("12") ? 12 : 0;
                    let dateNextOpen = new Date().setHours(nextOpenHour + addTwelveNextOpen, nextOpenMinute);
                    if (dateNow.valueOf() < dateNextOpen.valueOf()) {
                        setClosestRelevantHour(nextOpenTime);
                        break;
                    }
                }
            }
        }
    }, [props.restaurantData]);

    const gotoRestaurantPage = () => {
        router.navigate(`/dining/restaurant?restaurantID=${props.restaurantData.id}&restaurantCode=${props.restaurantData.code}&restaurantName=${encodeURIComponent(props.restaurantData.name)}&restaurantIcon=${encodeURIComponent(props.restaurantData.image)}&bannerImage=${encodeURIComponent(props.restaurantData.bannerImage)}`);
    }

    return (
        <TouchableOpacity style={{ width: "90%", height: 120, marginBottom: 20, alignItems: "center", flexDirection: "row" }} onPress={gotoRestaurantPage}>
            <Image source={{ uri: props.restaurantData.image }} style={{ height: 120, width: 120, borderRadius: 5 }} />
            <View style={{ height: "80%", width: "100%", flex: 1, flexWrap: 'wrap', paddingLeft: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", width: 200 }} numberOfLines={2} ellipsizeMode="tail">{props.restaurantData.name}</Text>
                <Text style={{ fontSize: 17, color: open ? "green" : "red", }}>{open ? "Open" : "Closed"} {closestRelevantHour != "Closed" ? "until " + closestRelevantHour : ""} </Text>
                <Text style={{ fontSize: 17 }}>{typeRedef[props.restaurantData.type]}</Text>
            </View>
        </TouchableOpacity>
    )
}
