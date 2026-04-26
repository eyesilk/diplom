import { useWindowDimensions } from "react-native";

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isCompact: width < 390,
    isPhone: width < 768,
    isTablet: width >= 768,
    isLargeScreen: width >= 1024,
  };
}
