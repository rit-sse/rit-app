import { View, Text, Button } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { backToProfile } from "../profile";

export default function appearance() {
  const navigator = useRouter();

  return (
    <SafeAreaProvider>
          <SafeAreaView>
            <Button
              onPress={() => backToProfile(navigator)}
              title="< Back"
              color="#000000"
              accessibilityLabel="Back to profile page"
            />
            
          </SafeAreaView>
    </SafeAreaProvider>
  );
}