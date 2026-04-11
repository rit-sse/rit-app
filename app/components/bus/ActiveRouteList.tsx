import React from "react";
import {StyleSheet, View} from "react-native";
import ActiveRouteCard from "./ActiveRouteCard";
import {ActiveRouteListItem} from "@/types/bus";

type ActiveRouteListProps = {
  items: ActiveRouteListItem[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
};

export default function ActiveRouteList({
  items,
  selectedRouteId,
  onSelectRoute,
}: Readonly<ActiveRouteListProps>) {
  return (
    <View style={styles.content}>
      {items.map((item, index) => (
        <View
          key={item.routeId}
          style={index < items.length - 1 ? styles.separatorWrapper : undefined}
        >
        <ActiveRouteCard
          item={item}
          isSelected={selectedRouteId === item.routeId}
          onPress={() => onSelectRoute(item.routeId)}
        />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  separatorWrapper: {
    marginBottom: 12,
  },
});
