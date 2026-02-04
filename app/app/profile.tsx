import { View, Text, Image, StyleSheet, StatusBar, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const PREF = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'Appearance',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Notifications',
  },
];

const SUPPORT = [
  {
    id: '1',
    title: 'Report an Issue',
  },
  {
    id: '2',
    title: 'FAQ',
  },
  {
    id: '3',
    title: 'Terms, Privacy, FERPA',
  },
  {
    id: '4',
    title: 'App Information',
  },
];

type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
  <View style={styles.item}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  profileImage: {
    width: 120,
    height: 120,
  },
  page: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0
  },
  user: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  sections: {
    flex: 4,
  },
  sectionTitle: {
    fontSize: 20,
    padding: 10
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
  },
})

export default function Profile() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.user}>
          <Image
            source = {require("../assets/images/splash-icon.png")}
            style = {styles.profileImage}
          />
          <Text>John Rochester</Text>
          <Text>jr123@rit.edu</Text>
        </View>
        <View style={styles.sections}>
          <Text style={styles.sectionTitle}>Preferances</Text>
          <FlatList
            data={PREF}
            renderItem={({item}) => <Item title={item.title} />}
            keyExtractor={item => item.id}
            scrollEnabled = {false}
          />
          <Text style={styles.sectionTitle}>Support</Text>
          <FlatList
            data={SUPPORT}
            renderItem={({item}) => <Item title={item.title} />}
            keyExtractor={item => item.id}
            scrollEnabled = {false}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}