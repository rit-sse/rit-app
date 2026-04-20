import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import DragUp from "@/app/DragUp";
import ActiveRouteList from "@/components/bus/ActiveRouteList";
import RouteCard from "@/components/bus/RouteCard";
import StopsGrid from "@/components/bus/StopsGrid";
import { ActiveRouteListItem } from "@/types/bus";
type RouteDetail = ReturnType<typeof import("@/components/bus/model").buildRouteDetail>;

export default function TransitSheet({
  visible,
  setVisible,
  isBusRefreshing,
  onRefresh,
  isBusLoading,
  busErrorMessage,
  routeItems,
  selectedRouteId,
  onSelectRoute,
  selectedDetail,
  onSelectStop,
}: Readonly<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
  isBusRefreshing: boolean;
  onRefresh: () => void;
  isBusLoading: boolean;
  busErrorMessage: string | null;
  routeItems: ActiveRouteListItem[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  selectedDetail: RouteDetail | null;
  onSelectStop: (stopName: string) => void;
}>) {
  return (
    <DragUp
      visible={visible}
      setVisible={setVisible}
      bottomOffset={0}
      heightPercent={78}
    >
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isBusRefreshing}
            onRefresh={onRefresh}
            tintColor="#f76902"
          />
        }
      >
        <View className="gap-5 px-1 pb-12 pt-2">
          <Text className="text-[12px] font-extrabold uppercase tracking-[1.2px] text-[#c2410c]">
            RIT Transit | Bus Schedule
          </Text>

          {isBusLoading ? (
            <View className="min-h-[220px] items-center justify-center gap-[10px] rounded-[24px] bg-white p-6">
              <ActivityIndicator size="large" color="#f76902" />
              <Text className="text-center text-[15px] leading-[22px] text-[#6b7280]">
                Loading active routes...
              </Text>
            </View>
          ) : busErrorMessage ? (
            <View className="min-h-[220px] items-center justify-center gap-[10px] rounded-[24px] bg-white p-6">
              <Text className="text-center text-[15px] leading-[22px] text-[#b91c1c]">
                {busErrorMessage}
              </Text>
            </View>
          ) : routeItems.length === 0 ? (
            <View className="min-h-[220px] items-center justify-center gap-[10px] rounded-[24px] bg-white p-6">
              <Text className="text-[20px] font-extrabold text-[#111827]">
                No active routes right now.
              </Text>
              <Text className="text-center text-[15px] leading-[22px] text-[#6b7280]">
                Pull down to refresh when buses are back in service.
              </Text>
            </View>
          ) : (
            <>
              <View className="gap-3">
                <Text className="text-[22px] font-extrabold text-[#111827]">
                  Active Routes
                </Text>
                <ActiveRouteList
                  items={routeItems}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={onSelectRoute}
                />
              </View>

              {selectedDetail ? (
                <View className="gap-[18px]">
                  <RouteCard detail={selectedDetail} />
                  <StopsGrid
                    detail={selectedDetail}
                    onSelectStop={onSelectStop}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </DragUp>
  );
}
