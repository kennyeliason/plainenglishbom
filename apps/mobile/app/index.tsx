import { Link } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { getAllBooks, slugify } from "../lib/data";

export default function HomeScreen() {
  const books = getAllBooks();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = createStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>IN PLAIN ENGLISH</Text>
        <Text style={styles.title}>Book of Mormon</Text>
        <Text style={styles.description}>
          Scripture translated into clear, modern language while preserving its
          original meaning and spiritual power.
        </Text>
      </View>

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
      paddingTop: 16,
      alignItems: "center",
    },
    subtitle: {
      fontSize: 12,
      letterSpacing: 2,
      color: isDark ? "#888" : "#666",
      marginBottom: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#666",
      textAlign: "center",
      lineHeight: 24,
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
