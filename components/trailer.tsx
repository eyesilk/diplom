import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { useThemeMode } from "@/components/theme-mode-provider";

interface TrailerProps {
  id: string;
  title: string;
  thumbnail: string;
  yt_id: string;
  rating: number;
  published: string;
  genres: string[];
}

export default function Trailer({
  id,
  title,
  thumbnail,
  rating,
  published,
  genres,
}: TrailerProps) {
  const router = useRouter();
  const { themeMode } = useThemeMode();
  const isLight = themeMode === "light";

  const palette = isLight
    ? {
        card: "#ffffff",
        border: "#dde6ee",
        text: "#0d1722",
        pill: "#eef3f7",
        pillText: "#43586c",
        overlay: "rgba(255,255,255,0.08)",
        playIcon: "#ffffff",
      }
    : {
        card: "#0d1622",
        border: "rgba(167, 199, 231, 0.14)",
        text: "#f5f7fb",
        pill: "#152434",
        pillText: "#d9e6f2",
        overlay: "rgba(4, 10, 18, 0.18)",
        playIcon: "#07111d",
      };

  return (
    <TouchableOpacity
      key={id}
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border },
      ]}
      activeOpacity={0.9}
      onPress={() =>
        router.push(
          {
            pathname: "/movie/[id]",
            params: { id },
          } as unknown as Href,
        )
      }
    >
      <View style={styles.media}>
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
        <View
          style={[styles.imageOverlay, { backgroundColor: palette.overlay }]}
        />

        <View style={styles.playBadge}>
          <Ionicons name="play" size={18} color={palette.playIcon} />
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: palette.card }]}>
        <Text numberOfLines={2} style={[styles.title, { color: palette.text }]}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: palette.pill }]}>
            <Ionicons name="star" size={14} color="#ffd166" />
            <Text style={[styles.metaPillText, { color: palette.pillText }]}>
              {rating.toFixed(1)}
            </Text>
          </View>

          <View style={[styles.metaPill, { backgroundColor: palette.pill }]}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isLight ? "#61778b" : "#a9c3dd"}
            />
            <Text style={[styles.metaPillText, { color: palette.pillText }]}>
              {new Date(published).toLocaleDateString("ru-RU")}
            </Text>
          </View>
        </View>

        <View style={styles.genreContainer}>
          {genres.slice(0, 3).map((genre) => (
            <View
              key={genre}
              style={[
                styles.genreTag,
                { backgroundColor: isLight ? "#eef3f7" : "#25384d" },
              ]}
            >
              <Text
                style={[
                  styles.genreText,
                  { color: isLight ? "#43586c" : "#d9e6f2" },
                ]}
              >
                {genre}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0d1622",
    width: "100%",
    alignSelf: "stretch",
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.14)",
  },
  media: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f5c451",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  genreTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  genreText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
