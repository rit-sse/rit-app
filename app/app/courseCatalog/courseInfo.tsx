import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter, useLocalSearchParams  } from "expo-router";
import Course from "../../components/courses/Course"


interface CourseObj {
    key: string;
    code: string;
    srcdb: string;
    title: string;
    description: string;
}
export default function CourseInfoScreen() {
    const {q} = useLocalSearchParams();
    const routeNavigator = useRouter();
    const holder = "hold";
    const [course, setCourse] = useState(null);
    const [courseInfo, setCourseInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                console.log("hello");
                const responseCourse = await fetch(buildApiUrl(`/courses/info?code=${q}`));
                const dataCourse = await responseCourse.json();
                console.log(dataCourse);

                setCourse(dataCourse);

                const responseCourseInfo = await fetch(buildApiUrl(`/courses/classlookup?course_code=${q}`));
                const dataCourseInfo = await responseCourseInfo.json();
                console.log(dataCourseInfo.length);
                setCourseInfo(dataCourseInfo);

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

//     const courseObject = new Course(course);
//     console.log(courseObject.toJSON());
        const currentCourse: CourseObj = {
            key: course.key,
            code: course.code,
            srcdb: course.srcdb,
            title: course.title,
            description: course.description,
        };
    const semester = course.typically_offered.replace(/<[^>]+>/g, '').trim();
    const credits = course.hours_html;
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

        <View className="w-full items-center" style = {{padding: 10}}>
            <View>
                <Text style={{ color: "#F76902", fontSize: 15,
                                    fontWeight: "bold",
                                    paddingTop: 1}}>{course.code}</Text>
                <Text style={{ color: "#00000", fontSize: 30,
                                    addingTop: 1, fontWeight: 'bold'}}>{course.title}</Text>
                <View style={styles.tagContainer}>
                    <Text style={styles.tags}>{semester}</Text>
                    <Text style={styles.tags}>{credits}</Text>
                </View>
            </View>

            <View>
                <Text style={{ color: "#F76902", fontSize: 15,
                            fontWeight: "bold",
                            paddingTop: 1}}>Description</Text>
                <Text style={{ color: "#00000", fontSize: 15,
                             addingTop: 1}}>{currentCourse.description}</Text>
            </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
        container: { flex: 1, padding: 20},
        searchInput: { height: 50, borderWidth: 1, borderColor: '#F76902', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
        loader: { marginVertical: 15 },
        resultItem: { padding: 10, borderWidth: 1, borderColor: '#F76902', borderRadius: 8 },
        resultTitle: { fontSize: 16, color: '#F76902', fontWeight: 'bold' },
        resultName: { fontSize: 16, color: '#000000' },
        emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
        tagContainer: {flexDirection: 'row', padding: 3},
        tags: {fontSize: 13, fontWeight: 'bold', color: '#00000095', backgroundColor: '#F7690233', padding: 5, borderRadius: 8, marginRight: 6},
    });
