import React from "react";
import BackChevron from "@/components/svgs/BackChevron";
import { View, TouchableOpacity, Image, Linking } from "react-native";
import { backToProfile } from "../profile";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Text } from '@/components/ui/text';

const handleLinkPress = (url: string) => {
  Linking.openURL(url);
};

const FAQ_DATA: {
  questionTitle: string,
  answer: React.ReactNode
}[] = [
    {
      questionTitle: "How do I access the source code for the RIT App?",
      answer: <Text>You can access the source code for the RIT App by visiting our GitHub repository at <Text onPress={() => handleLinkPress("https://github.com/rit-sse/rit-app")} className="text-[#008CD7] underline">https://github.com/rit-sse/rit-app</Text>. We encourage developers to explore the code and fix issues!</Text>
    },
    {
      questionTitle: "How can I contribute/add a feature to the RIT App?",
      answer: <Text>The SSE Tech Committee is responsible for adding new features and improvements to the RIT App. If you would like to contribute, please visit our website and apply for Tech Committee! <Text onPress={() => handleLinkPress("https://sse.rit.edu/")} className="text-[#008CD7] underline">https://sse.rit.edu/</Text>.</Text>
    }
  ];

export default function faq() {
  const navigator = useRouter();


  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
      <View style={{ width: "90%", height: 70, alignItems: "center", flexDirection: "row" }} >
        <TouchableOpacity style={{ flexDirection: "row", alignItems: "center" }} onPress={() => { backToProfile(navigator); }}>
          <BackChevron style={{ width: 40, height: 40 }} color="#000" />
          <Text style={{ paddingLeft: 5, fontSize: 25, fontWeight: "bold", paddingTop: 5 }}>FAQ</Text>
        </TouchableOpacity>
      </View>
      <Accordion type='single' collapsible className="w-[85%]" >
        {/* <AccordionItem value='item-1'>
          <AccordionTrigger>
            <Text>Is it accessible?</Text>
          </AccordionTrigger>
          <AccordionContent>
            <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
          </AccordionContent>
        </AccordionItem> */}
        {
          FAQ_DATA.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>
                <Text>{item.questionTitle}</Text>
              </AccordionTrigger>
              <AccordionContent>
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))

        }
      </Accordion>
    </SafeAreaView>
  );
}