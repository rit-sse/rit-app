import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
export default function EventTagButton({ tag, onPress, isSelected }: { tag: string; onPress: () => void; isSelected?: boolean }) {
  return (
    <Button onPress={onPress} className={`my-[10px] mr-[10px]  border-[1px] ${isSelected ? "bg-[#F76902] border-[#F76902]" : "bg-white border-gray-400"} active:bg-gray-200`}>
      <Text className={`text-black ${isSelected ? "text-white" : "text-black"}`}>{tag}</Text>
    </Button>
  )
}

