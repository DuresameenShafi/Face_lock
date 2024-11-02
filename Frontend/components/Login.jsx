// Login.js
import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";
export default function Login() {

  const router = useRouter()
  return (
    <View>
      <Image
        source={require("../assets/images/login.png")}
        style={{ width: "100%", height: 460 }}
      />
      <View style={styles.container}>
        <Text style={styles.title}>AI Travel Planner</Text>
        <Text style={styles.subtitle}>
          "Uncover your next journey with ease. Enjoy personalized itineraries
          right at your fingertips and travel smarter with insights powered by
          AI."
        </Text>
        <TouchableOpacity style={styles.button}
        onPress={()=>router.push('/auth/sign-in')}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:Colors.BLUE ,
    marginTop: -20,
    height: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 15,
  },
  title: {
    fontSize: 25,
    fontFamily: "outfit-bold",
    textAlign: "center",
    marginTop: 20,
    color:Colors.WHITE
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: 17,
    textAlign: "center",
    color: Colors.GRAY,
    marginTop: 20,
  },
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 99,
    marginTop: "15%",
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "outfit",
    fontSize: 17,
  },
});
