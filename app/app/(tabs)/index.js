import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";

import Entypo from "@expo/vector-icons/Entypo";

import { db } from "@/database/db";
import { collection, getDocs } from "firebase/firestore";

export default function LandingScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);

  // Load all pre-trained profiles
  const getData = async () => {
    const query = await getDocs(collection(db, "lora_profiles"));
    setProfiles(query.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    getData();
  }, []);

  const ProfileCard = ({ profile }) => {
    // Each profile card has its own scale animation
    const scale = useRef(new Animated.Value(1)).current;

    return (
      <View style={styles.cardBorder}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/prompt",
              params: { profileId: profile.id },
            })
          }
        >
          {/* Animation for hovering over a ProfileCard */}
          <Animated.View
            style={[{ transform: [{ scale }] }]}
            onMouseEnter={() => {
              Animated.spring(scale, {
                toValue: 1.07,
                useNativeDriver: true,
              }).start();
            }}
            onMouseLeave={() => {
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }}
          >
            <View style={styles.cardContainer}>
              <Image
                source={{ uri: profile.image_url }}
                style={styles.avatar}
              />
              <Text style={styles.profileName}>{profile.name}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>What would you like to imagine?</Text>
      <Text style={styles.subtitle}>
        Select a pre-trained profile to start generating a video
      </Text>
      <View style={styles.cardRow}>
        {profiles.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </View>
      <Pressable style={styles.button} onPress={() => console.log("Test")}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.buttonText}>View a Demo</Text>
          <Entypo
            name="chevron-right"
            size={18}
            color="white"
            style={{ marginLeft: 4 }}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#212121", // Dark background
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 60,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Inter",
  },
  subtitle: {
    fontSize: 16,
    color: "#cccccc",
    textAlign: "center",
    marginBottom: 65,
    lineHeight: 20,
    fontFamily: "Inter",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBorder: {
    padding: 22,
    marginHorizontal: 16,
    backgroundColor: "#303030",
    borderRadius: 16,
  },
  cardContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#212121",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    // width, height, radius, color
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    elevation: 5,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "#333333",
    marginBottom: 20,
  },
  profileName: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    borderRadius: 100,
    backgroundColor: "#141516",
    borderColor: "#585858",
    borderWidth: 1,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginTop: 75,
  },
  buttonText: { color: "white", fontFamily: "Inter", fontSize: 15 },
});
