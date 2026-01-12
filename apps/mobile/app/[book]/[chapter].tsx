import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { READING_PROGRESS_KEY, type ReadingProgress } from "@plainenglishbom/core";
import { getBook, getChapter, unslugify, slugify } from "../../lib/data";

export default function ChapterScreen() {
  const { book: bookSlug, chapter: chapterStr } = useLocalSearchParams<{
    book: string;
    chapter: string;
  }>();

  const bookName = unslugify(bookSlug || "");
  const chapterNum = parseInt(chapterStr || "1", 10);
  const book = getBook(bookName);
  const chapter = getChapter(bookName, chapterNum);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = createStyles(isDark);

  // Save reading progress
  useEffect(() => {
    if (book && chapter) {
      const progress: ReadingProgress = {
        bookSlug: bookSlug || "",
        bookName: book.shortName,
        chapterNum,
        timestamp: Date.now(),
      };
      AsyncStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [book, chapter, bookSlug, chapterNum]);

  if (!book || !chapter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Chapter not found</Text>
      </View>
    );
  }

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < book.chapters.length ? chapterNum + 1 : null;

  const navigateToChapter = (num: number) => {
    router.replace(`/${slugify(book.shortName)}/${num}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${book.shortName} ${chapterNum}`,
        }}
      />
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.bookName}>{book.shortName}</Text>
          <Text style={styles.chapterTitle}>Chapter {chapterNum}</Text>
          <Text style={styles.verseCount}>{chapter.verses.length} verses</Text>
        </View>

        {/* Verses */}
        <View style={styles.versesContainer}>
          {chapter.verses.map((verse) => (
            <View key={verse.number} style={styles.verseCard}>
              <Text style={styles.verseNumber}>{verse.number}</Text>
              <View style={styles.verseContent}>
                <Text style={styles.verseText}>
                  {verse.plainText || verse.text}
                </Text>
                {verse.plainText && (
                  <Text style={styles.originalText}>{verse.text}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {prevChapter ? (
            <Pressable
              style={styles.navButton}
              onPress={() => navigateToChapter(prevChapter)}
            >
              <Text style={styles.navArrow}>‹</Text>
              <Text style={styles.navText}>Chapter {prevChapter}</Text>
            </Pressable>
          ) : (
            <View style={styles.navSpacer} />
          )}
          {nextChapter && (
            <Pressable
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => navigateToChapter(nextChapter)}
            >
              <Text style={styles.navText}>Chapter {nextChapter}</Text>
              <Text style={styles.navArrow}>›</Text>
            </Pressable>
          )}
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
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#e8e4dc",
    },
    bookName: {
      fontSize: 12,
      letterSpacing: 2,
      color: isDark ? "#888" : "#666",
      textTransform: "uppercase",
      marginBottom: 8,
    },
    chapterTitle: {
      fontSize: 32,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 8,
    },
    verseCount: {
      fontSize: 14,
      color: isDark ? "#888" : "#666",
    },
    versesContainer: {
      padding: 16,
    },
    verseCard: {
      flexDirection: "row",
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#2a2a2a" : "#f0ece4",
    },
    verseNumber: {
      width: 32,
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#666" : "#999",
    },
    verseContent: {
      flex: 1,
    },
    verseText: {
      fontSize: 18,
      lineHeight: 28,
      color: isDark ? "#faf9f6" : "#1a1a1a",
    },
    originalText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? "#666" : "#999",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#e8e4dc",
      fontStyle: "italic",
    },
    navigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 16,
      paddingBottom: 40,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#e8e4dc",
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
    },
    navButtonRight: {
      marginLeft: "auto",
    },
    navArrow: {
      fontSize: 24,
      color: isDark ? "#4a90d9" : "#2563eb",
      marginHorizontal: 8,
    },
    navText: {
      fontSize: 16,
      color: isDark ? "#4a90d9" : "#2563eb",
    },
    navSpacer: {
      flex: 1,
    },
    errorText: {
      fontSize: 18,
      color: isDark ? "#faf9f6" : "#1a1a1a",
      textAlign: "center",
      marginTop: 40,
    },
  });
