import React, {useEffect} from "react";
import { View, Image, Text, TouchableOpacity } from "react-native"
import { gridBox, openLink } from "@/lib/utils";
import { resourceController } from "../resourcefetch";
import { useRouter } from "expo-router";
export default function RecentlyViewedButton({item}: {item:gridBox}) {
    const routeNavigator = useRouter();

    useEffect(() => {
        console.log(item);
    }, [item])
    const imageSource = resourceController[item.imageID];

    const pressHandler = () => {
        openLink(item.link, routeNavigator);
    }

     return <TouchableOpacity activeOpacity={0.6} onPress={pressHandler} className="rounded-lg w-[60px] h-[60px] bg-gray-200 mr-3 flex items-center justify-center">
        <Image source={imageSource} className="w-4/6 h-4/6"/>
    </TouchableOpacity>;
}