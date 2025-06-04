import OpenAI from "openai";
import Replicate from "replicate";

import "dotenv/config";
import fs from "fs";
import { writeFile } from "node:fs/promises";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_TOKEN });

const generateScenes = async (character, plot) => {
  const prompt = `
I want to generate a series of 10 concise (1-2 sentences) scene descriptions \
for a movie according to the provided plot. I will put the description of what \
I want below. Please come up with 10 key scenes in the plot, then describe each \
scene in detail (such that I could render an image using your description). \
Use the exact token “[x]” (including brackets) everywhere you would otherwise put the main character's name. \
Here is a detailed description of the main character: '${character}'.\
Here is the description of the movie plot: '${plot}'. 

**Return format (exactly):** 
1. <Scene 1 description> 
2. <Scene 2 description> 
...
10. <Scene 10 description> 
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    store: true,
    messages: [{ role: "user", content: prompt }],
  });

  console.log(JSON.stringify(completion, null, 2));

  // Extract the raw text and replcae [x] with M1A (trigger token)
  let text = completion.choices[0].message.content.trim();
  text = text.replace(/\[x\]/g, "M1A");

  // Split on newline, remove leading “N. ” from each line, and filter out empty lines
  const scenes = text
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0);

  // scenes is now an array of 10 strings
  return scenes;
};

/**
 * Use a fine-tuned Dreambooth/LORA model to generate a frame from a prompt
 * @param {string} prompt The prompt the generate the frame from
 */
const generateFrame = async (prompt, outputPath) => {
  const [output] = await replicate.run(
    "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3",
    {
      input: {
        seed: 231,
        prompt,
        hf_lora: "isaackan/cs231n-cat",
        lora_scale: 0.8,
        num_outputs: 1,
        aspect_ratio: "1:1",
        output_format: "png",
        guidance_scale: 3.5,
        output_quality: 80,
        prompt_strength: 0.8,
        num_inference_steps: 28,
        disable_safety_checker: true,
      },
    }
  );

  console.log(output.url());
  await writeFile(outputPath, output);
  console.log(`Image saved as ${outputPath}`);
};

const main = async () => {
  // Create output directory
  const now = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = `runs/${now}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  //   let character =
  //     "Mia Watanabe is a college-aged Japanese-American girl with a Pixar-style design, featuring large, expressive brown eyes framed by long, dark lashes. Her face is round with a slight angular jawline, and her skin is sun-kissed, dotted with freckles across her cheeks and nose. \
  // She has wavy, dark brown hair that falls just past her shoulders, often tangled and tousled from the sea, with a few lighter strands hinting at sun exposure. Her eyebrows are thick but well-shaped, conveying a sense of determination and intensity.\
  // Mia typically wears a worn, oversized hoodie in a seafoam green hue, its sleeves slightly frayed. Underneath, she wears a snug, patched-up wetsuit with colorful, hand-stitched sections that hint at her artistic, resourceful nature. Around her neck hangs a silver seashell necklace that she never takes off — her only connection to her late mother.\
  // She walks with a confident stride, her board shorts slightly oversized, hanging loosely around her hips. Her feet are usually bare or in well-worn flip-flops, toes slightly sandy and tanned.";
  let character = "A cat standing upright wearing a chef's uniform";

  let plot1 =
    "a pixar style coming of age story of a girl who gets a chance to compete at a surf tournament but gets smashed by a massive wave, it is only after she makes her own board with a fat penguin that she realizes the true meaning of surfing is to have fun";
  let plot2 =
    "a pixar style coming of age story of a young track star who gets lost on the way to the olympics and ends up in a small town where she meets a rusty old car that teaches her the value of friendship and perseverance";
  let plot3 =
    "a pixar style coming of age story of a young islander girl who seeks adventure and is chosen by the ocean to return the heart of the sea with the help of a magical hawk. It is only after she leaves home that she realizes that family is the most important adventure of all";
  let plot4 =
    "a pixar style story where every character is a cat. The main character wants to become a chef but his family of cats needs him to stay at home. he travels to paris and partners with another cat chef, eventually convincing one of France's harshest critics, to love his food.";

  // Generate 10 scene prompts
  console.time("generateScenes");
  let scenePrompts = await generateScenes(character, plot4);
  console.timeEnd("generateScenes");

  // Save prompts
  fs.writeFileSync(
    `${outputDir}/prompts.json`,
    JSON.stringify(scenePrompts, null, 2)
  );

  //   let scenePrompts = JSON.parse(
  //     fs.readFileSync("runs/2025-06-04T00-28-18-504Z/prompts.json", "utf8")
  //   );

  let frames = scenePrompts.map((prompt, i) => {
    return generateFrame(prompt, `${outputDir}/frame-${i + 1}.png`);
  });

  // Generate comic frames from each of the 10 scene prompts
  console.time("generateFrame");
  await Promise.all(frames);
  console.timeEnd("generateFrame");
};

main();
