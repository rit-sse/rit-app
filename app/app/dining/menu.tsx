import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useEffect, useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import CategoryContainer from "@/components/Dining/Search/CategoryContainer";
import { buildApiUrl } from "@/lib/api";

type MenuItem = {
  name: string;
  calories: string;
  category: string;
  allergens: string[];
  conditionals: string[];
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  Entree: 10,
  Salads: 9,
  Wraps: 8,
  Soups: 7,
  Bowls: 6,
  "Hot Sandwiches": 5,
  Sandwiches: 4,
  Pizza: 3,
  Side: 2,
  Sides: 2,
  Other: 0,
};

// Keep category priority static so the fetch effect only depends on the store code.
function sortCategories(categories: string[]) {
  return [...categories].sort((a, b) => {
    const weightA = CATEGORY_WEIGHTS[a] ?? 0;
    const weightB = CATEGORY_WEIGHTS[b] ?? 0;
    return weightB - weightA;
  });
}

function filterMenu(
  menu: MenuItem[],
  category: string,
  conditional: string,
): MenuItem[] {
  // Derive the visible menu from current filters instead of syncing extra state.
  let filteredMenu = menu;

  if (category !== "") {
    filteredMenu = filteredMenu.filter((item) => item.category === category);
  }

  switch (conditional) {
    case "Vegan":
      return filteredMenu.filter((item) =>
        item.conditionals.includes("Vegan"),
      );
    case "Vegetarian":
      return filteredMenu.filter((item) =>
        item.conditionals.includes("Vegetarian"),
      );
    case "Pork":
      return filteredMenu.filter((item) => !item.conditionals.includes("Pork"));
    default:
      return filteredMenu;
  }
}

export default function Menu() {
  const router = useRouter();

  const HEIGHT_INITIAL = 250;

  const { restaurantCode, restaurantIcon, bannerImage } =
    useLocalSearchParams();
  const [bannerHeight] = useState(HEIGHT_INITIAL);
  const [offset, setOffset] = useState(0);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [onCategory, setCategory] = useState<string>("");
  const [onConditional, setConditional] = useState<string>("");
  const [loadedMenu, setLoadedMenu] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  // Recompute filtered items during render so filter changes stay local and predictable.
  const viewMenu = filterMenu(menu, onCategory, onConditional);

  useEffect(() => {
    let isAlive = true;

    setMenu([]);
    setCategories([]);
    setCategory("");
    setConditional("");
    setLoadedMenu(false);

    // Fetch only when the selected restaurant changes.
    fetch(buildApiUrl("/dining/menu", { store: String(restaurantCode) }))
      .then((response) => response.json())
      .then((data) => {
        if (!isAlive) {
          return;
        }

        const nextMenu = data["data"]["menu"] as MenuItem[];
        const nextCategories = sortCategories(data["data"]["categories"] ?? []);

        setMenu(nextMenu);
        setCategories(nextCategories);
        setLoadedMenu(true);
      })
      .catch((error) => {
        if (isAlive) {
          console.error("Error fetching menu data:", error);
        }
      });

    return () => {
      isAlive = false;
    };
  }, [restaurantCode]);

  const styles = StyleSheet.create({
    bannerImage: {
      width: "100%",
      height: bannerHeight - offset,
      position: "relative",
      zIndex: 5,
    },
  });

  const onScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y > 0) {
      setOffset(Math.min(90, event.nativeEvent.contentOffset.y));
    } else {
      setOffset(0);
    }
  };

  const goBack = () => {
    router.dismissTo("/dining/search");
  };

  const filterChanged = (category: string, conditional: string) => {
    setCategory(category);
    setConditional(conditional);
  };

  const resetConditional = () => {
    filterChanged(onCategory, "");
  };

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <TouchableOpacity
        onPress={goBack}
        style={{ position: "absolute", top: 50, left: 20, zIndex: 10 }}
        onPressOut={goBack}
      >
        <BackChevron style={{ width: 40, height: 40 }} color="#fff" />
      </TouchableOpacity>
      <View style={styles.bannerImage}>
        <Image
          source={{ uri: bannerImage as string }}
          style={{ width: "100%", height: "100%" }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            opacity: 0.2,
          }}
        />
        <Image
          source={{ uri: restaurantIcon as string }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 8,
            position: "absolute",
            bottom: -60,
            left: 20,
            backgroundColor: "#F76902",
            padding: 4,
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          padding: 10,
          flex: 1,
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <View style={{ width: "100%", height: 50, marginBottom: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingLeft: 150 }}
          >
            {/* <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }} onPress={() => filterChanged(onCategory, "Vegan")}>
                            <Text style={{ fontSize: 20 }}>Vegan</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }} onPress={() => filterChanged(onCategory, "Vegetarian")}>
                            <Text style={{ fontSize: 20 }}>Vegetarian</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginRight: 10, borderWidth: 2, borderColor: "rgba(0,0,0,.2)" }} onPress={() => filterChanged(onCategory, "No Pork")}>
                            <Text style={{ fontSize: 20 }}>No Pork</Text>
                        </TouchableOpacity> */}
            {["Vegan", "Vegetarian", "Pork"].map((cond, index) => (
              // <ConditionalContainer key={index} conditionalName={cond} filterChange={filterChanged} isInConditional={onConditional === cond} />
              // Above was an attempt to make a separate component, but it ended up bringing more trouble. (Speciically, categories variable access)
              <TouchableOpacity
                key={index}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderRadius: 5,
                  marginRight: 10,
                  borderWidth: 2,
                  borderColor: "rgba(0,0,0,.2)",
                  backgroundColor: cond === onConditional ? "#F76902" : "",
                }}
                onPress={() => {
                  if (cond === onConditional) {
                    resetConditional();
                  } else {
                    filterChanged(onCategory, cond);
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    ...(cond === onConditional
                      ? { color: "#fff", fontWeight: "bold" }
                      : { color: "#000", fontWeight: "normal" }),
                  }}
                >
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={{ width: "95%" }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {loadedMenu ? (
              categories.map((category, index) => (
                <CategoryContainer
                  key={index}
                  categoryName={category}
                  onClick={() => filterChanged(category, onConditional)}
                  isInCategory={onCategory === category}
                />
              ))
            ) : (
              <></>
            )}
          </ScrollView>
        </View>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            width: Dimensions.get("screen").width * 0.9,
            paddingBottom: 150,
          }}
          onScroll={onScrollHandler}
        >
          {/* {
                        Array.from({ length: 20 }).map((_, index) => (
                            <View key={index} style={{ height: 80, width: "100%", backgroundColor: "rgba(0,0,0,.2)", borderRadius: 5, marginTop: 10 }}></View>

                        ))
                    } */}
          {loadedMenu ? (
            viewMenu.map((item, index) =>
              item.name === "" ? (
                <></>
              ) : (
                <View
                  key={index}
                  style={{
                    height: 80,
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,.05)",
                    borderRadius: 5,
                    marginTop: 10,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14 }}>{item.calories} calories</Text>
                  <Text style={{ fontSize: 14 }}>
                    Category: {item.category}
                  </Text>
                  <Text style={{ fontSize: 14 }}>
                    Allergens: {item.allergens.join(", ")}
                  </Text>
                </View>
              ),
            )
          ) : (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    height: 80,
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,.1)",
                    borderRadius: 5,
                    marginTop: 10,
                    opacity: 1 / ((index + 1) * 0.6),
                  }}
                ></View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
