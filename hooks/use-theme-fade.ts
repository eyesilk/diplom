import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export function useThemeFade(trigger: string) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    opacity.setValue(0.82);

    Animated.timing(opacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [opacity, trigger]);

  return opacity;
}
