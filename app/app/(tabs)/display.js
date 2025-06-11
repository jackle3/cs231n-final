import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";

import Carousel from "react-native-reanimated-carousel";

// import PagerView from "react-native-pager-view";

import { db, functions } from "@/database/db";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function DisplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [scenes, setScenes] = useState([]);
  const ref = useRef(null);

  const WIDTH = Dimensions.get("window").width;

  useEffect(() => {
    ref.current?.scrollTo(0);
  }, []);

  const sendPrompt = async (sessionId) => {
    if (!sessionId) {
      console.error("No session ID provided");
      return;
    }

    try {
      // Fetch session document
      const sessionRef = doc(db, "sessions", sessionId);
      let sessionDoc = await getDoc(sessionRef);
      let session = sessionDoc.data();

      console.log("Session data:", JSON.stringify(session, null, 2));

      // If the session hasn't started running yet, start the pipeline
      if (session.state == "completed") {
        setScenes(session.scenes);
        setImages(session.images);
      } else if (session.state == "pending") {
        console.log("Running pipeline");
        const pipeline = httpsCallable(functions, "pipeline", {
          timeout: 300000,
        });
        const { data } = await pipeline({ sessionId, liveMode: true });

        // Fetch updated session document
        sessionDoc = await getDoc(sessionRef);
        session = sessionDoc.data();

        const profileDoc = await getDoc(
          doc(db, "lora_profiles", session.profileId)
        );
        const profile = profileDoc.data();

        console.log(
          "Updated session data:",
          JSON.stringify(session.scenes, null, 2)
        );

        // Clean up the prompts
        const cleanScenes = session.scenes.map((scene) => {
          // Replace token with name
          let cleanedScene = scene.replace(
            new RegExp(profile.token, "g"),
            profile.name
          );

          // Find and remove everything after "The scene is in the style of a"
          const styleIndex = cleanedScene.indexOf(
            "The scene is in the style of a"
          );
          if (styleIndex !== -1) {
            cleanedScene = cleanedScene.substring(0, styleIndex);
          }

          return cleanedScene;
        });

        // Set generated images and scene prompts
        setImages(data);
        setScenes(cleanScenes);

        console.log("Pipeline response:", JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (images.length == 0) {
      setIsLoading(true);
      sendPrompt(params.sessionId).finally(() => setIsLoading(false));
    }
  }, [params.sessionId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("../../assets/loading.avif")}
          style={styles.loadingGif}
        />
        <Text style={styles.loadingText}>Imagineering Your Story...</Text>
      </View>
    );
  }

  const ImageCard = ({ uri, text }) => (
    <View
      style={{
        backgroundColor: "white",
        elevation: 2,
        marginHorizontal: 20,
        height: 600,
        width: 450,
        overflow: "hidden",
        borderRadius: 16,
      }}
    >
      <Image source={uri} style={{ height: 450, width: 450 }} />
      <Text
        style={{
          margin: 14,
          lineHeight: 20,
          fontFamily: "Inter",
          fontSize: 15,
        }}
      >
        {text}
      </Text>
    </View>
  );

  if (images.length > 0) {
    return (
      <View style={styles.viewerContainer}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            // Reset everything
            setImages([]);
            setScenes([]);
            setIsLoading(true);
            ref.current?.scrollTo(0);
            router.back();
          }}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Carousel
          loop={false}
          ref={ref}
          // autoPlay={true}
          // autoPlayInterval={4000}
          // scrollAnimationDuration={8000}
          data={images}
          height={600}
          width={500}
          pagingEnabled={true}
          style={{ width: WIDTH }}
          renderItem={({ item, index }) => (
            <ImageCard uri={{ uri: item }} text={scenes[index]} />
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Pressable
        onPress={() => {
          setIsLoading(false);
          router.back();
        }}
      >
        <Text style={{ color: "white" }}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 50,
    color: "white",
    fontSize: 22,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  loadingGif: {
    marginTop: 50,
    width: 600,
    height: 320,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "#212121",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 30,
  },
  backText: {
    color: "#ffffff",
    fontSize: 18,
  },
});
