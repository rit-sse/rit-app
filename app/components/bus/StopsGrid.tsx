import React from "react";
import {StyleSheet, Text, View} from "react-native";
import ScheduleMenu from "./ScheduleMenu";
import {RouteDetailView} from "@/types/bus";

type StopsGridProps = {
  detail: RouteDetailView;
  onSelectStop: (stopName: string) => void;
};

export default function StopsGrid({
  detail,
  onSelectStop,
}: Readonly<StopsGridProps>) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>All Stops</Text>
      <View style={styles.grid}>
        {detail.stops.map((stop) => (
          <ScheduleMenu
            key={`${detail.routeId}-${stop.name}`}
            stop={stop}
            isSelected={stop.name === detail.stopName}
            onPress={() => onSelectStop(stop.name)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
