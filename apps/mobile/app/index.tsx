import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { READING_PROGRESS_KEY, type ReadingProgress } from "@plainenglishbom/core";
import { getAllBooks, slugify } from "../lib/data";

export default function HomeScreen() {
  const books = getAllBooks();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [readingProgress, setReadingProgress] = useState<ReadingProgress | null>(null);

  const styles = createStyles(isDark);

  // Load reading progress
  useEffect(() => {
    AsyncStorage.getItem(READING_PROGRESS_KEY).then((data) => {
      if (data) {
        try {
          setReadingProgress(JSON.parse(data));
        } catch {
          // Invalid data, ignore
        }
      }
    });
  }, []);

  // Format relative time
  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="cog" size={22} color={isDark ? "#888" : "#666"} />
          </Pressable>
          <Text style={styles.title}>Book of Mormon</Text>
          <Text style={styles.subtitle}>IN PLAIN ENGLISH</Text>
          <Text style={styles.description}>
            Scripture translated into clear, modern language while preserving its
            original meaning and spiritual power.
          </Text>
        </View>

      {/* Continue Reading */}
      {readingProgress && (
        <View style={styles.continueContainer}>
          <Text style={styles.sectionTitle}>CONTINUE READING</Text>
          <Link
            href={`/${readingProgress.bookSlug}/${readingProgress.chapterNum}`}
            asChild
          >
            <Pressable style={styles.continueCard}>
              <View style={styles.continueInfo}>
                <Text style={styles.continueBook}>{readingProgress.bookName}</Text>
                <Text style={styles.continueChapter}>
                  Chapter {readingProgress.chapterNum}
                </Text>
                <Text style={styles.continueTime}>
                  {getRelativeTime(readingProgress.timestamp)}
                </Text>
              </View>
              <Text style={styles.continueArrow}>›</Text>
            </Pressable>
          </Link>
        </View>
      )}

      {/* Books List */}
      <View style={styles.booksContainer}>
        <Text style={styles.sectionTitle}>ALL BOOKS</Text>
        {books.map((book) => (
          <Link
            key={book.shortName}
            href={`/${slugify(book.shortName)}`}
            asChild
          >
            <Pressable style={styles.bookCard}>
              <View style={styles.bookInfo}>
                <Text style={styles.bookName}>{book.shortName}</Text>
                <Text style={styles.chapterCount}>
                  {book.chapters.length} chapter
                  {book.chapters.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </Link>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
    },
    container: {
      flex: 1,
    },
    header: {
      padding: 24,
      paddingTop: 16,
      alignItems: "center",
      position: "relative",
    },
    settingsButton: {
      position: "absolute",
      top: 16,
      right: 24,
      padding: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 12,
      letterSpacing: 2,
      color: isDark ? "#888" : "#666",
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#666",
      textAlign: "center",
      lineHeight: 24,
    },
    continueContainer: {
      padding: 16,
      paddingBottom: 0,
    },
    continueCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#1a3a5c" : "#e8f0f8",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "#2a4a6c" : "#c8d8e8",
    },
    continueInfo: {
      flex: 1,
    },
    continueBook: {
      fontSize: 14,
      color: isDark ? "#8ab4d8" : "#4a7090",
      marginBottom: 4,
    },
    continueChapter: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 4,
    },
    continueTime: {
      fontSize: 12,
      color: isDark ? "#6a94b8" : "#6a8aa8",
    },
    continueArrow: {
      fontSize: 24,
      color: isDark ? "#4a90d9" : "#2563eb",
    },
    booksContainer: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 12,
      letterSpacing: 2,
      color: isDark ? "#888" : "#666",
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    bookCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark ? "#2a2a2a" : "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e8e4dc",
    },
    bookInfo: {
      flex: 1,
    },
    bookName: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 4,
    },
    chapterCount: {
      fontSize: 14,
      color: isDark ? "#888" : "#666",
    },
    arrow: {
      fontSize: 24,
      color: isDark ? "#666" : "#999",
    },
  });
