import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import SearchIcon from "@/components/svgs/SearchIcon";
import FilterIcon from "@/components/svgs/FilterIcon";
import type { CampusLocation } from "@/types/campusLocations";

const DEBOUNCE_MS = 250;
const MAX_RESULTS = 6;

export default function SearchBar({
  locations,
  onSelectLocation,
}: {
  locations: CampusLocation[];
  onSelectLocation: (location: CampusLocation) => void;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fuse = useMemo(
    () =>
      new Fuse(locations, {
        shouldSort: true,
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 1,
        keys: [
          { name: "name", weight: 1 },
          { name: "abbreviation", weight: 2 },
        ],
      }),
    [locations],
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }
    return fuse.search(debouncedQuery).slice(0, MAX_RESULTS).map((r) => r.item);
  }, [fuse, debouncedQuery]);

  const showDropdown = focused && debouncedQuery.trim().length > 0 && results.length > 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <SearchIcon color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="search"
        />
        <View style={styles.divider} />
        <Pressable style={styles.filterButton} onPress={() => {}} hitSlop={8}>
          {/* TODO: placeholder only, filtering behavior to be planned later */}
          <FilterIcon color="#374151" style={styles.filterIcon} />
        </Pressable>
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {results.map((location) => (
              <Pressable
                key={`${location.name}-${location.latitude}`}
                style={styles.resultRow}
                onPress={() => {
                  setQuery(location.name);
                  setFocused(false);
                  onSelectLocation(location);
                }}
              >
                <Text style={styles.resultName} numberOfLines={1}>
                  {location.name}
                </Text>
                {!!location.abbreviation && (
                  <Text style={styles.resultAbbreviation}>{location.abbreviation}</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 15,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    marginLeft: 10,
    paddingVertical: 0,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 10,
  },
  filterButton: {
    padding: 4,
  },
  filterIcon: {
    width: 22,
    height: 22,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    maxHeight: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginRight: 12,
  },
  resultAbbreviation: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f76902",
  },
});
