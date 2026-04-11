import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { RouteDetailView } from "@/types/bus";

type RouteCardProps = {
  detail: RouteDetailView;
};

export default function RouteCard({ detail }: Readonly<RouteCardProps>) {
  return (
    <View style={styles.card}>
      <Text style={styles.routeName}>{detail.routeName}</Text>
      <Text style={styles.routeMeta}>Route {detail.routeId}</Text>
      <View style={styles.divider} />
      <Text style={styles.label}>Current stop</Text>
      <Text style={styles.value}>{detail.stopName}</Text>
      <Text style={styles.label}>Next stop</Text>
      <Text style={styles.value}>{detail.nextStopName ?? "Final stop"}</Text>
      <Text style={styles.label}>ETA</Text>
      <Text style={styles.value}>
        {detail.etaMinutes > 0 ? `${detail.etaMinutes} min` : "Arriving"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 20,
    gap: 8,
  },
  routeName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
  },
  routeMeta: {
    color: "#fdba74",
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#374151",
    marginVertical: 4,
  },
  label: {
    color: "#9ca3af",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "700",
  },
});
