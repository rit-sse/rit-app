import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter } from "expo-router";
 //  Three possible links for information
 //  /courses/classlookup?course_code= -> gives sections, start and end dates
 //  /courses/info?code -> gives credits, description, semester
 //  /courses/classinfo?course_code=<>&terms=<> -> gives info on section each class day and start time
/**
 * @typedef Course
 * @property {string} code
 * @property {string} key
 * @property {string} srcdb
 * @property {string} title
 */
export default function Course(course) {
//     console.log(course.title + " " + course.code+ " " + course.description);
//         console.log(course);
    // Need to get full department, all the sections, the instructors, etc
    // Just need to get all the information of all sections

  return {
    // Raw JSON
    toJSON() {
      return course;
    },

    // Simple text
    toText() {
      return `${course.code} — ${course.title}`;
    },

    toSearchView() {
        return (
            <View style={styles.resultItem}>
                <Text style={styles.resultTitle}>{course.code}</Text>
                <Text style={styles.resultName}>{course.title}</Text>
                <View style={styles.tagContainer}>
                    <Text style={styles.tags}>{course.code}</Text>
                    <Text style={styles.tags}>{course.code}</Text>
                </View>
            </View>
            )
        }
    }
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
        tags: {fontSize: 13, fontWeight: 'bold', color: '#00000095', backgroundColor: '#F7690233', padding: 5, borderRadius: 8, marginRight: 6}
    });
