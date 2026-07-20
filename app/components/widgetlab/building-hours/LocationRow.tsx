import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { locationType } from "./types";

export default function LocationRow({
  location,
  onPress,
}: {
  location: locationType;
  onPress?: (location: locationType) => void;
}) {
  return (
    <TouchableOpacity
      className="w-full bg-white rounded-[16px] p-[12px] mb-[12px] flex-row items-center"
      onPress={() => onPress?.(location)}
    >
      {location.image ? (
        <Image
          source={{ uri: location.image }}
          style={{ width: 60, height: 60, borderRadius: 12 }}
        />
      ) : (
        <View
          className="bg-gray-200"
          style={{ width: 60, height: 60, borderRadius: 12 }}
        />
      )}
      <View className="flex-1 px-[12px]">
        <Text className="text-[18px] font-bold" numberOfLines={2}>
          {location.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
