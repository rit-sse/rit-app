import React from "react";
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Alert } from "react-native";

export const ButtonCustomWrap = () => {

    const showAlert = () => {
        Alert.alert("Button Pressed", "You have pressed the custom button!");
    }

    return (
        <Button onPress={()=> {showAlert()}}>
            <Text>Button</Text>
        </Button>
    );
}