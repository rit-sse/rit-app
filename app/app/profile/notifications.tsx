import { View, Text, Button, Switch } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { backToProfile } from "../profile";
import { useState } from "react";

export default function appearance() {
  const navigator = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <SafeAreaProvider>
          <SafeAreaView>
            <Button
              onPress={() => backToProfile(navigator)}
              title="Back"
              color="#000000"
              accessibilityLabel="Back to profile page"
            />
            <View style={{flexDirection: 'row'}}>
              <Text>
                Enable Notifications
              </Text>
              <Switch
                trackColor={{false: '#767577', true: '#ff6600'}}
                thumbColor={isEnabled ? '#ffad65' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
          </SafeAreaView>
    </SafeAreaProvider>
  );
}