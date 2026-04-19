import { resourceController } from "@/components/resourcefetch";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";

import { openLink } from "@/lib/utils";
import { useRouter } from "expo-router";
interface clubType {
  name: string;
  type: string;
  image: string;
  closed: boolean;
  mission: string;
  website: string;
  isPasswordLocked: boolean;
}

export default function ClubContainer({ club }: { club: clubType }) {
  const router = useRouter();
  const isDefaultImage = club.image.endsWith("listing-default.png");
  const imageSource = isDefaultImage
    ? resourceController["default_image"]
    : club.image;

  return (
    <TouchableOpacity
      style={{
        width: "49%",
        height: 300,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
      }}
      className="bg-white"
      onPress={() => {
        openLink(club.website, router);
      }}
    >
      <View className="w-full">
        {isDefaultImage ? (
          <Image
            source={resourceController["default_image"]}
            style={{ width: "100%", height: 150, padding: 10, borderRadius: 7 }}
          />
        ) : (
          <Image
            source={{ uri: club.image }}
            style={{ width: "100%", height: 150, padding: 10, borderRadius: 7 }}
          />
        )}
        <Text className="w-full px-[10px] font-bold text-[14px] line-clamp-2">
          {club.name}
        </Text>
        <Text className="w-full px-[10px] font-bold text-[13px] color-gray-500 line-clamp-3">
          {club.type}
        </Text>
      </View>
      <View className="w-full mb-[10px] px-[10px] flex-row items-center">
        <Badge
          variant="default"
          className={club.closed ? "bg-red-500" : "bg-green-500"}
        >
          <Text>{club.closed ? "Closed" : "Open"}</Text>
        </Badge>
        {club.isPasswordLocked ? (
          <Badge variant="default" className="bg-yellow-500 ml-2">
            <Text>Pass Locked</Text>
          </Badge>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
