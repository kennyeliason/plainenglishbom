import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Verse, Chapter } from "@plainenglishbom/core";
import { chatAboutVerse } from "../lib/ai-client";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.7;

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  verse: Verse;
  chapter: Chapter;
  bookName: string;
  chapterNum: number;
  onClose: () => void;
};

export function VerseInsightPanel({
  verse,
  chapter,
  bookName,
  chapterNum,
  onClose,
}: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const styles = createStyles(isDark, insets.bottom);

  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate storage key for this verse
  const storageKey = `chat:${bookName}:${chapterNum}:${verse.number}`;

  // Load previous chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [storageKey]);

  // Save chat history when messages change
  const saveHistory = useCallback(async (msgs: Message[]) => {
    if (msgs.length > 0) {
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
      } catch (e) {
        console.error("Failed to save chat history:", e);
      }
    }
  }, [storageKey]);

  // Slide in on mount
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: PANEL_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage = inputText.trim();
    setInputText("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsSending(true);

    // Scroll to show user's message was sent
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await chatAboutVerse(
        bookName,
        chapterNum,
        verse,
        chapter,
        messages,
        userMessage
      );
      const updatedMessages = [...newMessages, { role: "assistant" as const, content: response }];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
      // Don't auto-scroll after AI response - let user read naturally from their question
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorMessages = [
        ...newMessages,
        { role: "assistant" as const, content: `Sorry, I couldn't generate a response. (${errorMessage})` },
      ];
      setMessages(errorMessages);
      // Don't save error messages to history
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View
        style={[
          styles.panel,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {bookName} {chapterNum}:{verse.number}
            </Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Text style={styles.closeButton}>Done</Text>
            </Pressable>
          </View>

          {/* Verse Preview */}
          <ScrollView style={styles.versePreview} nestedScrollEnabled>
            <Text style={styles.versePreviewText}>
              "{verse.plainText || verse.text}"
            </Text>
          </ScrollView>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Ask anything about this verse
                </Text>
              </View>
            ) : (
              messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.role === "user" ? styles.userMessage : styles.assistantMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === "user" && styles.userMessageText,
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
              ))
            )}
            {isSending && (
              <View style={[styles.messageBubble, styles.assistantMessage]}>
                <ActivityIndicator size="small" color={isDark ? "#888" : "#666"} />
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask a question..."
              placeholderTextColor={isDark ? "#666" : "#999"}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const createStyles = (isDark: boolean, bottomInset: number) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    panel: {
      height: PANEL_HEIGHT,
      backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: "hidden",
    },
    keyboardView: {
      flex: 1,
    },
    handleContainer: {
      alignItems: "center",
      paddingVertical: 12,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "#444" : "#ddd",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#e8e4dc",
    },
    headerText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
    },
    closeButton: {
      fontSize: 16,
      color: isDark ? "#6b9ac4" : "#1a4a6e",
      fontWeight: "500",
    },
    versePreview: {
      maxHeight: 120,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDark ? "#242424" : "#f5f3ef",
    },
    versePreviewText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? "#aaa" : "#666",
      fontStyle: "italic",
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: 16,
      paddingBottom: 8,
      flexGrow: 1,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 15,
      color: isDark ? "#666" : "#999",
      fontStyle: "italic",
    },
    messageBubble: {
      maxWidth: "85%",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      marginBottom: 8,
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: isDark ? "#4a6a8a" : "#1a4a6e",
    },
    assistantMessage: {
      alignSelf: "flex-start",
      backgroundColor: isDark ? "#2a2a2a" : "#f0ece4",
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
      color: isDark ? "#faf9f6" : "#1a1a1a",
    },
    userMessageText: {
      color: "#fff",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: Math.max(bottomInset, 16),
      borderTopWidth: 1,
      borderTopColor: isDark ? "#333" : "#e8e4dc",
      backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
    },
    input: {
      flex: 1,
      backgroundColor: isDark ? "#242424" : "#fff",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingTop: 10,
      fontSize: 15,
      color: isDark ? "#faf9f6" : "#1a1a1a",
      maxHeight: 100,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e8e4dc",
    },
    sendButton: {
      marginLeft: 8,
      backgroundColor: isDark ? "#4a6a8a" : "#1a4a6e",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
    },
  });
