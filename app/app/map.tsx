import React, {useState} from 'react';
import { View, Text, StyleProp, ViewStyle, Dimensions} from "react-native";
import { WebviewLeafletMessage } from 'react-native-leaflet-view';
import Map from "./map/Map";
import DragUp from "./DragUp";

import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Constants from 'expo-constants';

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
  backgroundColor: "#FFF", borderRadius: 14, justifyContent: "center", alignItems: "center",
  shadowColor:"#000",
  shadowRadius:3.84,
  shadowOffset: { width: 0, height: 2 },
  elevation: 5,
};

export default function map() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Map onMapMessage={onMapMessage}/>

      <View style={{position: "absolute", bottom: 35+80+buttonSpacing, right: "5%",
      width: buttonWidth, height: 3.0*buttonWidth+2.0*buttonSpacing}}>
          <View style={[{bottom: 2.0*(buttonWidth+buttonSpacing)}, allButtonStyling]}>
            <GearIcon onPress={() => {}} style={iconStyle} fill={"#000"}/>
          </View>

          <View style={[{bottom: buttonWidth+buttonSpacing}, allButtonStyling]}>
            <BusIcon onPress={() => {}} style={iconStyle} fill={"#000"}/>
          </View>

          <View style={[{bottom: 0}, allButtonStyling]}>
            <BuildingIcon onPress={() => {setModalVisible(true)}} style={iconStyle} fill={"#000"}/>
          </View>
          
        </View>

        <Animated.ScrollView pagingEnabled style={{width:"100%",flex:1}}>
    {/* so here are your screens, for example first camera second images */}
          {/* <Page title={'PAGE 1 '} index={0} />
          <Page title={'PAGE 2'} index={1} /> */}
          <View style={{width:"100%",height:Dimensions.get('screen').height - Constants.statusBarHeight,backgroundColor:"#ff000000"}}>
            <Text style={{}}>hi</Text>
          </View>
          <View style={{width:"100%",height:Dimensions.get('screen').height - Constants.statusBarHeight,backgroundColor:"#00ff00"}}>
            <Text style={{}}>hi 2</Text>
          </View>
        </Animated.ScrollView>

        <DragUp getVisible={()=>{return modalVisible}} setVisible={setModalVisible}>
          <View style={{width:"100%", height:"100%"}}>
            <View style={{height: 6, width: 50, backgroundColor: "#bababa", borderRadius: 5, bottom: 10, left:0, alignSelf:'center'}}>
            </View>

            <Text style={{fontSize: 20, fontWeight: 'bold',textAlign:'left'}}>
              Buildings
            </Text>
          </View>
          
        </DragUp>

    </View>
  );
}