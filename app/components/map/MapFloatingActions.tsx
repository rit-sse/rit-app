import { Pressable, Text, View } from "react-native";
import BusIcon from "@/components/svgs/map/BusIcon";
import BuildingIcon from "@/components/svgs/map/BuildingIcon";
import { FLOATING_ACTION_LAYOUT } from "@/lib/map/mapModels";

export default function MapFloatingActions({
  canOpenBus,
  onOpenBus,
  onLocateMe,
  onFocusSearch,
}: Readonly<{
  canOpenBus: boolean;
  onOpenBus: () => void;
  onLocateMe: () => void;
  onFocusSearch: () => void;
}>) {
  return (
    <View
      className="absolute right-[5%]"
      style={{
        bottom:
          35 +
          80 +
          FLOATING_ACTION_LAYOUT.buttonSpacing,
        width: FLOATING_ACTION_LAYOUT.buttonWidth,
        height:
          3 * FLOATING_ACTION_LAYOUT.buttonWidth +
          2 * FLOATING_ACTION_LAYOUT.buttonSpacing,
      }}
    >
      <View
        className={FLOATING_ACTION_LAYOUT.floatingButtonClassName}
        style={{
          bottom:
            2 *
            (FLOATING_ACTION_LAYOUT.buttonWidth +
              FLOATING_ACTION_LAYOUT.buttonSpacing),
        }}
      >
        <BusIcon
          onPress={onOpenBus}
          style={FLOATING_ACTION_LAYOUT.iconSize}
          fill={canOpenBus ? "#000" : "#9ca3af"}
        />
      </View>

      <Pressable
        className={FLOATING_ACTION_LAYOUT.floatingButtonClassName}
        style={{
          bottom:
            FLOATING_ACTION_LAYOUT.buttonWidth +
            FLOATING_ACTION_LAYOUT.buttonSpacing,
        }}
        onPress={onLocateMe}
      >
        <Text className="text-[15px] font-extrabold text-[#111827]">ME</Text>
      </Pressable>

      <View
        className={FLOATING_ACTION_LAYOUT.floatingButtonClassName}
        style={{ bottom: 0 }}
      >
        <BuildingIcon
          onPress={onFocusSearch}
          style={FLOATING_ACTION_LAYOUT.iconSize}
          fill="#000"
        />
      </View>
    </View>
  );
}
