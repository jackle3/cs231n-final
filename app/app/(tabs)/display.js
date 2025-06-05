import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef, use } from "react";

import { db, functions } from "@/database/db";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function DisplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const sendPrompt = async (sessionId) => {
    if (!sessionId) {
      console.error("No session ID provided");
      return;
    }

    try {
      // Fetch session document
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionDoc = await getDoc(sessionRef);
      const session = sessionDoc.data();

      // If the session hasn't started running yet, start the pipeline
      if (session.state == "pending") {
        console.log("Running pipeline");
        const pipeline = httpsCallable(functions, "pipeline");
        const res = await pipeline({ sessionId, liveMode: false });
        console.log("Pipeline response:", JSON.stringify(res.data, null, 2));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      sendPrompt(params.sessionId).finally(() => setIsLoading(false));
    }
  }, [params.sessionId]);

  // Animated pulsing circle
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.pulseCircle,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
              opacity: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 0.3],
              }),
            },
          ]}
        />
        <Text style={styles.loadingText}>Loading your story...</Text>
      </View>
    );
  }

  return (
    <View>
      <Pressable onPress={() => router.back()}>
        <Text>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#212121",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8991c",
  },
  loadingText: {
    marginTop: 20,
    color: "white",
    fontSize: 18,
    fontFamily: "Inter",
  },
});
