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
            position: "absolute", width: 80, height: 270, bottom: 35+100, right: "5%", borderRadius: 14,
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            display: "flex"
        }}>
          <View style={{
            position: "absolute", width: 80, height: 80, bottom: 190, backgroundColor: "#FFF", borderRadius: 14,
            flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", display: "flex"
          }}>
            <GearIcon onPress={() => {}} style={{height: 50, width: 50}} fill={"#000000"}/>
          </View>

          <View style={{
            position: "absolute", width: 80, height: 80, bottom: 95, backgroundColor: "#FFF", borderRadius: 14,
            flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", display: "flex"
          }}>
            <BusIcon onPress={() => {}} style={{height: 50, width: 50}} fill={"#000000"}/>
          </View>

          <View style={{
            position: "absolute", width: 80, height: 80, bottom: 0, backgroundColor: "#FFF", borderRadius: 14,
            flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", display: "flex"
          }}>
            <BuildingIcon onPress={() => {}} style={{height: 50, width: 50}} fill={"#000000"}/>
          </View>
          
          
          
        </View>
    </View>
  );
}