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

    const course_catalog: gridBox = {
        imageID: "course_browser_icon",
        name: "Course Catalog",
        link: "/courseCatalog/search",
    };

    const course_saved: gridBox = {
            imageID: "course_browser_icon",
            name: "Course Saved",
            link: "/courseCatalog/saved",
        };
    return (
        <SafeAreaView style={{padding:"20%", paddingLeft: 20}} >

        {/*Mandatory back button*/}
        <View>
             <TouchableOpacity style={styles.rowObjects} onPress={() => { routeNavigator.back() }}>
                 <BackChevron style={styles.backChevronStyle} color="#000"/>
                 <View>
                    <Text style={styles.ritBackLabel}>RIT CATALOG</Text>
                </View>
            </TouchableOpacity>
        </View>
        {/*Mandatory back button*/}

            <View style={styles.categoryButton, {padding: 10}}>
                {/*Title*/}
                <View>
                    <Text style={styles.PageTitle}>Catalog Browser</Text>
                    <Text style={styles.PageSubTitle}>Find courses, plan your semester</Text>
                </View>
                {/*Title*/}


                <TouchableOpacity title="Search All Courses"
                        style={[{backgroundColor: "#000000"}, styles.categorybox]} onPress={() => processQuickLink(course_catalog)}>
                        <View style={styles.iconImg}>
                            <Image
                                source={require("../../assets/icons/grid/course-browser.png")}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                        </View>
                     <View style={{paddingTop: "5%", paddingBottom: "5%"}}>
                        <Text style={[{color: "#F5F5F5"}, styles.categoryTitle]}>Search All Courses</Text>
                         <Text style={[{color: "#F5F5F5"}, styles.categorySubTitle]}>Browse All Courses At RIT</Text>
                     </View>
                     <Text style={{color: "#F5F5F5", fontSize: 40, paddingLeft: 70}}>></Text>
                     {/*<BackChevron style={{ width: 30, height: 30, transform: [{ scaleX: -1 }] , color: "#F5F5F5" }} color="#000"/>*/}
                </TouchableOpacity>
            </View>
            <View style={{padding: 10,}}>
                <TouchableOpacity title="Search All Courses"
                        style={[{backgroundColor: "#F5F5F5", borderWidth: 2, borderColor: '#00000050'}, styles.categorybox]} onPress={() => processQuickLink(course_catalog)}>
                        <View style={styles.iconImg}>
                            <Image
                                source={require("../../assets/icons/grid/academic-calendar.png")}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                        </View>
                     <View style={{paddingTop: "5%", paddingBottom: "5%"}}>
                        <Text style={[styles.categoryTitle, {color: "#000000"}]}>Search All Courses</Text>
                         <Text style={[styles.categorySubTitle, {color: "#000000"}]}>Browse All Courses At RIT</Text>
                     </View>
                     <Text style={{color: "#000000", fontSize: 40, paddingLeft: 70}}>></Text>
                     {/*<BackChevron style={{ width: 30, height: 30, transform: [{ scaleX: -1 }] , color: "#F5F5F5" }} color="#000"/>*/}
                </TouchableOpacity>
            </View>


            <View style={{padding: 10,}}>
                <TouchableOpacity title="Search All Courses"
                        style={[{backgroundColor: "#F5F5F5", borderWidth: 2, borderColor: '#00000050'}, styles.categorybox]} onPress={() => processQuickLink(course_saved)}>
                        <View style={styles.iconImg}>
                            <Image
                                source={require("../../assets/icons/grid/academic-calendar.png")}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                        </View>
                     <View style={{paddingTop: "5%", paddingBottom: "5%"}}>
                        <Text style={[styles.categoryTitle, {color: "#000000"}]}>Saved Courses</Text>
                         <Text style={[styles.categorySubTitle, {color: "#000000"}]}>Courses that you saved!</Text>
                     </View>
                     <Text style={{color: "#000000", fontSize: 40, paddingLeft: 70}}>></Text>
                     {/*<BackChevron style={{ width: 30, height: 30, transform: [{ scaleX: -1 }] , color: "#F5F5F5" }} color="#000"/>*/}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

    const styles = StyleSheet.create({
        //things that need to be in a row
        rowObjects: { flexDirection: "row", alignItems: "center", paddingTop: 10 },
        //"RIT Catalog" back label
        ritBackLabel: { color: "#F76902", fontSize: 15, fontWeight: "bold" },
        backChevronStyle: { width: 20, height: 20 },
        ritFontColor: {color: "#F76902"},
        categoryButton: {justifyContent: "center"},
        PageTitle: {color: "#000000", fontSize: 35, fontWeight: "bold"},
        PageSubTitle: {color: "#7B7878", fontSize: 16, addingTop: 1, paddingTop: 10, paddingBottom: 15},
        categorybox: {borderRadius: 15,
                                alignItems: "center",
                                flexDirection: "row",},
        iconImg: { width: 60, height: 60 , padding: 10, paddingLeft: 10},
        categoryTitle: {justifyContent: "center", fontWeight: "bold", fontSize: 20},
        categorySubTitle: {justifyContent: "center", fontSize: 14},
    });