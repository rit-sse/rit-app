import { View, Text, StyleProp, ViewStyle } from "react-native";
import { WebviewLeafletMessage } from 'react-native-leaflet-view';
import Map from "./map/Map";

import GearIcon from "../components/svgs/map/GearIcon";
import BusIcon from "../components/svgs/map/BusIcon";
import BuildingIcon from "../components/svgs/map/BuildingIcon";

function onMapMessage(message: WebviewLeafletMessage) {
  return;
}

const buttonWidth = 70;
const buttonSpacing = 15;
const iconStyle = {height: 0.65*buttonWidth, width: 0.65*buttonWidth};

const allButtonStyling:StyleProp<ViewStyle> = {
  position: "absolute", width: buttonWidth, height: buttonWidth,
  backgroundColor: "#FFF", borderRadius: 14, justifyContent: "center", alignItems: "center"
};

export default function map() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Map onMapMessage={onMapMessage}/>

      <View style={{position: "absolute", bottom: 35+80+buttonSpacing, right: "5%",
      width: buttonWidth, height: 3.0*buttonWidth+2.0*buttonSpacing}}>
          <View style={Object.assign({bottom: 2.0*(buttonWidth+buttonSpacing)}, allButtonStyling)}>
            <GearIcon onPress={() => {}} style={iconStyle} fill={"#000"}/>
          </View>

          <View style={Object.assign({bottom: buttonWidth+buttonSpacing}, allButtonStyling)}>
            <BusIcon onPress={() => {}} style={iconStyle} fill={"#000"}/>
          </View>

          <View style={Object.assign({bottom: 0}, allButtonStyling)}>
            <BuildingIcon onPress={() => {}} style={iconStyle} fill={"#000"}/>
          </View>
          
        </View>
    </View>
  );
}