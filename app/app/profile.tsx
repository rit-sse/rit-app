import { View, Text, Image, StyleSheet, StatusBar, FlatList, TouchableOpacity } from "react-native";
import { Router, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as GLOBAL from "./globals";
import { useState } from "react";
import Svg, { Use, Image as SVGImage } from 'react-native-svg';


const PREF = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'Appearance',
    filename: '/appearance',
    icon: '../assets/images/alert-svgrepo-com.png'
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Notifications',
    filename: '/notifications',
    icon: '../assets/images/alert-svgrepo-com.png'
  },
];

const SUPPORT = [
  {
    id: '1',
    title: 'Report an Issue',
    filename: '/report',
    icon: '../assets/images/alert-svgrepo-com.png'
  },
  {
    id: '2',
    title: 'FAQ',
    filename: '/faq',
    icon: '../assets/images/alert-svgrepo-com.png'
  },
  {
    id: '3',
    title: 'Terms, Privacy, FERPA',
    filename: '/terms',
    icon: '../assets/images/alert-svgrepo-com.png'
  },
  {
    id: '4',
    title: 'App Information',
    filename: '/info',
    icon: '../assets/images/alert-svgrepo-com.png'
  },
];

function changePage(filename: any, navigator: Router) {
  GLOBAL.default.navbar?.setState({ navBarVisibility: false });
  navigator.push(filename);
}

export function backToProfile(navigator: Router) {
  GLOBAL.default.navbar?.setState({ navBarVisibility: true });
  navigator.push("/profile");
}

type ItemProps = {title: string, filename: string, navigator: any};

const Item = ({title, filename, navigator}: ItemProps) => (
  <TouchableOpacity style={styles.button} onPress={() => {changePage(filename, navigator);}}>
    <View style={styles.item}>
      <View>
        <Svg width="35" height="35">
          <SVGImage
          width="80%"
          height="100%"
          href={require('../assets/images/alert-svgrepo-com.png')} />
        </Svg>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.trailingIcon}>icon</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({

  profileImage: {
    width: 120,
    height: 120,
  },
  page: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    paddingHorizontal: 20
  },
  user: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center"
  },
  sections: {
    flex: 7,
  },
  sectionTitle: {
    fontSize: 16,
    paddingVertical: 10
  },
  item: {
    marginVertical: 2,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    flex: 5,
    justifyContent: "center"
  },
  leadingIcon: {
    flex: 1
  },
  trailingIcon: {
    flex: 1
  },
  button: {

  }
})

export default function Profile() {
  const navigator = useRouter();

  /*navigator.push("filename")*/
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.user}>
          <Image
            source = {require("../assets/images/splash-icon.png")}
            style = {styles.profileImage}
          />
          <Text style = {{fontSize: 24, padding: 10}}>John Rochester</Text>
          <Text>jr123@rit.edu</Text>
        </View>
        <View style={styles.sections}>
          <View>
            <Text style={styles.sectionTitle}>Preferances</Text>
            <FlatList
              data={PREF}
              renderItem={({item}) => <Item title={item.title} filename={item.filename} navigator={navigator}/>}
              keyExtractor={item => item.id}
              scrollEnabled = {false}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Support</Text>
            <FlatList
              data={SUPPORT}
              renderItem={({item}) => <Item title={item.title} filename={item.filename} navigator={navigator}/>}
              keyExtractor={item => item.id}
              scrollEnabled = {false}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}