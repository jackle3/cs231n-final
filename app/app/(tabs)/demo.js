import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Video } from "expo-av";

import AntDesign from "@expo/vector-icons/AntDesign";

function Slide1() {
  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Character-Sheet Generator</Text>
      <Text style={styles.description}>
        ControlNet pose conditioning builds multi-view portraits in ≈ 1 min
      </Text>
      <View style={styles.frameContainer}>
        <View style={styles.characterPromptBox}>
          <Text style={styles.characterPromptText}>
            A college-aged Japanese-American woman with large expressive brown
            eyes and long dark lashes, round face with a slight angular jaw,
            sun-kissed skin peppered with freckles across cheeks and nose,
            thick, well-shaped eyebrows showing quiet determination, wavy,
            shoulder-length dark-brown hair, tousled and tangled from the sea
            with a few sun-bleached strands. She wears an oversized, worn
            sea-foam-green hoodie with frayed cuffs over a snug, patched wetsuit
            that sports colorful, hand-stitched repairs; loose board shorts;
            silver seashell necklace resting at her collarbone, in flip-flops.
          </Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <Image
          source={require("../../assets/sheet.png")}
          style={[styles.image, { marginLeft: 15 }]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function Slide2() {
  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Model Adaptation</Text>
      <Text style={styles.description}>
        LoRA fine-tuning of a diffusion using the character sheet dataset
      </Text>
      <View style={styles.frameContainer}>
        <Image
          source={require("../../assets/sheet.png")}
          style={[styles.image, { marginRight: 15 }]}
          resizeMode="contain"
        />
        <Text style={styles.arrow}>→</Text>
        <Image
          source={require("../../assets/model_adapt.png")}
          style={{ marginLeft: 15, width: 600 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function Slide3() {
  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Anchor-Frame Creation</Text>
      <Text style={styles.description}>
        Text-conditioned FLUX generates per-scene keyframes
      </Text>
      <View style={styles.frameContainer}>
        <View style={styles.characterPromptBox}>
          <Text style={styles.characterPromptText}>
            A pixar style coming of age story of a young islander Mia who seeks
            adventure and is chosen by the ocean to return the heart of the sea
            with the help of a magical hawk. It is only after she leaves home
            that she realizes that family is the most important adventure of all
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Image
            source={require("../../assets/arrow.png")}
            style={{ width: 200, transform: [{ rotate: "-45deg" }] }}
          />
          <Image
            style={{ width: 156, marginLeft: 22 }}
            source={require("../../assets/arrow.png")}
          />
          <Image
            source={require("../../assets/arrow.png")}
            style={{ width: 200, transform: [{ rotate: "45deg" }] }}
          />
        </View>
        <View style={styles.framesColumn}>
          <Image
            source={require("../../assets/frame1.png")}
            style={styles.frame}
          />
          <Image
            source={require("../../assets/frame2.png")}
            style={styles.frame}
          />
          <Image
            source={require("../../assets/frame3.png")}
            style={styles.frame}
          />
        </View>
      </View>
    </View>
  );
}

function Slide4() {
  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Anchor-Frame Creation</Text>
      <Text style={styles.description}>
        Text-conditioned FLUX generates per-scene keyframes
      </Text>
      <View style={styles.frameContainer}>
        <View style={styles.framesColumn}>
          <Image
            source={require("../../assets/frame1.png")}
            style={styles.frame}
          />
          <Image
            source={require("../../assets/frame2.png")}
            style={styles.frame}
          />
          <Image
            source={require("../../assets/frame3.png")}
            style={styles.frame}
          />
        </View>
        <View style={[styles.framesColumn, { gap: 120, marginHorizontal: 25 }]}>
          <Image
            source={require("../../assets/arrow.png")}
            style={{ width: 156 }}
          />
          <Image
            style={{ width: 156 }}
            source={require("../../assets/arrow.png")}
          />
          <Image
            source={require("../../assets/arrow.png")}
            style={{ width: 156 }}
          />
        </View>
        <View style={styles.framesColumn}>
          <Video
            source={require("../../assets/demo_vids/anim1.mov")}
            style={{ marginVertical: 6, width: 275, height: 160 }}
            useNativeControls
            isLooping={true}
            shouldPlay={true}
            resizeMode="contain"
            onReadyForDisplay={(event) => {
              event.srcElement.style.position = "initial";
            }}
          />
          <Video
            source={require("../../assets/demo_vids/anim2.mov")}
            style={{ marginVertical: 6, width: 275, height: 160 }}
            useNativeControls
            isLooping={true}
            shouldPlay={true}
            resizeMode="contain"
            onReadyForDisplay={(event) => {
              event.srcElement.style.position = "initial";
            }}
          />
          <Video
            source={require("../../assets/demo_vids/anim3.mov")}
            style={{ marginVertical: 6, width: 275, height: 160 }}
            useNativeControls
            isLooping={true}
            shouldPlay={true}
            resizeMode="contain"
            onReadyForDisplay={(event) => {
              event.srcElement.style.position = "initial";
            }}
          />
        </View>
      </View>
    </View>
  );
}

function Slide5() {
  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Final Output</Text>
      <Text style={styles.description}>
        Anchor clips concatenated into full narrative video
      </Text>
      <Video
        source={require("../../assets/demo_vids/mia_576p.mov")}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        isLooping={true}
        shouldPlay={true}
      />
    </View>
  );
}

function Slide6() {
  return (
    <View style={styles.slide}>
      <Text style={styles.title}>Pipeline Comparison</Text>
      <Text style={styles.description}>
        We find significantly improved character and style consistency with{" "}
        {"\n"}LoRA fine-tuning for Dreambooth
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 50,
          marginTop: 20,
        }}
      >
        <Image
          source={require("../../assets/comp1.png")}
          style={{ width: 550, height: 600 }}
          resizeMode="contain"
        />
        <Image
          source={require("../../assets/comp2.png")}
          style={{ width: 550, height: 600 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function Slide({ index }) {
  if (index == 0) {
    return <Slide1 />;
  } else if (index == 1) {
    return <Slide2 />;
  } else if (index == 2) {
    return <Slide3 />;
  } else if (index == 3) {
    return <Slide4 />;
  } else if (index == 4) {
    return <Slide5 />;
  } else if (index == 5) {
    return <Slide6 />;
  }
}

export default function DemoScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const numSlides = 6;
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));
  const next = () => setCurrent((c) => Math.min(c + 1, numSlides - 1));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setCurrent(0);
          router.back();
        }}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <Slide index={current} />
      <TouchableOpacity
        style={styles.navLeft}
        onPress={prev}
        disabled={current === 0}
      >
        <AntDesign
          name="leftcircleo"
          size={32}
          color={current === 0 ? "#555" : "white"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navRight}
        onPress={next}
        disabled={current === numSlides - 1}
      >
        <AntDesign
          name="rightcircleo"
          size={32}
          color={current === numSlides - 1 ? "#555" : "white"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212121",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  slide: {
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 24,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
  },
  image: {
    width: 400,
    height: 400,
  },
  frameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  frame: {
    width: 160,
    height: 160,
    marginVertical: 6,
    marginLeft: 15,
  },
  arrowContainer: { gap: 50 },
  arrow: {
    fontSize: 48,
    color: "#FFFFFF",
    marginHorizontal: 8,
  },
  navLeft: {
    position: "absolute",
    left: 20,
    top: "50%",
  },
  navRight: {
    position: "absolute",
    right: 20,
    top: "50%",
  },
  video: {
    width: 800,
    height: 400,
    marginTop: 40,
  },
  characterPromptBox: {
    backgroundColor: "#303030",
    padding: 25,
    borderRadius: 8,
    marginRight: 15,
    maxWidth: 400,
  },
  characterPromptText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  backText: {
    color: "#ffffff",
    fontSize: 18,
  },
});
