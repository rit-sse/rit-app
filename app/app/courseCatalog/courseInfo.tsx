import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter, useLocalSearchParams  } from "expo-router";

export default function CourseInfoScreen() {
    const {q} = useLocalSearchParams();
    console.log(q);
    const routeNavigator = useRouter();
    const holder = "hold";
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(buildApiUrl(`/courses/info?code=${q}`));
                const data = await response.json();
                console.log(data);
                setCourse(data);
            } catch (err) {
                console.error("Error fetching course:", err);
            } finally {
                setLoading(false);
                }
        };
        fetchCourse();
        }, [q]);
    if (loading || !course) {
        return (
          <SafeAreaView style={{ padding: 20 }}>
            <Text>Loading...</Text>
          </SafeAreaView>
        );
      }
    const semester = course.typically_offered.replace(/<[^>]+>/g, '').trim();
    const credits = course.hours_html;
        console.log(course.title);
  return (
    <SafeAreaView>
        <View className="w-full items-center">
             <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", paddingTop: 10 }} onPress={() => { routeNavigator.back() }}>
                 <BackChevron style={{ width: 20, height: 20 }} color="#000"/>
                 <View>
                    <Text style={{ color: "#F76902", fontSize: 15,
                                fontWeight: "bold"}}>RIT COURSES</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View>
          <Text> {semester}</Text>
          <Text>{credits}</Text>
        </View>
    </SafeAreaView>
  );
}
