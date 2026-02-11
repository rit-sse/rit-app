import React from "react";
import { View, Text, FlatList, SectionList, StyleSheet, Image, Button, Pressable, Linking } from "react-native";

import { RelativePathString, useRouter } from "expo-router";

/**
 * Quick Grid section of the app
 * 
 * Last Updated: 2/4/2026
 * 
 * Edited by:
 * 
 * 
 */


// Icons sourced from https://lucide.dev/icons
const IMAGE_DATA = [
  {source: require('../assets/icons/square-play-48.png'), name: "YouTube", bgColorHex: "#cd0000", link: "https://www.youtube.com/"  },
  {source: require('../assets/icons/map-48.png'), name: "Map", bgColorHex: "#82ffb2", link: "map"  },
  {source: require('../assets/icons/calendar-48.png'), name: "Calendar", bgColorHex: "#fff382", link: "calendar"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ffac27", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff8282", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#45fff6", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#82acff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#00c42a", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#fff382", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ffac27", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff8282", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#45fff6", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff0000", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#00c42a", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#fff382", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ffac27", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff8282", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#45fff6", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff0000", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#00c42a", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#fff382", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ffac27", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff8282", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff00ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#45fff6", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#ff0000", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#8bb1ff", link: "PLACEHOLDER"  },
  {source: require('../assets/icons/hamburger-48.png'), name: "Food", bgColorHex: "#00c42a", link: "PLACEHOLDER"  },

]


const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 70,
    margin: 5,
    marginBottom: 25,
  },
  header: {
    height: 40,
    fontSize: 32,
  },
  footer: {
    height: 140,
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



export default function grid() {
  const routeNavigator = useRouter();

  /**
   * opens a given link
   * 
   * @param link 
   * @returns null
   */
  async function openLink(link: string){
    if(link === "PLACEHOLDER"){ // account for placeholders
      return null;
    }

    if(link.includes("http")){ // open a website through a URL
      // Check if the device can open the URL
      const supported = await Linking.canOpenURL(link);

      if (supported) {
        // Open the URL in the default browser
        await Linking.openURL(link);
      } else {
        console.log("This device does not know how to open the URI: " + link);
      }
    }
    else{ // switch screens to another screen on this app
      routeNavigator.replace(link as RelativePathString);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View style={styles.header}></View>
      <FlatList
        data={IMAGE_DATA}
        numColumns={4}
        style={{width: '100%', paddingLeft: 20, paddingRight: 20}}

        renderItem={({item}) => ( // renders each quick grid item with its (48x48) icon and text
          <View style={styles.container}>
            <Pressable 
              onPress={() => openLink(item.link)}
              style={({pressed}) => [
              {
                opacity: pressed ? 0.4 : 1,
              },
              styles.itemContainer, 
              {backgroundColor: item.bgColorHex}
              ]}
              hitSlop={{
                top: 5,
                left: 5,
                right: 5,
                bottom: 25,
              }}
              pressRetentionOffset={{
                top: 5,
                left: 5,
                right: 5,
                bottom: 25,
              }}
             > 
              <Image source={item.source} style={styles.itemImage}></Image>
            </Pressable>
            <Text style={[styles.itemText, {zIndex: -1}]}>
              {item.name}
            </Text>
          </View>
        )}
      />
      <View style={styles.footer}></View>
    </View>
  );
}