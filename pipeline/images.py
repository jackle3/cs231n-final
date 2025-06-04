import replicate

prompt = "After her wipeout, M1A lies on the beach next to her broken board. Seagulls circle overhead. A rotund, goofy-looking penguin with a perpetually blank expression waddles up, inspecting the wreckage."

output = replicate.run(
    "lucataco/flux-dev-lora:091495765fa5ef2725a175a57b276ec30dc9d39c22d30410f2ede68a3eab66b3",
    input={
        "seed": 231,
        "prompt": prompt,
        "hf_lora": "isaackan/m1a",
        "lora_scale": 0.8,
        "num_outputs": 1,
        "aspect_ratio": "1:1",
        "output_format": "png",
        "guidance_scale": 3.5,
        "output_quality": 80,
        "prompt_strength": 0.8,
        "num_inference_steps": 28,
        "disable_safety_checker": True,
    }
)
print(output)