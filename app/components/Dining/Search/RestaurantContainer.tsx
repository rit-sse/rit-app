import { View, Image, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router";
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
        image: string,
        type: string,
        open: boolean,
        hoursOfOperations: { [day: string]: string[] }
    }
}) {
    const router = useRouter();
    const restaurantHours = props.restaurantData["hoursOfOperations"][daysOfWeek[new Date().getDay() - 1]];
    let closestRelevantHour = ""; // If restaurant is closed, this means when the next time it will open. If the restaurant is open, this will be when the restaurant closes

    for (let hours = 0; hours < restaurantHours.length; hours++) {
        let [openTime, closeTime] = restaurantHours[hours].split(" - ");
        if(openTime.toLowerCase() == "open 24 hours") {
            closestRelevantHour = "Open 24 Hours";
            break;
        }
        let addTwelveOpen = openTime.includes("pm") && !openTime.includes("12") ? 12 : 0;
        let addTwelveClose = closeTime.includes("pm") && !openTime.includes("12") ? 12 : 0;
        let [openHour, openMinute] = openTime.split(":").map(e => parseInt(e));
        let [closeHour, closeMinute] = closeTime.split(":").map(e => parseInt(e));
        let dateNow = new Date();
        let dateOpen = new Date().setHours(openHour + addTwelveOpen, openMinute);
        let dateClose = new Date().setHours(closeHour + addTwelveClose, closeMinute)
        if (props.restaurantData.open) {
            if (dateOpen.valueOf() < dateNow.valueOf() && dateNow.valueOf() < dateClose.valueOf()) {
                closestRelevantHour = closeTime;
                break;
            }
        } else {
            
            if(hours + 1 >= restaurantHours.length) {
                closestRelevantHour = props.restaurantData["hoursOfOperations"][daysOfWeek[new Date().getDay()]][0].split(" - ")[0]; // Get the open time of the first time slot of the next day
                break;
            } else {
                let nextOpenTime = restaurantHours[hours + 1].split(" - ")[0];
                let [nextOpenHour, nextOpenMinute] = nextOpenTime.split(":").map(e => parseInt(e));
                let addTwelveNextOpen = nextOpenTime.includes("pm") && !nextOpenTime.includes("12") ? 12 : 0;
                let dateNextOpen = new Date().setHours(nextOpenHour + addTwelveNextOpen, nextOpenMinute);
                if(dateNow.valueOf() < dateNextOpen.valueOf()) {
                    closestRelevantHour = nextOpenTime;
                    break;
                }
            }
        }
    }

    const gotoRestaurantPage = () => {
        router.navigate(`/dining/restaurant?restaurantID=${props.restaurantData.id}&restaurantName=${encodeURIComponent(props.restaurantData.name)}`);
    }

    return (
        <TouchableOpacity style={{ width: "90%", height: 120, marginBottom: 20, alignItems: "center", flexDirection: "row" }} onPress={gotoRestaurantPage}>
            <Image source={{ uri: props.restaurantData.image }} style={{ height: 120, width: 120, borderRadius: 5 }} />
            <View style={{ height: "80%", width: "100%", flex: 1, flexWrap: 'wrap', paddingLeft: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", width: 200 }} numberOfLines={2} ellipsizeMode="tail">{props.restaurantData.name}</Text>
                <Text style={{ fontSize: 17, color: props.restaurantData.open ? "green" : "red", }}>{props.restaurantData.open ? "Open" : "Closed"} until {closestRelevantHour} </Text>
                <Text style={{ fontSize: 17 }}>{typeRedef[props.restaurantData.type]}</Text>
            </View>
        </TouchableOpacity>
    )
}
