import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";

interface TrailerProps {
  id: string;
  title: string;
  thumbnail: string;
  yt_id: string;
  rating: number;
  published: string;
  genres: string[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export default function Trailer({
  id,
  title,
  thumbnail,
  rating,
  published,
  genres,
}: TrailerProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      key={id}
      style={styles.card}
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
      <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
      <View style={styles.imageOverlay} />

      <View style={styles.playBadge}>
        <Ionicons name="play" size={18} color="#07111d" />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="star" size={14} color="#ffd166" />
            <Text style={styles.metaPillText}>{rating.toFixed(1)}</Text>
          </View>

          <View style={styles.metaPill}>
            <Ionicons name="calendar-outline" size={14} color="#a9c3dd" />
            <Text style={styles.metaPillText}>
              {new Date(published).toLocaleDateString("ru-RU")}
            </Text>
          </View>
        </View>

        <View style={styles.genreContainer}>
          {genres.slice(0, 3).map((genre) => (
            <View key={genre} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre}</Text>
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
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: SCREEN_HEIGHT * 0.022,
    borderWidth: 1,
    borderColor: "rgba(167, 199, 231, 0.14)",
  },
  thumbnail: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.28,
    resizeMode: "cover",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 10, 18, 0.18)",
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
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingTop: SCREEN_HEIGHT * 0.018,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    backgroundColor: "#0d1622",
  },
  title: {
    color: "#f5f7fb",
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "700",
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
    backgroundColor: "#152434",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    color: "#d9e6f2",
    fontSize: SCREEN_WIDTH * 0.033,
    fontWeight: "600",
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  genreTag: {
    backgroundColor: "#25384d",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  genreText: {
    color: "#d9e6f2",
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: "600",
  },
});
