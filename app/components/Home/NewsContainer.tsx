import React from "react";
import { View, Image, TouchableOpacity, Linking } from "react-native"
import {Text} from "@/components/ui/text"

interface NewsArticle {
    uri: string;
    title: string;
    description: string;
    date: string;
    image: string;
}

export default function NewsContainer({ article, index }: { article: NewsArticle; index: number }) {
    return <TouchableOpacity key={index} className="mb-4" activeOpacity={.6} onPress={() => Linking.openURL(article.uri)}>
        <Image source={{ uri: article.image }} className="w-full h-48 mb-2 rounded-lg" />
        <Text className="text-[18px] font-bold">{article.title}</Text>
        <Text className="text-[16px]">{article.description}</Text>
        <Text className="text-[12px] text-gray-500">{article.date}</Text>
    </TouchableOpacity>;
}