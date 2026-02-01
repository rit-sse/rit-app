import { Text, View, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function EventsContainer(props: {image: string | any, title: {content: string, color: string | "#fff"}[]}) {

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", position: "relative", borderRadius: 15, overflow: "hidden", marginRight: 5, marginLeft: 5 }}>
            {typeof props.image === "string" ? (
                <Image source={{ uri: props.image }} style={{ width: "100%", height: "100%", borderRadius: 15, resizeMode: "cover", position: "absolute"}} />
            ) : (   
                <Image source={props.image} style={{ width: "100%", height: "100%", borderRadius: 15, resizeMode: "cover", position: "absolute"}} />
            )}
            <LinearGradient
                colors={['rgba(0,0,0,0.1)','rgba(0,0,0,0.7)']}
                style={{
                    position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', borderRadius: 15
                }}
            >
                {props.title.reverse().map((line, index) => (
                    <Text key={index} style={{ color: line.color, fontSize: 30, fontWeight: "bold", position: "absolute", bottom: 10 + (index * 35), left: 10, width: "80%" }}>{line.content.trim()}</Text>
                ))}
            </LinearGradient>
        </View>
    );
}