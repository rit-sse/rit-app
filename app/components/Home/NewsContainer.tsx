import { View, Image, Text } from "react-native";

export default function NewsContainer(props: {uri: string, title?: string, description?: string, date?: string}) {
    return (
        <View style={{width: "100%", marginTop: 10, borderRadius: 10}}>
            <Image style={{width: "100%", height: 180, borderRadius: 10}} source={{uri: props.uri}} />
            <Text style={{fontWeight: "bold", fontSize: 20, marginTop: 5}}>{props.title}</Text>
            <Text style={{marginTop: 5, fontSize: 14}}>{props.description}</Text>
            <Text style={{marginTop: 5, fontSize: 12, color: "gray"}}>{props.date}</Text>
        </View>
    );
}