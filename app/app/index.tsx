import { Button, Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import EventsContainer from "@/components/Home/EventsContainer";
import * as GLOBAL from "./globals";
import AsyncStorage, {
  useAsyncStorage,
} from "@react-native-async-storage/async-storage";

import PagerView from "react-native-pager-view";
import { ButtonCustomWrap } from "@/components/Home/ButtonCustomWrap";
import { SafeAreaView } from "react-native-safe-area-context";
import NewsContainer from "@/components/Home/NewsContainer";
import RecentlyViewedButton from "@/components/Home/RecentlyViewedButton";
import { buildApiUrl } from "@/lib/api";
import {
  clearRecentlyView,
  getRecentlyView,
  gridBox,
  storeRecentlyView,
} from "@/lib/utils";

interface NewsArticle {
  uri: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

export default function Index() {
  const routeNavigator = useRouter();
  const [scrollOffset, setscrollOffset] = useState(0);
  const [hiding, setHiding] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>([]);

  const [recentlyViewed, setRecentlyViewed] = useState<gridBox[]>();

  useEffect(() => {
    getRecentlyView().then((data) => setRecentlyViewed(data.reverse()));
  }, []);

  const draggableExample = [
    <EventsContainer
      image={require("../assets/images/careerfair.png")}
      title={[
        { content: "Prepare for", color: "#fff" },
        { content: "Career Fair", color: "#F76902" },
      ]}
      key={0}
    />,
    <EventsContainer
      image="https://picsum.photos/500/300"
      title={[{ content: "Event 2", color: "#fff" }]}
      key={1}
    />,
    <EventsContainer
      image="https://picsum.photos/500/300"
      title={[{ content: "Event 3", color: "#fff" }]}
      key={2}
    />,
  ];
  const onPageScrolled = (e: any) => {
    let offset = e.nativeEvent.offset + e.nativeEvent.position;
    setscrollOffset(Math.round(offset * 1000) / 1000);
  };

  useEffect(() => {
    fetch(buildApiUrl("/news"))
      .then((response) => response.json())
      .then((data) => setNews(data["data"]))
      .catch((error) => console.error("Error fetching news:", error));
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 100,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            paddingTop: 15,
            width: "85%",
          }}
        >
          <Text style={{ color: "#F76902" }}>Hello, </Text>
          <Text>Tigers!</Text>
        </Text>
        <PagerView
          style={{ width: "88%", height: 200, marginTop: 10, borderRadius: 10 }}
          initialPage={0}
          onPageScroll={onPageScrolled}
        >
          {draggableExample.map((page, index) => page)}
        </PagerView>
        <View
          style={{
            height: 0,
            width: "85%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {draggableExample.map((_, index) => (
            //
            <View
              key={index}
              style={{
                height: 10,
                width:
                  scrollOffset - 0.95 < index && index < scrollOffset + 0.95
                    ? Math.max(
                        30 +
                          20 *
                            Math.sin(
                              Math.PI * (scrollOffset - index) + Math.PI / 2,
                            ),
                        10,
                      )
                    : 10,
                borderRadius: 5,
                backgroundColor:
                  scrollOffset - 1 < index && index < scrollOffset + 1
                    ? "rgba(247, 105, 2, " +
                      (3 / 5 +
                        (2 / 5) *
                          Math.cos(scrollOffset * Math.PI + Math.PI * index)) +
                      ")"
                    : "rgba(247, 105, 2, 0.2)",
                marginHorizontal: 3,
              }}
            ></View>
          ))}
        </View>

        <View style={{ marginTop: 15, width: "85%" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
            Recently Viewed
          </Text>
          <ScrollView
            horizontal={true}
            style={{ width: "100%" }}
            showsHorizontalScrollIndicator={false}
          >
            {/* {
              Array.from({ length: 10}).map((_, index) => <RecentlyViewedButton key={index} />)
            } */}
            {recentlyViewed
              ? recentlyViewed.map((item: gridBox, index: number) => (
                  <RecentlyViewedButton key={index} item={item} />
                ))
              : null}
          </ScrollView>
        </View>
        {/* <Button title="Clear recently viewed data" onPress={() => { clearRecentlyView(); setRecentlyViewed(null); }} /> */}
        <View style={{ marginTop: 15, width: "85%" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
            News
          </Text>
          {news.map((article, index) => (
            <NewsContainer article={article} key={index} index={index} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Old Debug Functionality
{
  /* <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>debug</Text>
  <Button title={ "Hide Nav Bar"} onPress={() => {GLOBAL.default.navbar?.setState({ navBarVisibility: false })}} />
  <Button title={ "Nav Bar Hiding Animation"} onPress={() => {GLOBAL.default.showNavbar?.(!hiding); setHiding(!hiding);}} />
  <Button title={ "Goto Dining Search"} onPress={() => {routeNavigator.push("/dining/search")}} /> */
}
