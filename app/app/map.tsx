import { View, Text } from "react-native";
import Map from './map/Map';


export default function map() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Map Screen</Text>

      <section className='map-container'>
         <Map/>
      </section>
    </View>
  );
}