import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import StatusBadge from "./StatusBadge";
import { featuredLocationType } from "./types";

export default function FeaturedLocationCard({
  location,
  onPress,
}: {
  location: featuredLocationType;
  onPress?: (location: featuredLocationType) => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-[16px] p-[16px] mr-[12px] justify-start"
      style={{ width: 220, minHeight: 150 }}
      onPress={() => onPress?.(location)}
    >
      <Text className="text-[20px] font-bold" numberOfLines={2}>
        {location.name}
      </Text>
      <View className="flex-row mt-[10px]">
        <StatusBadge open={location.open} />
      </View>
      <Text className="text-[15px] font-bold color-gray-700 mt-[10px]">
        {location.hours}
      </Text>
    </TouchableOpacity>
  );
}
