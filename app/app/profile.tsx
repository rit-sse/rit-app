import { View, Text, Image, StyleSheet, StatusBar, FlatList, TouchableOpacity, ImageSourcePropType } from "react-native";
import { Router, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as GLOBAL from "./globals";
import { useEffect, useState } from "react";
import Svg, { Use, Image as SVGImage } from 'react-native-svg';


const PREF = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'Appearance',
    filename: '/profile/appearance',
    icon: require("../assets/images/profile/appearance.png")
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Notifications',
    filename: '/profile/notifications',
    icon: require("../assets/images/profile/notifications.png")
  },
];

const SUPPORT = [
  {
    id: '1',
    title: 'Report an Issue',
    filename: '/profile/report',
    icon: require("../assets/images/alert-svgrepo-com.png")
  },
  {
    id: '2',
    title: 'FAQ',
    filename: '/profile/faq',
    icon: require("../assets/images/profile/support.png")
  },
  {
    id: '3',
    title: 'Terms, Privacy, FERPA',
    filename: '/profile/terms',
    icon: require("../assets/images/profile/bookopen.png")
  },
  {
    id: '4',
    title: 'App Information',
    filename: '/profile/info',
    icon: require("../assets/images/profile/infocircle.png")
  },
];

function changePage(filename: any, navigator: Router) {
  GLOBAL.default.showNavbar ? GLOBAL.default.showNavbar(false) : null;
  navigator.push(filename);
}

export function backToProfile(navigator: Router) {
  GLOBAL.default.showNavbar ? GLOBAL.default.showNavbar(true) : null;
  navigator.push("/profile");
}

type ItemProps = {title: string, filename: string, navigator: any, icon: ImageSourcePropType};

const Item = ({title, filename, navigator, icon}: ItemProps) => (
  <TouchableOpacity style={styles.button} onPress={() => {changePage(filename, navigator);}}>
    <View style={styles.item}>
      <View>
        <Image source = {icon} style = {{width: 30, height: 30, marginRight: 10}}/>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Image source={require("../assets/images/profile/grayrightchevron.png")} style={{width: 30, height: 30}}/>
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
    paddingVertical: 10,
    fontWeight: "bold",
    color: "#919191"
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
          <Text style = {{fontSize: 24, padding: 10}}>Guest</Text>
          {/* <Text>No Email</Text> */}
        </View>
        <View style={styles.sections}>
          <View>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <FlatList
              data={PREF}
              renderItem={({item}) => <Item title={item.title} filename={item.filename} navigator={navigator} icon={item.icon}/>}
              keyExtractor={item => item.id}
              scrollEnabled = {false}
            />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Support</Text>
            <FlatList
              data={SUPPORT}
              renderItem={({item}) => <Item title={item.title} filename={item.filename} navigator={navigator} icon={item.icon}/>}
              keyExtractor={item => item.id}
              scrollEnabled = {false}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}