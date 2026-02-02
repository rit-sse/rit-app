import React from "react";
import { View, Text, FlatList, SectionList, StyleSheet, Image, Button, Pressable } from "react-native";


const DATA = [
    'Pizza', 'Burger', 'Risotto',
    'French Fries', 'Onion Rings', 'Fried Shrimps',
    'Water', 'Coke', 'Beer',
    'Cheese Cake', 'Ice Cream'
];

// <a target="_blank" href="https://icons8.com/icon/XkPsmwSq30hf/hamburger">Hamburger</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
const IMAGE_DATA = [
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#82acff" },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#82ffb2"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#fff382"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ffac27"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff8282"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#45fff6"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff0000"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#00c42a"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#fff382"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ffac27"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff8282"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#45fff6"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff0000"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#00c42a"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#fff382"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ffac27"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff8282"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#45fff6"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff0000"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#00c42a"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#fff382"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ffac27"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff8282"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#45fff6"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#ff0000"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff"  },
  {source: require('..\\assets\\icons\\icons8-hamburger-48.png'), name: "Food", bgColorHex: "#00c42a"  },

]


const styles = StyleSheet.create({
  container: {
    width: 70,
    margin: 5,
    marginBottom: 25,
    height: 70
  },
  header: {
    height: '5%',
    fontSize: 32,
  },
  footer: {
    height: '18%',
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
  },
  itemText: {
    margin: 'auto',
    paddingTop: 5,
    textAlign: 'center',
    justifyContent: 'center',
    width: '100%',
  },

});

function onPressFunction(){
  return null;
}

export default function grid() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.header}></View>
      <FlatList
        data={IMAGE_DATA}
        numColumns={4}
        style={{width: '100%', paddingLeft: 20, paddingRight: 20}}

        renderItem={({item}) => ( // renders each quick grid item with its (48x48) icon and text
          <View 
            style={styles.container}
            // onPress={onPressFunction}
            // style={({pressed}) => [
            // {
            //   backgroundColor: pressed ? 'rgba(0, 0, 0, 0.1)' : 'white',
            // },]
            >
            <Pressable 
              onPress={onPressFunction}
              style={({pressed}) => [
              {
                opacity: pressed ? 0.4 : 1,
              },
              styles.itemContainer, 
              {backgroundColor: item.bgColorHex}
            ]}
             /* style={[styles.itemContainer, {backgroundColor: item.bgColorHex}]} */
             > 
              <Image source={item.source} style={styles.itemImage}></Image>
            </Pressable>
            <Text style={styles.itemText}>
              {item.name}
            </Text>
          </View>
        )}
        // renderSectionHeader={({section: {title}}) => (
        //   <Text style={styles.header}>{title}</Text>
        // )}
      />
      <View style={styles.footer}></View>
    </View>
  );
}