import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {View, Text, Button, ScrollView, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Modal } from "react-native";
import { buildApiUrl } from "@/lib/api";
import BackChevron from "../../components/svgs/BackChevron"
import { processQuickLink, storeRecentlyView, gridBox, openLink } from "@/lib/utils";
import { useRouter } from "expo-router";
import Course from "../../components/courses/Course"


export default function ResultsScreen() {
    //     Advanced search params
     const [filters, setFilters] = useState({
      colleges: [],
      graduateTypes: [],
      subjects: [],
      perspectives: [],
      // add more categories as needed
    });
    const [showFilters, setShowFilters] = useState(false);


    //collapsible screen for filters--------------------------------------
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


    //filter to toggle tags--------------------------------------------------
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


    // multi tags -------------------------------------------------
    function MultiToggle({ items, category, filters, toggleFilter }) {
      return (
        <View style={{ marginVertical: 10 }}>
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
        const routeNavigator = useRouter();
        const [query, setQuery] = useState('');
        const [results, setResults] = useState([]);
        const [loading, setLoading] = useState(false);


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
                colleges: filters.colleges.join(","),
                graduateTypes: filters.graduateTypes.join(","),
                subjects: filters.subjects.join(","),
                perspectives: filters.perspectives.join(",")
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


    const buttonStyle = StyleSheet.create({
        justifyContent: "center"
    });


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
              <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search courses..."
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search" // Changes the keyboard return key to say "Search"
                                  onSubmitEditing={() => searchCourses(query)}
                                />
                    <View> <Button title="->" color="#000" onPress={() => searchCourses(query)}/> </View>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowFilters(true)}
                      >
                        <Text style={{ color: "#FFF", fontWeight: "bold" }}>Filters</Text>
                      </TouchableOpacity>
              </View>
                {loading && <ActivityIndicator style={styles.loader} size="large" color="#000" />}

               <Modal visible={showFilters} animationType="slide" transparent={true}>
                 <View style={styles.bottomSheetOverlay}>
                   <View style={styles.bottomSheet}>

                     <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                       <Text style={{ fontSize: 22, fontWeight: "bold" }}>Filters</Text>
                       <TouchableOpacity onPress={() => setShowFilters(false)}>
                         <Text style={{ fontSize: 18, color: "#F76902" }}>Close</Text>
                       </TouchableOpacity>
                     </View>

                     {selectors ? (
                       <ScrollView style={{ marginTop: 20 }}>
                         <CollapsibleSection title="Colleges">
                           <MultiToggle
                             items={selectors.colleges}
                             category="colleges"
                             filters={filters}
                             toggleFilter={toggleFilter}
                           />
                         </CollapsibleSection>

                         <CollapsibleSection title="Graduate Types">
                           <MultiToggle
                             items={selectors.graduateTypes}
                             category="graduateTypes"
                             filters={filters}
                             toggleFilter={toggleFilter}
                           />
                         </CollapsibleSection>

                         <CollapsibleSection title="Subjects">
                           <MultiToggle
                             items={selectors.subjects}
                             category="subjects"
                             filters={filters}
                             toggleFilter={toggleFilter}
                           />
                         </CollapsibleSection>

                         <CollapsibleSection title="Perspectives">
                           <MultiToggle
                             items={selectors.perspectives}
                             category="perspectives"
                             filters={filters}
                             toggleFilter={toggleFilter}
                           />
                         </CollapsibleSection>
                       </ScrollView>
                     ) : (
                       <ActivityIndicator size="large" color="#F76902" style={{ marginTop: 20 }} />
                     )}

                     <TouchableOpacity
                       style={styles.applyButton}
                       onPress={() => {
                         setShowFilters(false);
                         searchCourses(query);
                       }}
                     >
                       <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 18 }}>
                         Apply Filters
                       </Text>
                     </TouchableOpacity>

                   </View>
                 </View>
               </Modal>


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
        searchInput: { height: 50, borderWidth: 2, borderColor: '#00000050', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, flex: 1 },
        loader: { marginVertical: 15 },
        resultItem: { padding: 10, borderWidth: 2, borderColor: '#F7690250', borderRadius: 12 },
        resultTitle: { fontSize: 13, color: '#F76902', fontWeight: 'bold' },
        resultName: { fontSize: 16, color: '#000000' },
        emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
        tagContainer: {flexDirection: 'row', padding: 3},
        tags: {fontSize: 11, backgroundColor: '#F7690233', padding: 5, borderRadius: 8, margin: 4},
        filterButton: {
          backgroundColor: "#F76902",
          paddingHorizontal: 15,
          paddingVertical: 12,
          borderRadius: 8,
          marginLeft: 10
        },
        bottomSheetOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "flex-end"
        },
        bottomSheet: {
          backgroundColor: "#FFF",
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "80%"
        },
        applyButton: {
          backgroundColor: "#F76902",
          padding: 15,
          borderRadius: 10,
          marginTop: 10,
          alignItems: "center"
        }

    });