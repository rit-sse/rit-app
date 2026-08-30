import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, TextInput, FlatList } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter, useLocalSearchParams  } from "expo-router";


interface courseObj {
    key: string;
    code: string;
    srcdb: string;
    title: string;
    description: string;
    tags: string[];
}


export default function Course() {

    }