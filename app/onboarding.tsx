import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const slides = [
  {
    key: "welcome",
    title: "Bienvenue sur Track&Go",
    description: "Gérez vos livraisons du dernier kilomètre avec précision, rapidité et sécurité.",
    image: require("@/assets/images/icon.png"),
  },
  {
    key: "scan",
    title: "Scan Intelligent",
    description: "Scannez les colis, validez les livraisons et capturez la preuve en un geste.",
    image: require("@/assets/images/icon.png"), // Placeholder image
  },
  {
    key: "geo",
    title: "Géolocalisation & Cartes",
    description: "Suivez votre tournée sur la carte et certifiez chaque livraison par GPS.",
    image: require("@/assets/images/icon.png"), // Placeholder image
  },
  {
    key: "incident",
    title: "Gestion d'incidents",
    description: "Signalez rapidement tout problème avec photo et commentaire.",
    image: require("@/assets/images/icon.png"), // Placeholder image
  },
];

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const next = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    else router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Image source={slides[index].image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{slides[index].title}</Text>
      <Text style={styles.description}>{slides[index].description}</Text>
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.activeDot]} />
        ))}
      </View>
      <Pressable style={styles.button} onPress={next}>
        <Text style={styles.buttonText}>{index === slides.length - 1 ? "Commencer" : "Suivant"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  image: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  dots: {
    flexDirection: "row",
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#007AFF",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
