import axios from "axios";

const COMFYUI_URL = "http://127.0.0.1:8188"; // Change this if needed

export async function generateImage(imageSrc, updateStatus) {
  if (!imageSrc) {
    updateStatus("❌ No image captured!");
    return null;
  }

  try {
    updateStatus("📤 Uploading image to ComfyUI...");

    // Convert Base64 image to Blob
    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    formData.append("image", blob, "captured_image.png");
    formData.append("type", "input");

    // 1️⃣ Upload the captured image to ComfyUI
    const uploadResponse = await axios.post(`${COMFYUI_URL}/upload/image`, formData);
    const uploadedImageName = uploadResponse.data.name;

    updateStatus("✅ Image uploaded! Processing in ComfyUI...");

    // 2️⃣ Send request to generate AI image based on uploaded image
    const workflowData = {
      nodes: [
        {
          "node_id": "LoadImage",
          "inputs": { "image": uploadedImageName }
        },
        {
          "node_id": "ImageProcessing",
          "inputs": { "input": "LoadImage.output" }
        }
      ]
    };

    const response = await axios.post(`${COMFYUI_URL}/prompt`, workflowData, {
      headers: { "Content-Type": "application/json" }
    });

    updateStatus("🎉 Processing complete! Fetching generated image...");

    // 3️⃣ Fetch generated image from ComfyUI
    return new Promise((resolve) => {
      setTimeout(async () => {
        const generatedImageUrl = `${COMFYUI_URL}/view/image/output.png`;
        updateStatus("✅ Image generated!");
        resolve(generatedImageUrl);
      }, 5000); // Wait before fetching
    });

  } catch (error) {
    console.error("❌ Error:", error);
    updateStatus("⚠️ Failed to generate image.");
    return null;
  }
}