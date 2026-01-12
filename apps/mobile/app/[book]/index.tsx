import { Link, useLocalSearchParams, Stack } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { getBook, unslugify, slugify } from "../../lib/data";

export default function BookScreen() {
  const { book: bookSlug } = useLocalSearchParams<{ book: string }>();
  const bookName = unslugify(bookSlug || "");
  const book = getBook(bookName);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = createStyles(isDark);

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  // If single chapter book, redirect would be nice but for now just show it
  const isSingleChapter = book.chapters.length === 1;

  return (
    <>
      <Stack.Screen options={{ title: book.shortName }} />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{book.shortName}</Text>
          <Text style={styles.subtitle}>
            {book.chapters.length} chapter{book.chapters.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Chapters Grid */}
        <View style={styles.chaptersContainer}>
          {book.chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={`/${slugify(book.shortName)}/${chapter.number}`}
              asChild
            >
              <Pressable style={styles.chapterCard}>
                <Text style={styles.chapterNumber}>{chapter.number}</Text>
                <Text style={styles.verseCount}>
                  {chapter.verses.length} verses
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
    },
    header: {
      padding: 24,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? "#888" : "#666",
    },
    chaptersContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      padding: 12,
    },
    chapterCard: {
      width: "30%",
      aspectRatio: 1,
      backgroundColor: isDark ? "#2a2a2a" : "#fff",
      borderRadius: 12,
      margin: "1.66%",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e8e4dc",
    },
    chapterNumber: {
      fontSize: 24,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 4,
    },
    verseCount: {
      fontSize: 11,
      color: isDark ? "#888" : "#666",
    },
    errorText: {
      fontSize: 18,
      color: isDark ? "#faf9f6" : "#1a1a1a",
      textAlign: "center",
      marginTop: 40,
    },
  });
