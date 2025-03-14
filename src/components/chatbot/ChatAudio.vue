<template>
    <div class="chat-container">
      <h2>雁荡山语音助手</h2>
      <h3>请问关于雁荡山的问题</h3>
      <button 
        @click="handleRecording"
        :style="{ backgroundColor: isRecording ? 'red' : '', cursor: isSending ? 'not-allowed' : 'pointer' }"
        :disabled="isSending"
      >
        {{ buttonText }}
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <button @click="switchToTextChat">跳转至聊天助手</button>
    </div>
  </template>
  
  <script>
  const API_BASE_URL = "https://0.0.0.0:8000";
  
  export default {
    data() {
      return {
        isRecording: false,
        isSending: false,
        mediaRecorder: null,
        audioChunks: [],
        buttonText: "录音",
        errorMessage: "",
        startTime: null,
        playingAudio: null,
      };
    },
    methods: {
      async handleRecording() {
        if (!this.isRecording) {
          if (this.playingAudio) {
            this.playingAudio.pause();
            this.playingAudio.currentTime = 0;
            this.playingAudio = null;
          }
  
          this.audioChunks = [];
          this.errorMessage = "";
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.mediaRecorder = new MediaRecorder(stream);
  
          this.mediaRecorder.ondataavailable = event => {
            this.audioChunks.push(event.data);
          };
  
          this.mediaRecorder.onstop = async () => {
            const endTime = Date.now();
            const duration = (endTime - this.startTime) / 1000;
  
            if (duration < 1) {
              this.errorMessage = "录音太短";
              this.buttonText = "录音";
              return;
            }
  
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.isSending = true;
            this.buttonText = "发送录音中...";
            await this.sendAudio(audioBlob);
          };
  
          this.startTime = Date.now();
          this.mediaRecorder.start();
          this.isRecording = true;
          this.buttonText = "录音中, 点击停止";
        } else {
          this.mediaRecorder.stop();
          this.isRecording = false;
        }
      },
  
      async sendAudio(audioBlob) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'your_audio.wav');
  
        try {
          const response = await fetch(`${API_BASE_URL}/api/upload-wav`, {
            method: 'POST',
            body: formData
          });
          const receivedBlob = await response.blob();
          const receivedAudioUrl = URL.createObjectURL(receivedBlob);
          localStorage.setItem('receivedAudio', receivedAudioUrl);
  
          this.playingAudio = new Audio(receivedAudioUrl);
          this.playingAudio.play();
        } catch (error) {
          console.error('Error uploading audio:', error);
        } finally {
          this.isSending = false;
          this.buttonText = "录音";
        }
      },
  
      switchToTextChat() {
        window.location.href = '/chat-text';  // ✅ Refresh page when switching
      }
    }
  };
  </script>
  
  <style scoped>
  .chat-container {
    text-align: center;
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ccc;
    background-color: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s, opacity 0.3s;
  }
  button:disabled {
    opacity: 0.6;
  }
  .error {
    color: red;
    font-size: 14px;
    margin-top: 5px;
  }
  </style>