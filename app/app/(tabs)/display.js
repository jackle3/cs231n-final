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

// import PagerView from "react-native-pager-view";

import { db, functions } from "@/database/db";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export default function DisplayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);

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
        const pipeline = httpsCallable(functions, "pipeline", {
          timeout: 300000,
        });
        const { data } = await pipeline({ sessionId, liveMode: false });
        setImages(data);
        console.log("Pipeline response:", JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setImages([
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-0.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-1.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-2.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-3.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-4.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-5.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-6.png",
      "https://storage.googleapis.com/cs231n-isaac.firebasestorage.app/sessions/ea7196fa-0b8b-4bf4-bd16-9ef8f88a7e09/frame-7.png",
    ]);

    setIsLoading(false);

    // if (images.length == 0) {
    //   setIsLoading(true);
    //   sendPrompt(params.sessionId).finally(() => setIsLoading(false));
    // }
  }, [params.sessionId]);

  const AutoScrollingRow = ({
    images, // [{ uri: "...", text: "..." }, …]
    speed = 0.4, // px per animation frame  (tweak to taste)
    resumeDelay = 3000, // ms to wait after user stops scrolling
  }) => {
    const ref = useRef(null); // ScrollView handle
    const [offset, setOff] = useState(0); // current scroll offset
    const [contentW, setCW] = useState(1); // content width
    const [containerW, setVW] = useState(0); // viewport width
    const userScrolling = useRef(false); // is the user dragging?
    const rafId = useRef(null); // rAF handle
    const resumeTimer = useRef(null); // setTimeout handle

    /* ---------- core autoscroll loop ---------- */
    useEffect(() => {
      const step = () => {
        if (!userScrolling.current && ref.current) {
          const next = offset + speed;
          const max = contentW - containerW;
          const x = next >= max ? 0 : next; // loop back
          ref.current.scrollTo({ x, animated: false });
          setOff(x);
        }
        rafId.current = requestAnimationFrame(step);
      };
      rafId.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafId.current);
    }, [offset, speed, contentW, containerW]);

    /* ---------- handlers to pause / resume ---------- */
    const onScrollBeginDrag = () => {
      userScrolling.current = true;
      clearTimeout(resumeTimer.current);
    };

    const onScrollEndDrag = () => {
      resumeTimer.current = setTimeout(() => {
        userScrolling.current = false;
      }, resumeDelay);
    };

    return (
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onContentSizeChange={(w) => setCW(w)}
        onLayout={(e) => setVW(e.nativeEvent.layout.width)}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        style={styles.row}
      >
        {/* {images.map(({ uri, text }, i) => (
          <ImageCard key={i} uri={{ uri }} text={text} />
        ))} */}
        {images.map((img, i) => (
          <ImageCard key={i} uri={img} text={"Hello World"} />
        ))}
      </ScrollView>
    );
  };

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
        {/* <ImageCard
          uri={images[0]}
          text={
            "miawat stands at the edge of a bustling track field at dawn, stretching her legs with determined eyes, her windswept hair and freckles catching the early sunlight as she prepares for a race. The scene is in the style of a realistic photograph."
          }
        /> */}
        <AutoScrollingRow images={images} />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.loadingContainer}>
      <Pressable onPress={() => router.back()}>
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
  row: {
    flexGrow: 0, // don’t let it stretch vertically
    cursor: "grab", // UX hint on web
  },
  card: {
    backgroundColor: "white",
    elevation: 2,
    marginHorizontal: 20,
    height: 600,
    width: 450,
    overflow: "hidden",
    borderRadius: 16,
  },
  image: {
    height: 450,
    width: 450,
  },
  caption: {
    margin: 14,
    lineHeight: 20,
    fontFamily: "Inter",
    fontSize: 15,
  },
});
