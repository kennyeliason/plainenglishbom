import { useLocalSearchParams, Stack, router } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useColorScheme,
  LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector, Directions, GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import { READING_PROGRESS_KEY, type ReadingProgress, type Verse, type Chapter as ChapterType } from "@plainenglishbom/core";
import { getBook, getChapter, unslugify, slugify } from "../../lib/data";
import { hasApiKey as checkApiKey } from "../../lib/ai-client";
import { VerseInsightPanel } from "../../components/VerseInsightPanel";
import { ChapterInsightPanel } from "../../components/ChapterInsightPanel";

// Verse card component with expandable original text
function VerseCard({
  verse,
  isDark,
  highlighted,
  onLayout,
  onAIPress,
  hasApiKey,
  hasChatHistory,
}: {
  verse: Verse;
  isDark: boolean;
  highlighted?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  onAIPress?: (verse: Verse) => void;
  hasApiKey?: boolean;
  hasChatHistory?: boolean;
}) {
  const [showOriginal, setShowOriginal] = useState(false);
  const styles = createStyles(isDark);

  return (
    <View
      style={[styles.verseCard, highlighted && styles.verseHighlighted]}
      onLayout={onLayout}
    >
      <Text style={styles.verseNumber}>{verse.number}</Text>
      <View style={styles.verseContent}>
        <View style={styles.verseTextContainer}>
          <Text style={styles.verseText}>
            {verse.plainText || verse.text}
          </Text>
          {onAIPress && (
            <Pressable
              onPress={() => onAIPress(verse)}
              style={[styles.aiButton, !hasApiKey && styles.aiButtonDimmed]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name={hasChatHistory ? "comment" : "lightbulb-o"}
                size={hasChatHistory ? 16 : 18}
                color={hasChatHistory
                  ? (isDark ? "#6b9ac4" : "#1a4a6e")
                  : (isDark ? "#b8956a" : "#9a7b4f")
                }
              />
            </Pressable>
          )}
        </View>
        {verse.plainText && (
          <Pressable
            onPress={() => setShowOriginal(!showOriginal)}
            style={styles.toggleButton}
          >
            <FontAwesome
              name={showOriginal ? "caret-down" : "caret-right"}
              size={12}
              color={isDark ? "#666" : "#999"}
              style={styles.toggleArrow}
            />
            <Text style={styles.toggleText}>
              {showOriginal ? "Hide" : "Show"} original text
            </Text>
          </Pressable>
        )}
        {verse.plainText && showOriginal && (
          <Text style={styles.originalText}>{verse.text}</Text>
        )}
      </View>
    </View>
  );
}

export default function ChapterScreen() {
  const { book: bookSlug, chapter: chapterStr, verse: verseStr } = useLocalSearchParams<{
    book: string;
    chapter: string;
    verse?: string;
  }>();

  const bookName = unslugify(bookSlug || "");
  const chapterNum = parseInt(chapterStr || "1", 10);
  const targetVerse = verseStr ? parseInt(verseStr, 10) : null;
  const book = getBook(bookName);
  const chapter = getChapter(bookName, chapterNum);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const styles = createStyles(isDark, insets.bottom);

  // Scroll to verse functionality
  const scrollViewRef = useRef<ScrollView>(null);
  const versePositions = useRef<Record<number, number>>({});
  const [hasScrolled, setHasScrolled] = useState(false);

  // AI feature state
  const [hasKey, setHasKey] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [showChapterChat, setShowChapterChat] = useState(false);
  const [versesWithHistory, setVersesWithHistory] = useState<Set<number>>(new Set());
  const [hasChapterChatHistory, setHasChapterChatHistory] = useState(false);

  // Check for API key on mount
  useEffect(() => {
    checkApiKey().then(setHasKey);
  }, []);

  // Check which verses have chat history
  useEffect(() => {
    const checkChatHistory = async () => {
      if (!book || !chapter) return;
      const versesWithChat = new Set<number>();
      for (const verse of chapter.verses) {
        const key = `chat:${book.shortName}:${chapterNum}:${verse.number}`;
        const history = await AsyncStorage.getItem(key);
        if (history) {
          versesWithChat.add(verse.number);
        }
      }
      setVersesWithHistory(versesWithChat);

      // Check for chapter-wide chat history
      const chapterKey = `chat:${book.shortName}:${chapterNum}:chapter`;
      const chapterHistory = await AsyncStorage.getItem(chapterKey);
      setHasChapterChatHistory(!!chapterHistory);
    };
    checkChatHistory();
  }, [book, chapter, chapterNum]);

  const handleVerseLayout = useCallback((verseNum: number, event: LayoutChangeEvent) => {
    versePositions.current[verseNum] = event.nativeEvent.layout.y;

    // Scroll to target verse once we have its position
    if (targetVerse === verseNum && !hasScrolled) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: event.nativeEvent.layout.y + 100, // Offset for header
          animated: true,
        });
        setHasScrolled(true);
      }, 100);
    }
  }, [targetVerse, hasScrolled]);

  const handleAIPress = useCallback((verse: Verse) => {
    if (!hasKey) {
      router.push("/settings");
      return;
    }
    setSelectedVerse(verse);
  }, [hasKey]);

  const handleChapterChatPress = useCallback(() => {
    if (!hasKey) {
      router.push("/settings");
      return;
    }
    setShowChapterChat(true);
  }, [hasKey]);

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

  // Swipe gestures for chapter navigation
  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (nextChapter) {
        navigateToChapter(nextChapter);
      }
    })
    .runOnJS(true);

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      if (prevChapter) {
        navigateToChapter(prevChapter);
      }
    })
    .runOnJS(true);

  const swipeGesture = Gesture.Race(swipeLeft, swipeRight);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack.Screen
        options={{
          title: `${book.shortName} ${chapterNum}`,
          headerBackgroundContainerStyle: {
            backgroundColor: "transparent",
          },
          headerRight: () => (
            <Pressable
              onPress={handleChapterChatPress}
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name={hasChapterChatHistory ? "comment" : "lightbulb-o"}
                size={hasChapterChatHistory ? 18 : 20}
                color={hasChapterChatHistory
                  ? (isDark ? "#6b9ac4" : "#1a4a6e")
                  : (isDark ? "#b8956a" : "#9a7b4f")
                }
                style={[
                  { textAlign: "center" },
                  !hasKey && { opacity: 0.35 },
                ]}
              />
            </Pressable>
          ),
        }}
      />
      <GestureDetector gesture={swipeGesture}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Chapter Summary */}
          {chapter.summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryLabel}>Overview</Text>
              <Text style={styles.summaryText}>{chapter.summary}</Text>
            </View>
          )}

          {/* Verses */}
          <View style={styles.versesContainer}>
            {chapter.verses.map((verse) => (
              <VerseCard
                key={verse.number}
                verse={verse}
                isDark={isDark}
                highlighted={targetVerse === verse.number}
                onLayout={(e) => handleVerseLayout(verse.number, e)}
                onAIPress={handleAIPress}
                hasApiKey={hasKey}
                hasChatHistory={versesWithHistory.has(verse.number)}
              />
            ))}
          </View>
        </ScrollView>
      </GestureDetector>

      {/* Sticky Bottom Navigation */}
      <View style={styles.navigation}>
        {prevChapter ? (
          <Pressable
            style={styles.navButton}
            onPress={() => navigateToChapter(prevChapter)}
          >
            <Text style={styles.navArrowLeft}>←</Text>
            <View>
              <Text style={styles.navLabel}>Previous</Text>
              <Text style={styles.navChapter}>Chapter {prevChapter}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
        {nextChapter ? (
          <Pressable
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => navigateToChapter(nextChapter)}
          >
            <View style={styles.navTextRight}>
              <Text style={styles.navLabel}>Next</Text>
              <Text style={styles.navChapter}>Chapter {nextChapter}</Text>
            </View>
            <Text style={styles.navArrowRight}>→</Text>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>

      {/* AI Insight Panel for Verse */}
      {selectedVerse && (
        <VerseInsightPanel
          verse={selectedVerse}
          chapter={chapter}
          bookName={book.shortName}
          chapterNum={chapterNum}
          onClose={async () => {
            // Check if this verse now has chat history
            const key = `chat:${book.shortName}:${chapterNum}:${selectedVerse.number}`;
            const history = await AsyncStorage.getItem(key);
            if (history) {
              setVersesWithHistory((prev) => new Set([...prev, selectedVerse.number]));
            }
            setSelectedVerse(null);
          }}
        />
      )}

      {/* AI Insight Panel for Chapter */}
      {showChapterChat && (
        <ChapterInsightPanel
          chapter={chapter}
          bookName={book.shortName}
          chapterNum={chapterNum}
          onClose={async () => {
            // Check if chapter now has chat history
            const key = `chat:${book.shortName}:${chapterNum}:chapter`;
            const history = await AsyncStorage.getItem(key);
            if (history) {
              setHasChapterChatHistory(true);
            }
            setShowChapterChat(false);
          }}
        />
      )}
    </GestureHandlerRootView>
  );
}

const createStyles = (isDark: boolean, bottomInset: number = 0) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 16,
    },
    summaryContainer: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      paddingLeft: 16,
      paddingRight: 12,
      paddingVertical: 12,
      borderLeftWidth: 3,
      borderLeftColor: isDark ? "#4a6a8a" : "#8ba4bc",
      backgroundColor: isDark ? "#1e2a36" : "#f0f4f8",
      borderRadius: 4,
    },
    summaryLabel: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: isDark ? "#6a8aaa" : "#6a8aa8",
      marginBottom: 6,
    },
    summaryText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? "#b8c8d8" : "#4a5a6a",
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#e8e4dc",
    },
    verseCount: {
      fontSize: 13,
      color: isDark ? "#888" : "#666",
      letterSpacing: 0.5,
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
    verseHighlighted: {
      backgroundColor: isDark ? "#2a3a2a" : "#f8f5e8",
      marginHorizontal: -8,
      paddingHorizontal: 8,
      borderRadius: 8,
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
    verseTextContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    verseText: {
      fontSize: 18,
      lineHeight: 28,
      color: isDark ? "#faf9f6" : "#1a1a1a",
      flex: 1,
    },
    aiButton: {
      marginLeft: 8,
      marginTop: 4,
      padding: 4,
      position: "relative",
    },
    aiButtonDimmed: {
      opacity: 0.35,
    },
    toggleButton: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      paddingVertical: 8,
    },
    toggleArrow: {
      width: 12,
      marginRight: 8,
    },
    toggleText: {
      fontSize: 13,
      color: isDark ? "#666" : "#999",
    },
    originalText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? "#666" : "#999",
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#e8e4dc",
      fontStyle: "italic",
    },
    navigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Math.max(bottomInset, 12),
      backgroundColor: isDark ? "#242424" : "#fff",
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#e8e4dc",
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#333" : "#f5f3ef",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      minWidth: 130,
    },
    navButtonRight: {
      justifyContent: "flex-end",
    },
    navTextRight: {
      alignItems: "flex-end",
    },
    navLabel: {
      fontSize: 11,
      color: isDark ? "#888" : "#666",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    navChapter: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
    },
    navArrowLeft: {
      fontSize: 18,
      color: isDark ? "#6b9ac4" : "#1a4a6e",
      marginRight: 12,
    },
    navArrowRight: {
      fontSize: 18,
      color: isDark ? "#6b9ac4" : "#1a4a6e",
      marginLeft: 12,
    },
    navSpacer: {
      width: 130,
    },
    errorText: {
      fontSize: 18,
      color: isDark ? "#faf9f6" : "#1a1a1a",
      textAlign: "center",
      marginTop: 40,
    },
  });
