import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { InferredStop } from "@/types/bus";

type ScheduleMenuProps = {
  stop: InferredStop;
  isSelected: boolean;
  onPress?: () => void;
};

export default function ScheduleMenu({
  stop,
  isSelected,
  onPress,
}: Readonly<ScheduleMenuProps>) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.cell,
        stop.status === "PAST" && styles.pastCell,
        stop.status === "ARRIVING" && styles.arrivingCell,
        isSelected && styles.selectedCell,
      ]}
    >
      <Text
        style={[
          styles.name,
          stop.status === "PAST" && styles.pastText,
          stop.status === "ARRIVING" && styles.arrivingText,
        ]}
      >
        {stop.name}
      </Text>
      <Text style={[styles.status, stop.status === "PAST" && styles.pastText]}>
        {stop.status}
      </Text>
      {stop.etaMinutes != null && (
        <Text style={[styles.eta, stop.status === "PAST" && styles.pastText]}>
          {stop.etaMinutes} min
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: "48%",
    minHeight: 108,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    gap: 8,
  },
  selectedCell: {
    borderColor: "#f76902",
    backgroundColor: "#fff7ed",
  },
  arrivingCell: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  pastCell: {
    backgroundColor: "#f3f4f6",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  eta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#c2410c",
  },
  pastText: {
    color: "#9ca3af",
  },
  arrivingText: {
    color: "#ffffff",
  },
});
