import { View, Text } from "react-native";
import Map from "./map/Map";
import { WebviewLeafletMessage } from 'react-native-leaflet-view';

function onMapMessage(message: WebviewLeafletMessage) {
    return;
}

export default function map() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Map Screen</Text>

      <Map onMapMessage={onMapMessage}/>
    </View>
  );
}