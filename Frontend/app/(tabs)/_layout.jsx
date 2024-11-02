import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Colors } from "../../constants/Colors";

export default function _layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
      }}
    >
      <Tabs.Screen
        name="faceRecong"
        options={{
          tabBarLabel: "face",
          tabBarIcon: ({ color }) => (

            <FontAwesome6 name="face-grin" size={24} color={color}/>
          ),
        }}
      />
   
    </Tabs>
  );
}
