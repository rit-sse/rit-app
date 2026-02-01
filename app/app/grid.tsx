import React from "react";
import { View, Text, FlatList, SectionList, StyleSheet, Image } from "react-native";


// <a target="_blank" href="https://icons8.com/icon/XkPsmwSq30hf/hamburger">Hamburger</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
const DATA = [
    'Pizza', 'Burger', 'Risotto',
    'French Fries', 'Onion Rings', 'Fried Shrimps',
    'Water', 'Coke', 'Beer',
    'Cheese Cake', 'Ice Cream'
];

const IMAGE_DATA = [
  { id: '1', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '2', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '3', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '4', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '5', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '6', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '7', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '8', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '9', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },
  { id: '10', source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food" },

]


const styles = StyleSheet.create({
  container: {
    width: 75,
    margin: 5,
    marginBottom: 25,
    aspectRatio: 1, // Optional: makes items perfect squares
  },
  header: {
    height: '15%',
    fontSize: 32,
  },
  itemContainer: {
    backgroundColor: '#82acff',
    aspectRatio: 1, // Optional: makes items perfect squares
    borderRadius: 15,
    boxShadow: '2px 2px 2px',
  },
  itemImage: {
    margin: 'auto',
    textAlign: 'center',
    justifyContent: 'center',
    height: '80%',
    width: '80%',
  },
  itemText: {
    margin: 'auto',
    paddingTop: 5,
    textAlign: 'center',
    justifyContent: 'center',
    width: '100%',
  },

});

export default function grid() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.header}></View>
      <FlatList
        data={IMAGE_DATA}
        numColumns={4}
        keyExtractor={(item) => item.id}

        renderItem={({item}) => ( // renders each quick grid item with its (48x48) icon and text
          <View style={styles.container}>
            <View style={styles.itemContainer}> 
              <Image source={item.source} style={styles.itemImage}></Image>
            </View>
            <Text style={styles.itemText}>
              {item.name}
            </Text>
          </View>
        )}
        // renderSectionHeader={({section: {title}}) => (
        //   <Text style={styles.header}>{title}</Text>
        // )}
      />
    </View>
  );
}