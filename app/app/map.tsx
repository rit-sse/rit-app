import { View, Text } from "react-native";
import Map from "./map/Map";
import { WebviewLeafletMessage } from 'react-native-leaflet-view';

import GearIcon from "../components/svgs/map/GearIcon";
import BusIcon from "../components/svgs/map/BusIcon";
import BuildingIcon from "../components/svgs/map/BuildingIcon";

function onMapMessage(message: WebviewLeafletMessage) {
    return;
}

export default function map() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Map onMapMessage={onMapMessage}/>

      <View style={{
            position: "absolute", width: 80, height: "30%", bottom: "50%", right: "5%", transform: [{ translateY: "50%" }], backgroundColor: "#FFF", borderRadius: 14
            , shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 4.65,
            flex: 1,
            paddingTop: 15,
            paddingBottom: 15,
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            display: "flex"
        }}>
            <GearIcon onPress={() => {}} style={{height: 40, width: 40}} fill={"#000000"}/>
            <BusIcon onPress={() => {}} style={{height: 40, width: 40}} fill={"#000000"}/>
            <BuildingIcon onPress={() => {}} style={{height: 40, width: 40}} fill={"#000000"}/>
        </View>
    </View>
  );
}