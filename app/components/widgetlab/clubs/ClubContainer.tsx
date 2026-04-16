import { resourceController } from "@/components/resourcefetch";
import React from "react"
import { Image, View, Text } from "react-native"

interface clubType { 
    name: string;
    type: string;
    image: string;
    closed: boolean;
    mission: string;
    website: string;

}

export default function ClubContainer({ club }: {club: clubType}) {

    const isDefaultImage = club.image.endsWith("listing-default.png");
    const imageSource = isDefaultImage ? resourceController["default_image"] : club.image;


    return <View>
        {
            isDefaultImage ? 
            <Image source={resourceController["default_image"]} style={{ width: 100, height: 100 }}/> :
            <Image source={{uri: club.image}} style={{ width: 100, height: 100 }}/>

        }
    </View>
}