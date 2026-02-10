import { View, Image, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router";
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const typeRedef: {[key: string]: string} = {
    "restaurant": "Restaurant",
    "coffee": "Cafe",
    "grocery": "Market",
}

export default function RestaurantContainer(props: {restaurantData: {
    id: string,
    name: string,
    image: string,
    type: string,
    open: boolean,
    hoursOfOperations: { [day: string]: string }
}}) {
    const router = useRouter();
    const restaurantHours = props.restaurantData["hoursOfOperations"][daysOfWeek[new Date().getDay() - 1]];
    const isOpenToday = restaurantHours !== "Closed";
    const openUntil = restaurantHours.split("-")[1]?.trim();

    const gotoRestaurantPage = () => {
        router.navigate(`/dining/restaurant?restaurantID=${props.restaurantData.id}&restaurantName=${encodeURIComponent(props.restaurantData.name)}`);
    }

    return (
        <TouchableOpacity style={{width: "90%", height: 120, marginBottom: 20, alignItems: "center", flexDirection: "row"}} onPress={gotoRestaurantPage}>
            <Image source={{uri: props.restaurantData.image}} style={{height:120, width:120, borderRadius: 5}} />
            <View style={{height: "80%", width:"100%", flex:1, flexWrap: 'wrap', paddingLeft: 15}}>
                <Text style={{fontSize: 18, fontWeight: "bold", width:200}} numberOfLines={2} ellipsizeMode="tail">{props.restaurantData.name}</Text>
                <Text style={{fontSize: 17, color: props.restaurantData.open ? "green" : "red",}}>{props.restaurantData.open ? "Open" : "Closed"}  
                    {isOpenToday && openUntil ?
                        <>
                            {" until "}
                            <Text style={{fontSize: 17, fontWeight: "bold"}}>{openUntil}</Text>
                        </>
                        : null
                    }
                </Text>
                <Text style={{fontSize: 17}}>{typeRedef[props.restaurantData.type]}</Text>
            </View>
        </TouchableOpacity>
    )
}
