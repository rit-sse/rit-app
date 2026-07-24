import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
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
        <SafeAreaView className="flex-1 justify-center items-center" style={{padding:"15%", paddingLeft: 10}} >

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


            <View>
                <Text style={{ color: "#000000", fontSize: 35,
                                fontWeight: "bold",
                                paddingTop: 1}}>Catalog Browser</Text>
                <Text style={{ color: "#7B7878", fontSize: 16,
                                addingTop: 1}}>Find courses, plan your semester</Text>
            </View>


            <View className="w-full items-center h-[80%]" style={{buttonStyle, padding: 10}}>
                <TouchableOpacity title="Search All Courses"
                        style={{backgroundColor: "#F76902",
                        borderRadius: 10,
                        alignItems: "center",}} onPress={() => processQuickLink(course_catalog)}>
                    <Text style={{buttonStyle, fontWeight: "bold", fontSize: 15, padding: "5%"}}>Course Catalog</Text>
                </TouchableOpacity>
            </View>
            <View className="w-full items-center h-[80%]" style={{buttonStyle, padding: 10}}>
                <TouchableOpacity title="Search All Courses"
                             style={{backgroundColor: "#000000",
                            borderRadius: 10,
                            alignItems: "center"}} onPress={() => processQuickLink(course_catalog)}>
                    <Text style={{buttonStyle, color: "#F5F5F5", fontWeight: "bold", fontSize: 15, padding: "5%"}}>By Semester</Text>
                 </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
