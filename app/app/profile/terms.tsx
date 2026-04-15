import React, { useEffect, useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import legalTermsAsset from "./LegalJibberJabber.txt";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { backToProfile } from "../profile";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Terms() {
  const navigator = useRouter();
  const [legalJibberJabber, setLegalJibberJabber] = useState("");

  useEffect(() => {
    let isAlive = true;

    const loadTerms = async () => {
      try {
        const asset = Asset.fromModule(legalTermsAsset);
        await asset.downloadAsync();

        const assetUri = asset.localUri ?? asset.uri;
        const termsText = await new File(assetUri).text();

        if (isAlive) {
          setLegalJibberJabber(termsText);
        }
      } catch {
        if (isAlive) {
          setLegalJibberJabber("Unable to load terms and conditions.");
        }
      }
    };

    void loadTerms();

    return () => {
      isAlive = false;
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: "90%",
          height: 70,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => {
            backToProfile(navigator);
          }}
        >
          <BackChevron style={{ width: 40, height: 40 }} color="#000" />
          <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold" }}>
            Terms
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ width: Dimensions.get("window").width * 0.85 }}
      >
        <Text className="text-[16px] w-[85%]">{legalJibberJabber}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
