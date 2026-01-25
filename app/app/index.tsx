import { Button, Text, View, ScrollView } from "react-native";
import { useState } from "react";
import EventsContainer from "@/components/Home/EventsContainer";
import RecentlyViewedButton from "@/components/Home/RecentlyViewedButton";
import NewsContainer from "@/components/Home/NewsContainer";
import * as GLOBAL from "./globals";

import PagerView from "react-native-pager-view";
const newsExample: {uri: string, title: string, description: string, date: string}[] = [
  {
    uri: "https://www.rit.edu/sites/rit.edu/files/styles/news_thumbnail/https/cdn.rit.edu/images/news/2026-01/WEB_Cirr-CWED.jpg?itok=8CbKYU9u",
    title: "Catholics grade Pope Leo XIV",
    description: "Andrew Cirillo, University Chaplain and associate director for the Center for Campus Life, discusses Pope Leo XVI's papacy and his response to more recent political and military actions on WXXI's Connections with Evan Dawson.",
    date: "Janurary 23, 2026"
  },
  {
    uri: "https://www.rit.edu/sites/rit.edu/files/styles/news_thumbnail/https/cdn.rit.edu/images/news/2026-01/WEB_FallCareerFair-1.jpg?itok=_aPWvLr2",
    title: "Forbes names RIT a top college for launching careers",
    description: "Rochester Business Journal speaks to Maria Richart, director of Career Services and Cooperative Education, about the designation.",
    date: "Janurary 23, 2026"
  }
]

const draggableExample = [
  <EventsContainer image={require("../assets/images/careerfair.png")} title={[{content: "Prepare for", color: "#fff"}, {content: "Career Fair", color: "#F76902"}]} key={0} />,
  <EventsContainer image="https://picsum.photos/500/300" title={[{content: "Event 2", color: "#fff"}]} key={1} />,
  <EventsContainer image="https://picsum.photos/500/300" title={[{content: "Event 3", color: "#fff"}]} key={2} />,
]

export default function Index() {
  const [scrollOffset, setscrollOffset] = useState(0);
  const [hiding, setHiding] = useState(false);

  const onPageScrolled = (e: any) => {
    let offset = e.nativeEvent.offset + e.nativeEvent.position;
    setscrollOffset(Math.round(offset * 1000) / 1000);
  }

  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: "#fff",
        paddingTop: 50,
        alignItems: "center",
        paddingBottom: 150
      }}

    >
      <Text style={{ fontSize: 32, fontWeight: "bold", paddingTop: 15, width: "85%" }}>
        <Text style={{ color: "#F76902" }}>Hello, </Text>
        <Text>Tigers!</Text>
      </Text>
      <PagerView style={{ width: "88%", height: 200, marginTop: 10, borderRadius: 10 }} initialPage={0} onPageScroll={onPageScrolled}>
        {draggableExample.map((page, index) => (
          page
        ))}
      </PagerView>
      <View style={{ height: 0, width: "85%", display: "flex", flexDirection: "row", justifyContent: "center", marginTop: 10}}>
        {draggableExample.map((_, index) => (
          // 
          <View key={index} style={{ height: 10, width: (scrollOffset - .95 < index && index < scrollOffset + .95) ? Math.max((30 + 20*(Math.sin(Math.PI*(scrollOffset - index) + (Math.PI/2)))), 10) : 10, borderRadius: 5, backgroundColor: (scrollOffset - 1 < index && index < scrollOffset + 1) ? ("rgba(247, 105, 2, " + 
            ((3/5) + (2/5)*Math.cos((scrollOffset * Math.PI) + (Math.PI * index)))
            + ")") : "rgba(247, 105, 2, 0.2)", marginHorizontal: 3 }}></View>
        ))}
        
      </View>

      <View style={{ marginTop: 25, width: "100%" }}>
        <Text style={{fontSize: 24, fontWeight: "bold", paddingLeft: "7.5%"}}>Recently Viewed</Text>
        <ScrollView style={{ marginTop: 10, width: "100%", flexDirection: "row", paddingLeft: "7.5%"}} horizontal={true} showsHorizontalScrollIndicator={false}>
          <RecentlyViewedButton />
          <RecentlyViewedButton />
          <RecentlyViewedButton />
          <RecentlyViewedButton />
          <RecentlyViewedButton />
          <RecentlyViewedButton />
          <RecentlyViewedButton />
          <RecentlyViewedButton />
        </ScrollView>
      </View>

      <View style={{ marginTop: 15, width: "85%" }}>
          <Text style={{fontSize: 24, fontWeight: "bold"}}>Latest News</Text>
          {newsExample.map((news, index) => (
            <NewsContainer key={index} uri={news.uri} title={news.title} description={news.description} date={news.date} />
          ))}
      </View>

        {/* <View style={{ marginTop: 15, width: "85%" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>debug</Text>
          <Button title={ "Hide Nav Bar"} onPress={() => {GLOBAL.default.navbar?.setState({ navBarVisibility: false })}} />
          <Button title={ "Nav Bar Hiding Animation"} onPress={() => {GLOBAL.default.showNavbar?.(!hiding); setHiding(!hiding);}} />
        </View> */}
    </ScrollView>
  );
}
