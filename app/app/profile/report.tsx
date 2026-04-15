import React, { useState } from "react";
import BackChevron from "@/components/svgs/BackChevron";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { backToProfile } from "../profile";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildApiUrl } from "@/lib/api";

export default function report() {
  const navigator = useRouter();
  const contentInsets = useSafeAreaInsets();

  const selectRef = React.useRef(null);
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("");

  const sendReport = () => {
    if (reportType === "" || description === "") {
      Alert.alert("Error", "Please fill out all fields before submitting.");
      return;
    }
    fetch(buildApiUrl("/report"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        report: "Issue Type: " + reportType + "\nDescription: " + description
      }),
      // holy cursed
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", }} className="bg-white">
      <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { backToProfile(navigator); }}>
          <BackChevron style={{ width: 40, height: 40 }} color="#000" />
          <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold" }}>Report an Issue</Text>
        </TouchableOpacity>
      </View>
      <View style={{ width: "85%", marginTop: 0, justifyContent: "flex-start", flexDirection: "column" }} >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>Issue Type: </Text>
          <Select onValueChange={(option) => {setReportType(option?.label ?? "Not given")}}>
            <SelectTrigger className='w-[200px]' >
              <SelectValue placeholder='Issue Type' />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className='w-[200px]'>
              <SelectGroup>
                <SelectLabel>Issue Types</SelectLabel>
                <SelectItem label='Feature Request' value='fr'>
                  Feature Request
                </SelectItem>
                <SelectItem label='Bug' value='bug'>
                  Bug
                </SelectItem>
                <SelectItem label='Legal Issue' value='legal'>
                  Legal Issue
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>
        <Textarea
          placeholder="Describe the issue..."
          className="min-h-[150px] mt-[10px] w-full p-2 border rounded bg-white"
          value={description}
          onChangeText={setDescription}
        />
        <Button className=" mt-[10px] bg-[#F76902]" onPress={sendReport}>
          <Text className="color-white font-semibold text-[15px]">Submit</Text>
        </Button>
      </View>
    </SafeAreaView>
  );

}
