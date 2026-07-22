import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter } from "expo-router";

export default function ResultsScreen() {
    const routeNavigator = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

//     handling getting data from webserver
    const searchCourses = async (text) => {
        setQuery(text);

        if (text.length < 3) {
            setResults([]);
            return;
          }
        setLoading(true);
//         console.log(fetch(buildApiUrl(`/courses/search?q=${encodeURIComponent(text)}`)));
        try {
            const responseResults = await fetch(
                buildApiUrl(`/courses/search?q=${text}`));
//             console.log(responseResults);
            const data = await responseResults.json();
//             console.log(data.data.results[0]);
            setResults(data.data.results || []);
//             console.log(results);

        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

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
                                fontWeight: "bold"}}>RIT COURSES</Text>
                </View>
            </TouchableOpacity>
        </View>

        <View className="w-full items-center" style = {{padding: "2%"}}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search courses..."
                    value={query}
                    onChangeText={searchCourses}/>
                {loading && <ActivityIndicator style={styles.loader} size="large" color="#000" />}

                <FlatList
                    data={results}
                    keyExtractor={(item) => String(item.code)}
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
                    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        !loading && query.length >= 3 && <Text style={styles.emptyText} >No results found.</Text>
                    }/>
        </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
        container: { flex: 1, padding: 20},
        searchInput: { height: 50, borderWidth: 2, borderColor: '#00000050', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
        loader: { marginVertical: 15 },
        resultItem: { padding: 10, borderWidth: 2, borderColor: '#F7690250', borderRadius: 8 },
        resultTitle: { fontSize: 16, color: '#F76902', fontWeight: 'bold' },
        resultName: { fontSize: 16, color: '#000000' },
        emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
        tagContainer: {flexDirection: 'row', padding: 3},
        tags: {fontSize: 11, backgroundColor: '#F7690233', padding: 5, borderRadius: 8, margin: 4},
    });