import React from "react";
import {FlatList, StyleSheet, View} from "react-native";
import ActiveStopCard from "./ActiveStopCard";
import {ActiveStopListItem} from "@/types/bus";

type ActiveStopListProps = {
  items: ActiveStopListItem[];
  selectedStopName: string | null;
  onSelectStop: (stopName: string) => void;
};

export default function ActiveStopList({
  items,
  selectedStopName,
  onSelectStop,
}: Readonly<ActiveStopListProps>) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.stopName}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({item}) => (
        <ActiveStopCard
          item={item}
          isSelected={selectedStopName === item.stopName}
          onPress={() => onSelectStop(item.stopName)}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
});
