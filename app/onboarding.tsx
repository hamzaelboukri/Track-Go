import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  Platform,
  StatusBar,
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
import { typography } from "@/constants/typography";

const { width, height } = Dimensions.get("window");

// Image imports
const onboardingImgs = {
  logistics: require("../assets/images/onboarding_logistics_hero.png"),
  navigation: require("../assets/images/onboarding_navigation_hero.png"),
  validation: require("../assets/images/onboarding_validation_hero.png"),
};

type OnboardingSlideData = {
  title: string;
  description: string;
  image: any;
};

function PaginationDots({
  scrollX,
  slides,
}: {
  scrollX: SharedValue<number>;
  slides: OnboardingSlideData[];
}) {
  return (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <PaginationDot key={index} index={index} scrollX={scrollX} />
      ))}
    </View>
  );
}

function PaginationDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1.2, 0.8],
      Extrapolation.CLAMP
    );

    return {
      opacity: withTiming(opacity),
      transform: [{ scale: withSpring(scale) }]
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

export default function OnboardingScreen() {
  const { colors, isDark } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const slides = React.useMemo(
    (): OnboardingSlideData[] => [
      {
        title: "Logistique\nSans Faille",
        description: "L'efficacité d'Uber au service d'une logistique de précision chirurgicale.",
        image: onboardingImgs.logistics,
      },
      {
        title: "Routage\nTactique",
        description: "Des itinéraires optimisés en temps réel pour une navigation experte.",
        image: onboardingImgs.navigation,
      },
      {
        title: "Validation\nCertifiée",
        description: "Une preuve de confiance absolue à chaque étape du manifest.",
        image: onboardingImgs.validation,
      },
    ],
    []
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
    await storageService.setOnboardingCompleted(true);
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* SKIP BUTTONLINK - White on transparent for high end feel */}
      {currentIndex < slides.length - 1 && (
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>PASSER</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {slides.map((slide, index) => (
          <OnboardingSlide
            key={index}
            {...slide}
            index={index}
            scrollX={scrollX}
          />
        ))}
      </ScrollView>

      {/* FLOATING ACTION INTERFACE */}
      <View style={styles.footer}>
        <PaginationDots scrollX={scrollX} slides={slides} />

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              {
                opacity: pressed ? 0.8 : 1,
                backgroundColor: "#FFFFFF",
              },
            ]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? "Démarrer" : "Suivant"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="#000000"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 28,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.black,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 60,
    gap: 32,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  buttonContainer: {
    paddingHorizontal: 40,
  },
  button: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    color: "#000000",
    fontSize: 14,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
