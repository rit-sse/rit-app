import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter, useLocalSearchParams  } from "expo-router";

export default function CatalogScreen() {

    const routeNavigator = useRouter();
    function processQuickLink(gridItem: gridBox) {
        console.log("Processing quick link for: " + gridItem.name);
        console.log("Link: " + gridItem.link);
        openLink(gridItem.link, routeNavigator);
        storeRecentlyView(gridItem);
      }
    const buttonStyle = StyleSheet.create({
        justifyContent: "center"
    });

    const course_catalog: gridBox = {
        imageID: "course_browser_icon",
        name: "Course Catalog",
        link: "/courseCatalog/search",
    };
    return (
        <SafeAreaView className="flex-1 justify-center items-center" style={{padding:"20%", paddingLeft: 20}} >

        {/*Mandatory back button*/}
        <View className="w-full items-center">
             <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingTop: 10 }} onPress={() => { routeNavigator.back() }}>
                 <BackChevron style={{ width: 20, height: 20 }} color="#000"/>
                 <View>
                    <Text style={{ color: "#F76902", fontSize: 15,
                                fontWeight: "bold"}}>RIT CATALOG</Text>
                </View>
            </TouchableOpacity>
        </View>
        {/*Mandatory back button*/}

            <View className="w-full items-center h-[80%]" style={{buttonStyle, padding: 10}}>
                {/*Title*/}
                <View>
                    <Text style={{ color: "#000000", fontSize: 35,
                                    fontWeight: "bold"}}>Catalog Browser</Text>
                    <Text style={{ color: "#7B7878", fontSize: 16,
                                    addingTop: 1,
                                    paddingTop: 10,
                                    paddingBottom: 15}}>Find courses, plan your semester</Text>
                </View>
                {/*Title*/}


                <TouchableOpacity title="Search All Courses"
                        style={{backgroundColor: "#000000",
                        borderRadius: 15,
                        alignItems: "center",
                        flexDirection: "row",}} onPress={() => processQuickLink(course_catalog)}>
                        <View style={{ width: 60, height: 60 , padding: 10, paddingLeft: 10}}>
                            <Image
                                source={require("../../assets/icons/grid/course-browser.png")}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                        </View>
                     <View style={{paddingTop: "5%", paddingBottom: "5%"}}>
                        <Text style={{buttonStyle, fontWeight: "bold", fontSize: 20, color: "#F5F5F5"}}>Search All Courses</Text>
                         <Text style={{buttonStyle, fontWeight: "bold", fontSize: 12, color: "#F5F5F5"}}>Browse All Courses At RIT</Text>
                     </View>
                     <Text style={{color: "#F5F5F5", fontSize: 40, paddingLeft: 70}}>></Text>
                     {/*<BackChevron style={{ width: 30, height: 30, transform: [{ scaleX: -1 }] , color: "#F5F5F5" }} color="#000"/>*/}
                </TouchableOpacity>
            </View>
            <View className="w-full items-center h-[80%]" style={{buttonStyle, padding: 10,}}>
                <TouchableOpacity title="Search All Courses"
                        style={{backgroundColor: "#F5F5F5",
                        borderRadius: 15,
                        alignItems: "center",
                        flexDirection: "row", borderWidth: 2, borderColor: '#00000050',}} onPress={() => processQuickLink(course_catalog)}>
                        <View style={{ width: 60, height: 60 , padding: 10, paddingLeft: 10}}>
                            <Image
                                source={require("../../assets/icons/grid/academic-calendar.png")}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                        </View>
                     <View style={{paddingTop: "5%", paddingBottom: "5%"}}>
                        <Text style={{buttonStyle, fontWeight: "bold", fontSize: 20, color: "#000000"}}>Search All Courses</Text>
                         <Text style={{buttonStyle, fontWeight: "bold", fontSize: 12, color: "#000000"}}>Browse All Courses At RIT</Text>
                     </View>
                     <Text style={{color: "#000000", fontSize: 40, paddingLeft: 70}}>></Text>
                     {/*<BackChevron style={{ width: 30, height: 30, transform: [{ scaleX: -1 }] , color: "#F5F5F5" }} color="#000"/>*/}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
