import React from "react";
import { View } from "react-native";

export default function LocationRowSkeleton() {
  return (
    <View className="w-full bg-white rounded-[16px] p-[12px] mb-[12px] flex-row items-center">
      <View
        className="bg-gray-200"
        style={{ width: 60, height: 60, borderRadius: 12 }}
      />
      <View className="flex-1 px-[12px]">
        <View className="bg-gray-200 rounded-[6px] h-[18px] w-[70%]" />
      </View>
    </View>
  );
}
