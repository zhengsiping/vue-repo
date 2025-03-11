<template>
  <div class="camera-container">
    <!-- Video Stream -->
    <video ref="video" autoplay class="video-feed"></video>

    <!-- Canvas for Capturing Image -->
    <canvas ref="canvas" style="display: none;"></canvas>

    <!-- Buttons -->
    <div class="controls">
      <button @click="startCamera">打开相机a</button>
      <button @click="captureImage" :disabled="!cameraActive">拍照</button>
    </div>

    <!-- Display Captured & Generated Images in the Same Row -->
    <div class="image-container" v-if="imageSrc || generatedImage">
      <!-- Captured Image -->
      <div class="image-box" v-if="imageSrc">
        <h3>获取的照片</h3>
        <img :src="imageSrc" class="captured-image" />
        <button @click="handleGenerateImage" class="generate-button">生成图片</button>
      </div>

      <!-- Generated Image -->
      <div class="image-box" v-if="generatedImage">
        <h3>生成的图片</h3>
        <img :src="generatedImage" class="generated-image" />
      </div>
    </div>

    <!-- Status Message -->
    <p v-if="status">{{ status }}</p>
  </div>
</template>

<script>
import { generateImage } from "@/services/comfyuiService";

export default {
  data() {
    return {
      cameraActive: false,
      imageSrc: null,
      generatedImage: null,
      status: "",
    };
  },
  methods: {
    async startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = stream;
        this.cameraActive = true;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    },
    captureImage() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const context = canvas.getContext("2d");

      // Set canvas size to match video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame onto the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image URL
      this.imageSrc = canvas.toDataURL("image/png");

      // ✅ Clear the generated image & status message when taking a new picture
      this.generatedImage = null;
      this.status = "";
    },
    async handleGenerateImage() {
      this.generatedImage = null; // Reset previous generated image
      this.generatedImage = await generateImage(this.imageSrc, (msg) => (this.status = msg));
    }
  }
};
</script>

<style>
.camera-container {
  text-align: center;
}
.video-feed {
  width: 100%;
  max-width: 400px;
  border: 2px solid black;
}
.controls {
  margin-top: 10px;
}
button {
  margin: 5px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

/* Layout for images: captured & generated in the same row */
.image-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

/* Individual image boxes */
.image-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 250px;
}

/* Captured & Generated Images */
.captured-image, .generated-image {
  width: 100%;
  max-width: 250px;
  border: 2px solid #333;
  border-radius: 8px;
  margin-top: 10px;
}

/* Style for the Generate button */
.generate-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px;
  margin-top: 10px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
}
.generate-button:hover {
  background-color: #218838;
}
</style>