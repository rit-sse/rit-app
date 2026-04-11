import React from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import {ActiveStopListItem} from "@/types/bus";

type ActiveStopCardProps = {
  item: ActiveStopListItem;
  isSelected: boolean;
  onPress: () => void;
};

export default function ActiveStopCard({
  item,
  isSelected,
  onPress,
}: Readonly<ActiveStopCardProps>) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.stopName}>{item.stopName}</Text>
        <View style={styles.etaPill}>
          <Text style={styles.etaText}>{item.soonestEta} min</Text>
        </View>
      </View>
      <Text style={styles.metaText}>
        {item.arrivals.length} active {item.arrivals.length === 1 ? "route" : "routes"}
      </Text>
      <Text style={styles.metaText}>
        Soonest: {item.arrivals[0]?.routeName ?? "Unavailable"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardSelected: {
    borderColor: "#f76902",
    shadowColor: "#f76902",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  stopName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  etaPill: {
    backgroundColor: "#fff1e8",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  etaText: {
    color: "#c2410c",
    fontWeight: "700",
    fontSize: 13,
  },
  metaText: {
    color: "#4b5563",
    fontSize: 13,
  },
});
