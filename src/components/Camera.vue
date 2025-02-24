<template>
  <div class="camera-container">
    <!-- Video Stream -->
    <video ref="video" autoplay class="video-feed"></video>

    <!-- Canvas for Capturing Image -->
    <canvas ref="canvas" style="display: none;"></canvas>

    <!-- Buttons -->
    <div class="controls">
      <button @click="startCamera">Start Camera</button>
      <button @click="captureImage" :disabled="!cameraActive">Take Picture</button>
    </div>

    <!-- Display Captured Image -->
    <div v-if="imageSrc">
      <h3>Captured Image:</h3>
      <img :src="imageSrc" class="captured-image" />

      <!-- Only show the "Generate" button if an image has been captured -->
      <button @click="handleGenerateImage" class="generate-button">Generate</button>
    </div>

    <!-- Display Generated Image -->
    <div v-if="generatedImage">
      <h3>Generated Image:</h3>
      <img :src="generatedImage" class="generated-image" />
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
      imageSrc: null, // ✅ This ensures the "Generate" button is hidden until an image is taken
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
      this.imageSrc = canvas.toDataURL("image/png"); // ✅ Triggers "Generate" button visibility
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
.captured-image, .generated-image {
  margin-top: 10px;
  width: 100%;
  max-width: 400px;
  border: 2px solid #333;
}
.generate-button {
  background-color: #28a745;
  color: white;
  border: none;
}
</style>