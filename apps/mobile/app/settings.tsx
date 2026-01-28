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
import { useLocale, useStrings } from "../lib/locale";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = createStyles(isDark);
  const { locale, setLocale, isLoading: localeLoading } = useLocale();
  const strings = useStrings();

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
      Alert.alert(strings.invalidKey, strings.invalidKeyMessage);
      return;
    }

    try {
      await saveApiKey(apiKey);
      setHasKey(true);
      setApiKey("sk-..." + apiKey.slice(-4));
      Alert.alert(strings.success, strings.apiKeySaved);
    } catch (error) {
      Alert.alert(strings.error, strings.apiKeyError);
    }
  }

  async function handleRemoveKey() {
    Alert.alert(
      strings.removeApiKey,
      strings.removeApiKeyConfirm,
      [
        { text: strings.cancel, style: "cancel" },
        {
          text: strings.remove,
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

  function handleLanguageChange(newLocale: "en" | "es") {
    setLocale(newLocale);
  }

  if (isLoading || localeLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: strings.settings }} />
        <Text style={styles.loadingText}>{strings.loading}</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: strings.settings }} />
      <ScrollView style={styles.container}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.language}</Text>
          <Text style={styles.sectionDescription}>
            {strings.languageDescription}
          </Text>

          <View style={styles.card}>
            <Pressable
              style={[
                styles.languageOption,
                locale === "en" && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange("en")}
            >
              <Text
                style={[
                  styles.languageText,
                  locale === "en" && styles.languageTextSelected,
                ]}
              >
                English
              </Text>
              {locale === "en" && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              style={[
                styles.languageOption,
                styles.languageOptionLast,
                locale === "es" && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange("es")}
            >
              <Text
                style={[
                  styles.languageText,
                  locale === "es" && styles.languageTextSelected,
                ]}
              >
                Español
              </Text>
              {locale === "es" && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* AI Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.aiStudyCompanion}</Text>
          <Text style={styles.sectionDescription}>
            {strings.aiDescription}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{strings.openaiApiKey}</Text>

            {hasKey ? (
              <View style={styles.keyConnected}>
                <View style={styles.keyStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{strings.connected}</Text>
                </View>
                <Text style={styles.maskedKey}>{apiKey}</Text>
                <Pressable style={styles.removeButton} onPress={handleRemoveKey}>
                  <Text style={styles.removeButtonText}>{strings.disconnect}</Text>
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
                  <Text style={styles.saveButtonText}>{strings.connect}</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.helpText}>
              {strings.getApiKey}{" "}
              <Text style={styles.linkText}>platform.openai.com</Text>
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{strings.about}</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              {strings.aboutText}
            </Text>
            <Text style={styles.versionText}>{strings.version} 2026.1.12</Text>
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
    languageOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#e8e4dc",
    },
    languageOptionLast: {
      borderBottomWidth: 0,
    },
    languageOptionSelected: {
      backgroundColor: "transparent",
    },
    languageText: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#666",
    },
    languageTextSelected: {
      color: isDark ? "#faf9f6" : "#1a1a1a",
      fontWeight: "600",
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: isDark ? "#4a6a8a" : "#1a4a6e",
      alignItems: "center",
      justifyContent: "center",
    },
    checkmarkText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "600",
    },
  });
