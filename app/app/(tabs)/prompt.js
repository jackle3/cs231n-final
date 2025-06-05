import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  TextInput,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";

import { LinearGradient } from "expo-linear-gradient";
import * as Crypto from "expo-crypto";

import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";

import { db } from "@/database/db";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function PromptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [profile, setProfile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const borderAnim = useRef(new Animated.Value(0)).current;

  // Whenever we fetch a new profile, reset the prompt and profile state
  useEffect(() => {
    setPrompt("");

    const profileRef = doc(db, "lora_profiles", params.profileId);
    getDoc(profileRef).then((snapshot) => {
      setProfile(snapshot.data());
    });
  }, [params.profileId]);

  // Button to start a new session using the user's prompt & character
  const createSessionButton = () => (
    <Pressable
      style={styles.buttonContainer}
      onPress={() => createSession(prompt)}
    >
      <LinearGradient
        colors={["#ff5311", "#f44336", "#bc51e2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.buttonGradient}
      >
        <Text style={styles.buttonText}>Create Your Story</Text>
        <AntDesign name="arrowright" size={18} color="white" />
      </LinearGradient>
    </Pressable>
  );

  // Initialize new generation session when the user clicks the "Create Your Story" button
  const createSession = async (prompt) => {
    try {
      const sessionId = Crypto.randomUUID();
      const sessionRef = doc(db, "sessions", sessionId);
      await setDoc(sessionRef, {
        prompt: prompt.trim(),
        profileId: params.profileId,
        state: "pending",
        timestamp: new Date(),
      });

      setPrompt("");
      router.push({
        pathname: "/display",
        params: { sessionId },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Animation handlers
  const handleFocus = () => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Example prompts to speed up demo
  const examplePrompts = [
    {
      title: "Try Surfs Up",
      prompt: `A pixar style coming of age story of a ${profile?.noun} who gets a chance to compete at a surf tournament but gets smashed by a massive wave, it is only after ${profile?.pronoun} makes her own board with a fat penguin that ${profile?.pronoun} realizes the true meaning of surfing is to have fun`,
    },
    {
      title: "Try Cars",
      prompt: `A pixar style coming of age story of a young track star who gets lost on the way to the olympics and ends up in a small town where ${profile?.pronoun} meets a rusty old car that teaches them the value of friendship and perseverance`,
    },
    {
      title: "Try Moana",
      prompt: `A pixar style coming of age story of a young islander ${profile?.noun} who seeks adventure and is chosen by the ocean to return the heart of the sea with the help of a magical hawk. It is only after ${profile?.pronoun} leaves home that ${profile?.pronoun} realizes that family is the most important adventure of all`,
    },
  ];

  return (
    <View style={styles.screenContainer}>
      <View style={styles.floatingIcon}>
        <Ionicons.Button
          onPress={() => {
            setPrompt("");
            router.back();
          }}
          name="close"
          size={32}
          color="#909090"
          backgroundColor="transparent"
          underlayColor="rgba(0,0,0,0)"
        />
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.title}>Let's get started</Text>
        <Text style={styles.subtitle}>
          {profile
            ? `Describe a plot for ${profile.name} to explore`
            : "Describe a plot to explore"}
        </Text>
        <Animated.View
          style={[
            styles.inputContainer,
            {
              borderColor: borderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["#444", "#f8991c"],
              }),
            },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder="A pixar-style coming of age adventure where ... "
            placeholderTextColor="#888"
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={true}
            underlineColorAndroid="transparent"
            value={prompt}
            onChangeText={setPrompt}
          />
        </Animated.View>

        {/* IDK why height = 0 works ?? */}
        <View style={{ height: 0 }}>
          {prompt.length > 0 ? (
            createSessionButton()
          ) : (
            <View style={styles.promptButtonRow}>
              {examplePrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.promptButton}
                  onPress={() => setPrompt(prompt.prompt)}
                >
                  <Text style={styles.promptButtonText}>{prompt.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#212121",
    paddingTop: 60,
    alignItems: "center",
  },
  floatingIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
  },
  bodyContainer: {
    width: 800,
    marginBottom: 150,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "500",
    color: "#f8991c",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  subtitle: {
    fontSize: 25,
    fontWeight: "450",
    color: "#999999",
    marginBottom: 30,
    fontFamily: "Inter,",
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#303030",
  },
  textInput: {
    color: "white",
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
    backgroundColor: "#303030",
    borderWidth: 0, // remove inner blue border
    outlineWidth: 0, // remove web focus outline
    outlineStyle: "none",
    outlineColor: "transparent",
    lineHeight: 25,
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: "flex-end",
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 6,
    paddingLeft: 20,
    paddingRight: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Inter",
    paddingRight: 5,
  },
  promptButtonRow: {
    alignSelf: "flex-end",
    marginTop: 20,
    flexDirection: "row",
  },
  promptButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 32,
    borderColor: "#444444",
    borderWidth: 1,
    marginLeft: 7.5,
  },
  promptButtonText: {
    color: "#999999",
    fontSize: 12,
    fontFamily: "Inter",
  },
});
