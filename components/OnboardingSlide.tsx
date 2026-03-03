import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { 
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";
import { typography } from "@/constants/typography";

const { width } = Dimensions.get("window");

interface OnboardingSlideProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  accentColor: string;
  index: number;
}

export function OnboardingSlide({
  icon,
  title,
  description,
  color,
  accentColor,
  index,
}: OnboardingSlideProps) {
  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        entering={ZoomIn.delay(index * 150).duration(600).springify()}
        style={[styles.iconContainer, { backgroundColor: accentColor }]}
      >
        <Ionicons name={icon} size={80} color="#FFFFFF" />
      </Animated.View>

      <Animated.View
        entering={FadeIn.delay(index * 150 + 300).duration(500)}
        style={styles.textContainer}
      >
        <Text style={[styles.title, { color }]}>{title}</Text>
        <Text style={[styles.description, { color }]}>{description}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 56,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  description: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    textAlign: "center",
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    maxWidth: 280,
    opacity: 0.75,
  },
});
