import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#1a1a1a" : "#faf9f6" },
        ]}
      >
        <Text style={[styles.title, { color: isDark ? "#faf9f6" : "#1a1a1a" }]}>
          Page Not Found
        </Text>
        <Text
          style={[styles.subtitle, { color: isDark ? "#888" : "#666" }]}
        >
          Lost in the wilderness
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Return Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "500",
  },
});
