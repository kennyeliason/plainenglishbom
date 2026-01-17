import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  Alert,
  ScrollView,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveApiKey, getApiKey, removeApiKey } from "../lib/ai-client";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);

  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApiKey();
  }, []);

  async function loadApiKey() {
    const key = await getApiKey();
    setHasKey(!!key);
    if (key) {
      // Show masked version
      setApiKey("sk-..." + key.slice(-4));
    }
    setIsLoading(false);
  }

  async function handleSaveKey() {
    if (!apiKey.startsWith("sk-")) {
      Alert.alert("Invalid Key", "OpenAI API keys start with 'sk-'");
      return;
    }

    try {
      await saveApiKey(apiKey);
      setHasKey(true);
      setApiKey("sk-..." + apiKey.slice(-4));
      Alert.alert("Success", "API key saved securely");
    } catch (error) {
      Alert.alert("Error", "Failed to save API key");
    }
  }

  async function handleRemoveKey() {
    Alert.alert(
      "Remove API Key",
      "Are you sure you want to remove your API key?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeApiKey();
            setHasKey(false);
            setApiKey("");
          },
        },
      ]
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Settings" }} />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Settings" }} />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Study Companion</Text>
          <Text style={styles.sectionDescription}>
            Connect your OpenAI account to get AI-powered insights on any verse.
            Tap the sparkle icon on any verse to learn more about it.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>OpenAI API Key</Text>

            {hasKey ? (
              <View style={styles.keyConnected}>
                <View style={styles.keyStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Connected</Text>
                </View>
                <Text style={styles.maskedKey}>{apiKey}</Text>
                <Pressable style={styles.removeButton} onPress={handleRemoveKey}>
                  <Text style={styles.removeButtonText}>Disconnect</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.keyInput}>
                <TextInput
                  style={styles.input}
                  placeholder="sk-..."
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  value={apiKey}
                  onChangeText={setApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
                <Pressable
                  style={[styles.saveButton, !apiKey && styles.saveButtonDisabled]}
                  onPress={handleSaveKey}
                  disabled={!apiKey}
                >
                  <Text style={styles.saveButtonText}>Connect</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.helpText}>
              Get your API key from{" "}
              <Text style={styles.linkText}>platform.openai.com</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              Plain English Book of Mormon translates scripture into clear,
              modern language while preserving its original meaning.
            </Text>
            <Text style={styles.versionText}>Version 2026.1.12</Text>
          </View>
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
    loadingText: {
      color: isDark ? "#888" : "#666",
      textAlign: "center",
      marginTop: 40,
    },
    section: {
      padding: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 1,
      textTransform: "uppercase",
      color: isDark ? "#888" : "#666",
      marginBottom: 8,
    },
    sectionDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? "#aaa" : "#666",
      marginBottom: 16,
    },
    card: {
      backgroundColor: isDark ? "#242424" : "#fff",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e8e4dc",
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#faf9f6" : "#1a1a1a",
      marginBottom: 12,
    },
    keyConnected: {
      marginBottom: 12,
    },
    keyStatus: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#22c55e",
      marginRight: 8,
    },
    statusText: {
      fontSize: 14,
      color: "#22c55e",
      fontWeight: "500",
    },
    maskedKey: {
      fontSize: 14,
      color: isDark ? "#888" : "#666",
      fontFamily: "monospace",
      marginBottom: 12,
    },
    removeButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: isDark ? "#3a2a2a" : "#fef2f2",
      alignSelf: "flex-start",
    },
    removeButtonText: {
      color: "#ef4444",
      fontWeight: "500",
    },
    keyInput: {
      marginBottom: 12,
    },
    input: {
      backgroundColor: isDark ? "#1a1a1a" : "#faf9f6",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#faf9f6" : "#1a1a1a",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e8e4dc",
      marginBottom: 12,
    },
    saveButton: {
      backgroundColor: isDark ? "#4a6a8a" : "#1a4a6e",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
    },
    helpText: {
      fontSize: 12,
      color: isDark ? "#666" : "#999",
    },
    linkText: {
      color: isDark ? "#6b9ac4" : "#1a4a6e",
    },
    aboutText: {
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? "#aaa" : "#666",
      marginBottom: 12,
    },
    versionText: {
      fontSize: 12,
      color: isDark ? "#666" : "#999",
    },
  });
