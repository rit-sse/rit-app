import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { LocationGeometryResponse, LocationSearchRecord } from "@/types/map";

export default function MapSearchOverlay({
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  isMapLoading,
  isSelectingLocation,
  shouldShowSearchResults,
  filteredSearchRecords,
  selectedSearchMdoId,
  onSelectRecord,
  mapErrorMessage,
  showOpenSettings,
  onOpenSettings,
  selectedGeometry,
  selectedLocationTitle,
  routeSummaryText,
  selectedRecord,
  isRouting,
  onStartWalkingRoute,
  onLocateMe,
  onClearSelection,
}: Readonly<{
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (value: boolean) => void;
  isMapLoading: boolean;
  isSelectingLocation: boolean;
  shouldShowSearchResults: boolean;
  filteredSearchRecords: LocationSearchRecord[];
  selectedSearchMdoId: number | null;
  onSelectRecord: (record: LocationSearchRecord) => void;
  mapErrorMessage: string | null;
  showOpenSettings: boolean;
  onOpenSettings: () => void;
  selectedGeometry: LocationGeometryResponse | null;
  selectedLocationTitle: string | null;
  routeSummaryText: string | null;
  selectedRecord: LocationSearchRecord | null;
  isRouting: boolean;
  onStartWalkingRoute: () => void;
  onLocateMe: () => void;
  onClearSelection: () => void;
}>) {
  return (
    <View className="absolute left-4 right-4 top-[60px] gap-[10px]">
      <View className="flex-row items-center gap-[10px] rounded-[18px] bg-white px-4 py-3 shadow">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearchFocused(true)}
          placeholder={
            isMapLoading ? "Loading campus map..." : "Search buildings and places"
          }
          placeholderTextColor="#6b7280"
          className="flex-1 text-base font-semibold text-[#111827]"
          editable={!isMapLoading}
        />
        {isSelectingLocation ? (
          <ActivityIndicator size="small" color="#f76902" />
        ) : null}
      </View>

      {shouldShowSearchResults ? (
        <View className="rounded-[18px] bg-white py-2 shadow">
          {filteredSearchRecords.map((record) => (
            <Pressable
              key={record.mdoId}
              className={`gap-[2px] px-4 py-3 ${
                selectedSearchMdoId === record.mdoId ? "bg-[#fff7ed]" : ""
              }`}
              onPress={() => {
                onSelectRecord(record);
              }}
            >
              <Text className="text-[15px] font-bold text-[#111827]">
                {record.primaryLabel}
              </Text>
              {record.secondaryLabel ? (
                <Text className="text-[13px] font-medium text-[#6b7280]">
                  {record.secondaryLabel}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {mapErrorMessage ? (
        <View className="max-w-[90%] self-start rounded-[14px] bg-[rgba(17,24,39,0.88)] px-[14px] py-[10px]">
          <Text className="text-[13px] leading-[18px] text-[#f9fafb]">
            {mapErrorMessage}
          </Text>
          {showOpenSettings ? (
            <Pressable
              className="mt-3 self-start rounded-full bg-white px-3 py-2"
              onPress={onOpenSettings}
            >
              <Text className="text-[12px] font-bold text-[#111827]">
                Open Settings
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {selectedGeometry && selectedLocationTitle ? (
        <View className="max-w-[96%] gap-3 self-start rounded-[18px] bg-white px-4 py-4 shadow">
          <View className="gap-1">
            <Text className="text-[15px] font-extrabold text-[#111827]">
              {selectedLocationTitle}
            </Text>
            {routeSummaryText ? (
              <Text className="text-[13px] font-semibold text-[#2563eb]">
                Walk: {routeSummaryText}
              </Text>
            ) : selectedRecord?.secondaryLabel ? (
              <Text className="text-[13px] font-medium text-[#6b7280]">
                {selectedRecord.secondaryLabel}
              </Text>
            ) : null}
          </View>
          <View className="flex-row gap-2">
            <Pressable
              className="rounded-full bg-[#111827] px-4 py-2.5"
              onPress={onStartWalkingRoute}
            >
              <Text className="text-[13px] font-bold text-white">
                {isRouting ? "Routing..." : "Walk Here"}
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-[#f3f4f6] px-4 py-2.5"
              onPress={onLocateMe}
            >
              <Text className="text-[13px] font-bold text-[#111827]">
                Locate Me
              </Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-[#fff7ed] px-4 py-2.5"
              onPress={onClearSelection}
            >
              <Text className="text-[13px] font-bold text-[#c2410c]">
                Clear
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
