import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { MapPlace } from "@/types/mapPlace";

export default function BuildingCard({
  building,
  onClose,
  onRouteTo,
  routeLoading,
  routeError,
}: {
  building: MapPlace;
  onClose: () => void;
  onRouteTo: () => void;
  routeLoading: boolean;
  routeError: string | null;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {building.name}
        </Text>

        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      <View style={styles.infoSlot}>
        {!!building.code && <Text style={styles.codeBadge}>{building.code}</Text>}
        {!!building.category && <Text style={styles.categoryText}>{building.category}</Text>}
      </View>

      {routeError && <Text style={styles.errorText}>{routeError}</Text>}

      <Pressable style={styles.routeButton} onPress={onRouteTo} disabled={routeLoading}>
        {routeLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.routeButtonText}>Route to</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 130,
    left: 16,
    right: 100,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    paddingTop: 16,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  closeText: {
    fontSize: 24,
    color: "#9ca3af",
    fontWeight: "600",
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },
  infoSlot: {
    flexGrow: 1,
    minHeight: 16,
    gap: 6,
    paddingVertical: 10,
    justifyContent: "center",
  },
  codeBadge: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f76902",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 13,
    color: "#b91c1c",
    marginBottom: 8,
  },
  routeButton: {
    backgroundColor: "#f76902",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  routeButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
});
