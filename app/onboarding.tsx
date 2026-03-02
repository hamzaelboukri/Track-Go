import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  useSharedValue,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingSlide } from "@/components/OnboardingSlide";
import { storageService } from "@/services/storage";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "cube-outline" as const,
    title: "Gérez vos colis",
    description: "Visualisez tous vos colis du jour en un coup d'œil",
    color: "#16314f",
    accentColor: "#F36E18",
  },
  {
    icon: "navigate-circle-outline" as const,
    title: "Navigation optimisée",
    description: "Suivez votre tournée avec des itinéraires intelligents",
    color: "#16314f",
    accentColor: "#2ECC71",
  },
  {
    icon: "checkmark-done-circle-outline" as const,
    title: "Livraison rapide",
    description: "Validez vos livraisons avec signature et photo",
    color: "#16314f",
    accentColor: "#3498DB",
  },
  {
    icon: "flash-outline" as const,
    title: "Mode hors-ligne",
    description: "Travaillez même sans connexion internet",
    color: "#16314f",
    accentColor: "#E8BE07",
  },
];

function PaginationDots({ scrollX, slides }: { scrollX: SharedValue<number>; slides: typeof SLIDES }) {
  return (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <PaginationDot key={index} index={index} scrollX={scrollX} />
      ))}
    </View>
  );
}

function PaginationDot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 32, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    return {
      width: withSpring(dotWidth),
      opacity: withTiming(opacity),
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export default function OnboardingScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
    
    await storageService.setOnboardingCompleted(true);
    router.replace("/login");
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.background}>
        {/* Skip Button */}
        {currentIndex < SLIDES.length - 1 && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Passer</Text>
          </Pressable>
        )}

        {/* Slides */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {SLIDES.map((slide, index) => (
            <OnboardingSlide key={index} {...slide} index={index} />
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <PaginationDots scrollX={scrollX} slides={SLIDES} />

        {/* Next/Finish Button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1 }
            ]} 
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1 ? "Commencer" : "Suivant"}
            </Text>
            <Ionicons
              name={
                currentIndex === SLIDES.length - 1
                  ? "checkmark-circle"
                  : "arrow-forward"
              }
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#F6F8FB",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(22, 49, 79, 0.08)",
  },
  skipText: {
    color: "#16314f",
    fontSize: 15,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingBottom: 32,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16314f",
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F36E18",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: "#F36E18",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
