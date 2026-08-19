import React, { useEffect, useState } from "react";
import {SafeAreaView, View, Text, Image, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Linking } from "react-native"
import { RelativePathString } from "expo-router"
import { useRouter } from "expo-router";
import BackChevron from "../../components/svgs/BackChevron"

export interface courseObj {
    key: string;
    code: string;
    srcdb: string;
    title: string;
    description: string;
    }
export const storeSavedCourses = async (item: course) => {
    console.log("hi");
    const currentSaved = await AsyncStorage.getItem('savedCourses');
    if (currentSaved) {
        const parsed = JSON.parse(currentSaved);
        let preExistingI = false;

        for (let i = 0; i< parsed.length; i++){
            if (parsed[i].link == item.link) {
                parsed.splice(i,1);
                parsed.push(item);
                preExistingI = true;

            }
        }
        if (!preExistingI) {
            parsed.push(item);
            }
        await AsyncStorage.setItem("savedCourses", JSON.stringify(parsed));
    } else {
        await AsyncStorage.setItem("savedCourses", JSON.stringify([item]));
        }

    }

export const getSavedCourses = async (): Promise<course[]> => {
  const currentSaved = await AsyncStorage.getItem("savedCourses");
  if (currentSaved) {
    return JSON.parse(currentSaved);
  } else {
    return [];
  }
}

export default function SavedCoursesScreen() {
  const [savedCourses, setSavedCourses] = useState<course[]>([]);
  const routeNavigator = useRouter();
  useEffect(() => {
    const loadSaved = async () => {
      const saved = await getSavedCourses();
      setSavedCourses(saved);
    };

    loadSaved();
  }, []);

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
      <Text style={{ fontSize: 30, fontWeight: "bold", margin: 20 }}>
        Saved Courses
      </Text>

      <FlatList
        data={savedCourses}
        keyExtractor={(item) => item.link}
        renderItem={({item}) => (
                        <View style={styles.resultItem}>
                            <TouchableOpacity onPress={() => {
                                routeNavigator.push({
                                    pathname: "/courseCatalog/courseInfo",
                                    params: {q: item.code}
                                    })}}>
                                <Text style={styles.resultTitle}>{item.code}</Text>
                                <Text style={styles.resultName}>{item.title}</Text>
                                <View style={styles.tagContainer}>
                                    <Text style={styles.tags}>{item.code}</Text>
                                    <Text style={styles.tags}>{item.code}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    resultItem: { padding: 10, borderWidth: 2, borderColor: '#F7690250', borderRadius: 12 },
            resultTitle: { fontSize: 13, color: '#F76902', fontWeight: 'bold' },
            resultName: { fontSize: 16, color: '#000000' },
            emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
            tagContainer: {flexDirection: 'row', padding: 3},
            tags: {fontSize: 11, backgroundColor: '#F7690233', padding: 5, borderRadius: 8, margin: 4},

            })