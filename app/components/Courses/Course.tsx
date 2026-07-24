import { TouchableOpacity, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { buildApiUrl } from "@/lib/api";

/**
 * @typedef Course
 * @property {string} code
 * @property {string} key
 * @property {string} srcdb
 * @property {string} title
 */

 //  Three possible links for information
 //  /courses/classlookup?course_code= -> gives sections, start and end dates
 //  /courses/info?code -> gives credits, description, semester
 //  /courses/classinfo?course_code=<>&terms=<> -> gives info on section each class day and start time

export default function Course({course}: {
// Need to get full department, all the sections, the instructors, etc
// Just need to get all the information of all sections

    return {

    };
}
export const storeRecentlyView = async (course: gridBox) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Course Catalog</Text>
    </View>
  );
}
