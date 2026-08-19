import { Text, View, ScrollView, Image, ActivityIndicator } from "react-native";
import Markdown from "react-native-markdown-display";
import React, { useEffect, useState } from "react";
import EventsContainer from "@/components/Home/EventsContainer";
import * as GLOBAL from "./globals";
import AsyncStorage, {
  useAsyncStorage,
} from "@react-native-async-storage/async-storage";

import PagerView from "react-native-pager-view";
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
import DragUp from "./DragUp";

interface NewsArticle {
  uri: string;
  title: string;
  description: string;
  date: string;
  image: string;
}

interface FeaturedArticle {
  id: number;
  title: string;
  image: string;
  articleDate: string;
  body: string;
  author: string;
  authorRole: string;
}

export default function Index() {
  const [scrollOffset, setscrollOffset] = useState(0);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<FeaturedArticle | null>(null);
  const [articleModalVisible, setArticleModalVisible] = useState(false);
  const [articleLoading, setArticleLoading] = useState(false);

  const [recentlyViewed, setRecentlyViewed] = useState<gridBox[]>();

  const openArticle = (id: number) => {
    setArticleLoading(true);
    setArticleModalVisible(true);
    fetch(buildApiUrl(`/featuredarticles?id=${id}`))
      .then((res) => res.json())
      .then((data) => {
        setSelectedArticle(data);
        setArticleLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching article:", err);
        setArticleLoading(false);
      });
  };

  useEffect(() => {
    getRecentlyView().then((data) => setRecentlyViewed(data.reverse()));
  }, []);

  useEffect(() => {
    console.log(buildApiUrl("/featuredarticles"))
    fetch(buildApiUrl("/featuredarticles"))
      .then((response) => response.json())
      .then((data) => setFeaturedArticles(data))
      .catch((error) => console.error("Error fetching featured articles:", error));
  }, []);

  // const draggableExample = [
  //   <EventsContainer
  //     image={require("../assets/images/careerfair.png")}
  //     title={[
  //       { content: "Prepare for", color: "#fff" },
  //       { content: "Career Fair", color: "#F76902" },
  //     ]}
  //     key={0}
  //   />,
  //   <EventsContainer
  //     image="http://campusgroups.rit.edu/upload/rit/2023/s2_image_upload_1555914_Mascots_929123537.png"
  //     title={[{ content: "Event 2", color: "#fff" }]}
  //     key={1}
  //   />,
  //   <EventsContainer
  //     image="https://picsum.photos/500/300"
  //     title={[{ content: "Event 3", color: "#fff" }]}
  //     key={2}
  //   />,
  // ];
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
          {featuredArticles.map((article, idx) => (
            <EventsContainer
              key={idx}
              image={article.image}
              title={[{ content: article.title, color: "#fff" }]}
              onPress={() => openArticle(article.id)}
            />
          ))}
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
          {featuredArticles.map((_, index) => (
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
            {recentlyViewed && recentlyViewed.length > 0 ? (
              recentlyViewed.map((item: gridBox, index: number) => (
                <RecentlyViewedButton key={index} item={item} />
              ))
            ) : recentlyViewed ? (
              <Text style={{ fontSize: 15, color: "#9ca3af" }}>
                No recently visited page
              </Text>
            ) : null}
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

      <DragUp
        visible={articleModalVisible}
        setVisible={(v) => {
          setArticleModalVisible(v);
          if (!v) setSelectedArticle(null);
        }}
        heightPercent={85}
      >
        {articleLoading || !selectedArticle ? (
          <ActivityIndicator size="large" color="#F76902" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedArticle.image ? (
              <Image
                source={{ uri: selectedArticle.image }}
                style={{ width: "100%", height: 180, borderRadius: 10, marginBottom: 12 }}
                resizeMode="cover"
              />
            ) : null}
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>
              {selectedArticle.title}
            </Text>
            <Text style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
              {selectedArticle.author}
              {selectedArticle.authorRole ? ` · ${selectedArticle.authorRole}` : ""}
              {selectedArticle.articleDate ? ` · ${selectedArticle.articleDate}` : ""}
            </Text>
            <Markdown
              style={{
                body: { fontSize: 16, lineHeight: 24, color: "#222" },
                heading1: { fontSize: 22, fontWeight: "bold", marginVertical: 8 },
                heading2: { fontSize: 20, fontWeight: "bold", marginVertical: 6 },
                heading3: { fontSize: 18, fontWeight: "bold", marginVertical: 4 },
                strong: { fontWeight: "bold" },
                em: { fontStyle: "italic" },
                code_inline: { backgroundColor: "#f0f0f0", fontFamily: "monospace", paddingHorizontal: 4 },
                fence: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 6 },
                blockquote: { borderLeftWidth: 3, borderLeftColor: "#F76902", paddingLeft: 10, color: "#555" },
                bullet_list: { marginVertical: 4 },
                ordered_list: { marginVertical: 4 },
                link: { color: "#F76902" },
              }}
            >
              {selectedArticle.body}
            </Markdown>
          </ScrollView>
        )}
      </DragUp>
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
