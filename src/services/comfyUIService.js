import axios from "axios";

const COMFYUI_URL = "http://127.0.0.1:8000"; // Change this if needed

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
        "prompt": {
        "1": {
          "inputs": {
            "image": uploadedImageName,  // Use the uploaded image name
            "upload": "image"
          },
          "class_type": "LoadImage",
          "_meta": { "title": "Load Image" }
        },
        "4": {
          "inputs": {
            "filename_prefix": "ComfyUI",
            "images": ["5", 0]
          },
          "class_type": "SaveImage",
          "_meta": { "title": "Save Image" }
        },
        "5": {
          "inputs": {
            "upscale_method": "nearest-exact",
            "width": 512,
            "height": 512,
            "crop": "disabled",
            "image": ["1", 0]
          },
          "class_type": "ImageScale",
          "_meta": { "title": "Upscale Image" }
        }}
      };
    

    const workflowResponse = await axios.post(`${COMFYUI_URL}/prompt`, workflowData, {
      headers: { "Content-Type": "application/json" }
    });

    const promptId = workflowResponse.data.prompt_id;
    updateStatus(`🎉 Workflow submitted! Prompt ID: ${promptId}`);

    // 5️⃣ Poll the queue to check status
    return await pollForResult(promptId, updateStatus);

  } catch (error) {
    console.error("❌ Error:", error);
    updateStatus("⚠️ Failed to generate image.");
    updateStatus(error);
    return null;
  }
}

// 6️⃣ Function to Poll for Generated Image
async function pollForResult(promptId, updateStatus) {
    updateStatus("⏳ Waiting for image generation...");
    let attempts = 0;
  
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const historyResponse = await axios.get(`${COMFYUI_URL}/history`);
          const historyData = historyResponse.data;
  
          if (historyData[promptId]) {
            const result = historyData[promptId];
  
            // Check if processing is complete
            if (result.status.completed) {
              clearInterval(interval);
              updateStatus("✅ Image generation complete!");
  
              // Extract the generated image filename
              const imageData = result.outputs["4"].images[0]; // Node "4" saves the image
              const generatedImageUrl = `${COMFYUI_URL}/view?filename=${imageData.filename}`;
  
              resolve(generatedImageUrl);
            }
          } else if (attempts > 20) { // Timeout after 20 attempts (~20 seconds)
            clearInterval(interval);
            updateStatus("⚠️ Image generation took too long.");
            reject(null);
          }
        } catch (error) {
          console.error("❌ Error fetching history status:", error);
        }
  
        attempts++;
      }, 1000); // Poll every 1 second
    });
  }