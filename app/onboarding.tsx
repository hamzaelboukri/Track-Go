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
import { useAppTheme } from "@/hooks/useAppTheme";

const { width } = Dimensions.get("window");

type OnboardingSlideData = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  accentColor: string;
};

function PaginationDots({
  scrollX,
  slides,
  dotColor,
}: {
  scrollX: SharedValue<number>;
  slides: OnboardingSlideData[];
  dotColor: string;
}) {
  return (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <PaginationDot key={index} index={index} scrollX={scrollX} dotColor={dotColor} />
      ))}
    </View>
  );
}

function PaginationDot({
  index,
  scrollX,
  dotColor,
}: {
  index: number;
  scrollX: SharedValue<number>;
  dotColor: string;
}) {
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

  return <Animated.View style={[styles.dot, { backgroundColor: dotColor }, dotStyle]} />;
}

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const slides = React.useMemo(
    (): OnboardingSlideData[] => [
      {
        icon: "cube-outline" as const,
        title: "Gérez vos colis",
        description: "Visualisez tous vos colis du jour en un coup d'œil",
        color: colors.primary,
        accentColor: colors.accent,
      },
      {
        icon: "navigate-circle-outline" as const,
        title: "Navigation optimisée",
        description: "Suivez votre tournée avec des itinéraires intelligents",
        color: colors.primary,
        accentColor: colors.success,
      },
      {
        icon: "checkmark-done-circle-outline" as const,
        title: "Livraison rapide",
        description: "Validez vos livraisons avec signature et photo",
        color: colors.primary,
        accentColor: colors.info,
      },
      {
        icon: "flash-outline" as const,
        title: "Mode hors-ligne",
        description: "Travaillez même sans connexion internet",
        color: colors.primary,
        accentColor: colors.warning,
      },
    ],
    [colors]
  );

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
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
      <View style={[styles.background, { backgroundColor: colors.background }]}>
        {/* Skip Button */}
        {currentIndex < slides.length - 1 && (
          <Pressable style={[styles.skipButton, { backgroundColor: colors.surfaceSecondary }]} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: colors.text }]}>Passer</Text>
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
          {slides.map((slide, index) => (
            <OnboardingSlide key={index} {...slide} index={index} />
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <PaginationDots scrollX={scrollX} slides={slides} dotColor={colors.primary} />

        {/* Next/Finish Button */}
        <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
          <Pressable 
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.9 : 1, backgroundColor: colors.accent, shadowColor: colors.accent }
            ]} 
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
            </Text>
            <Ionicons
              name={
                currentIndex === slides.length - 1
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
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: {
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
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
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
