import { View, Image, Text } from "react-native"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function RestaurantContainer(props: {restaurantData: any}) {
    
    const restaurantHours = props.restaurantData["hoursOfOperations"][daysOfWeek[new Date().getDay() - 1]];
    const isOpenToday = restaurantHours !== "Closed";
    const openUntil = restaurantHours.split("-")[1]?.trim();

    return (
        <View style={{width: "90%", height: 120, marginBottom: 20, alignItems: "center", flexDirection: "row"}}>
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
            </View>
        </View>
    )
}
