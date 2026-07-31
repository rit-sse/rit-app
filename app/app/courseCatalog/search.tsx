import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { storeRecentlyView, gridBox, openLink, processQuickLink } from "@/lib/utils";
import { useRouter } from "expo-router";
import Course from "../../components/courses/Course"


export default function ResultsScreen() {

    function CollapsibleSection({ title, children }) {
      const [open, setOpen] = useState(false);

      return (
        <View style={{ marginVertical: 10 }}>
          <TouchableOpacity
            onPress={() => setOpen(!open)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
            <Text style={{ fontSize: 18 }}>{open ? "▲" : "▼"}</Text>
          </TouchableOpacity>

          {open && (
            <View style={{ paddingLeft: 5 }}>
              {children}
            </View>
          )}
        </View>
      );
    }


    const routeNavigator = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

//     Advanced search params
     const [filters, setFilters] = useState({
      colleges: [],
      graduateTypes: [],
      // add more categories as needed
    });

    function toggleFilter(category: string, value: string) {
      setFilters(prev => {
        const exists = prev[category].includes(value);

        return {
          ...prev,
          [category]: exists
            ? prev[category].filter(v => v !== value)
            : [...prev[category], value]
        };
      });
    }



    function MultiToggle({ title, items, category }) {
          return (
            <View style={{ marginVertical: 10 }}>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>{title}</Text>

              {items.map(item => {
                const isSelected = filters[category].includes(item.value);

                return (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => toggleFilter(category, item.value)}
                    style={{
                      padding: 10,
                      marginVertical: 5,
                      borderRadius: 8,
                      backgroundColor: isSelected ? "#F76902" : "#E5E5E5"
                    }}
                  >
                    <Text style={{ color: isSelected ? "#FFF" : "#000" }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }
        const [selectors, setSelectors] = useState(null);

    useEffect(() => {
      const loadSelectors = async () => {
        const response = await fetch(buildApiUrl("/courses/selectors"));
        const data = await response.json();
        setSelectors(data);
      };

      loadSelectors();
    }, []);
//     handling getting data from webserver
    const searchCourses = async (text) => {
        setQuery(text);

        if (text.length < 3) {
            setResults([]);
            return;
          }
        setLoading(true);
        try {
            const params = new URLSearchParams({
                keyword: text,
                colleges: filters.colleges.join(",")
                });
            const responseResults = await fetch(
                    buildApiUrl(`/courses/advancedsearch?${params.toString()}`));
            console.log(responseResults);
            const data = await responseResults.json();
            console.log("ADVANCED SEARCH RESPONSE:", data);

            const resultsArray = data?.results ?? [];
            setResults(resultsArray);
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
                                fontWeight: "bold"}}>RIT CATALOG</Text>
                </View>
            </TouchableOpacity>
        </View>
        {/*Mandatory back button*/}

        <View className="w-full items-center" style = {{padding: "2%"}}>
            {/*Title*/}
                  <View style={{paddingBottom: 10}}>
                    <Text style={{ color: "#000000", fontSize: 35,
                              fontWeight: "bold"}}>Courses</Text>

                  </View>
              {/*Title*/}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search courses..."
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search" // Changes the keyboard return key to say "Search"
                              onSubmitEditing={() => searchCourses(query)}
                            />
                           <Button title="Search" onPress={() => searchCourses(query)} />

                {loading && <ActivityIndicator style={styles.loader} size="large" color="#000" />}
                <View>{selectors && (
                        <ScrollView style={{ maxHeight: 300 }}>
                          <CollapsibleSection title="Colleges">
                            <MultiToggle
                              items={selectors.colleges}
                              category="colleges"
                            />
                          </CollapsibleSection>

                          <CollapsibleSection title="Graduate Types">
                            <MultiToggle
                              items={selectors.graduateTypes}
                              category="graduateTypes"
                            />
                          </CollapsibleSection>

                          {/* Add more collapsible sections as needed */}
                        </ScrollView>
                      )}

                </View>
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
                    ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
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
        resultItem: { padding: 10, borderWidth: 2, borderColor: '#F7690250', borderRadius: 12 },
        resultTitle: { fontSize: 13, color: '#F76902', fontWeight: 'bold' },
        resultName: { fontSize: 16, color: '#000000' },
        emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
        tagContainer: {flexDirection: 'row', padding: 3},
        tags: {fontSize: 11, backgroundColor: '#F7690233', padding: 5, borderRadius: 8, margin: 4},
    });

