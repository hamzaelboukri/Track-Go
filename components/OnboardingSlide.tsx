import React from "react";
import { View, Text, StyleSheet, Dimensions, Image } from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedStyle,
  SharedValue,
} from "react-native-reanimated";
import { typography } from "@/constants/typography";

const { width, height } = Dimensions.get("window");

interface OnboardingSlideProps {
  title: string;
  description: string;
  image: any;
  index: number;
  scrollX: SharedValue<number>;
}

export function OnboardingSlide({
  title,
  description,
  image,
  index,
  scrollX,
}: OnboardingSlideProps) {

  const imageStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [1.2, 1, 1.2]
    );
    return {
      transform: [{ scale }],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.8, 0.4, 0.8]
    );
    return { opacity };
  });

  return (
    <View style={[styles.slide, { width, height }]}>
      {/* BACKGROUND IMAGE - Cinematic & Creative */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.Image
          source={image}
          style={[styles.backgroundImage, imageStyle]}
          resizeMode="cover"
        />
        <Animated.View style={[styles.overlay, overlayStyle]} />
      </View>

      {/* CONTENT OVERLAY - High Contrast & Sharp */}
      <View style={styles.contentContainer}>
        <Animated.View
          entering={FadeInRight.delay(200).duration(800).springify()}
          style={styles.headerBlock}
        >
          <View style={styles.idLine} />
          <Text style={styles.indexText}>MAPPING_SEQUENCE_0{index + 1}</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(800).springify()}
          style={styles.textBlock}
        >
          <Text style={styles.title}>{title.toUpperCase()}</Text>
          <Text style={styles.description}>{description}</Text>
        </Animated.View>

        {/* Decorative Sharp Corners */}
        <View style={styles.cornerMarkerLU} />
        <View style={styles.cornerMarkerRD} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    overflow: "hidden",
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 32,
    paddingBottom: 160,
    gap: 32,
  },
  headerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  idLine: {
    width: 32,
    height: 2,
    backgroundColor: '#FFF',
  },
  indexText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 3,
  },
  textBlock: {
    gap: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 40,
    fontFamily: typography.fontFamily.black,
    lineHeight: 42,
    letterSpacing: -1,
  },
  description: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 24,
    maxWidth: 280,
  },
  cornerMarkerLU: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 20,
    height: 20,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cornerMarkerRD: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    width: 20,
    height: 20,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  }
});
