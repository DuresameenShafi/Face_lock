import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function App() {
    const [image, setImage] = useState("");

    useEffect(() => {
        const fetchData = () => {
            fetch("http://192.168.73.83:5000/latest-image")
                .then((response) => response.json())
                .then((data) => {
                    if (data.image) {
                        setImage(`data:image/jpeg;base64,${data.image}`);
                    }
                })
                .catch((error) => console.error("Error fetching image:", error));
        };

       
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval); 
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Image from ESP32-CAM</Text>
            {image ? (
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode="contain"
                />
            ) : (
                <Text>Waiting for image...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    image: {
        width: 300,
        height: 300,
    },
});
