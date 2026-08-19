import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { NamedBuilding } from "@/types/buildings";

export default function BuildingRow({ building }: { building: NamedBuilding }) {
  return (
    <View style={styles.shadowWrap}>
      <Pressable
        style={styles.row}
        onPress={() => {
          if (building.link) {
            void Linking.openURL(building.link);
          }
        }}
      >
        <Image
          source={{ uri: building.image }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "#ffffffE6", "#ffffff"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.code} numberOfLines={1}>
          {building.code || building.name}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 20,
    marginBottom: 6,
    backgroundColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  row: {
    height: 96,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 24,
  },
  code: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
});
