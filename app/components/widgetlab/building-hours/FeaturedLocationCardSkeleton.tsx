import React from "react";
import { View } from "react-native";

export default function FeaturedLocationCardSkeleton() {
  return (
    <View
      className="bg-white rounded-[16px] p-[16px] mr-[12px]"
      style={{ width: 220, minHeight: 150 }}
    >
      <View className="bg-gray-200 rounded-[6px] h-[22px] w-[70%]" />
      <View className="bg-gray-200 rounded-full h-[22px] w-[64px] mt-[10px]" />
      <View className="bg-gray-200 rounded-[6px] h-[18px] w-[90%] mt-[12px]" />
    </View>
  );
}
