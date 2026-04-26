import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

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
  yt_id,
  rating,
  published,
  genres,
}: TrailerProps) {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        key={id}
        style={styles.card}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>
            Рейтинг {rating.toFixed(1)} •{" "}
            {new Date(published).toLocaleDateString("ru-RU")}
          </Text>

          <View style={styles.genreContainer}>
            {genres.map((genre) => (
              <View key={genre} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <YoutubePlayer
              height={SCREEN_HEIGHT * 0.25}
              play={true}
              videoId={yt_id}
            />
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#020913",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  thumbnail: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.25,
    resizeMode: "cover",
  },
  content: {
    padding: SCREEN_WIDTH * 0.03,
  },
  title: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "600",
    marginBottom: SCREEN_HEIGHT * 0.008,
  },
  meta: {
    color: "#aaa",
    fontSize: SCREEN_WIDTH * 0.035,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SCREEN_HEIGHT * 0.008,
    gap: 6,
  },
  genreTag: {
    backgroundColor: "#ffc700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  genreText: {
    color: "#000",
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.04,
  },
  modalContent: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.04,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  closeButton: {
    backgroundColor: "#ffc700",
    borderRadius: 8,
    marginTop: SCREEN_HEIGHT * 0.01,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: "#000",
    fontWeight: "600",
  },
});
