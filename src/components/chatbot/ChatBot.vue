<template>
  <div class="chat-bot-container">
    <div class="chat-bot">
      <div class="output">
        <p>{{ outputText }}</p>
      </div>
      <input v-model="inputText" type="text" placeholder="Type your message here..." />
      <button @click="sendMessage">Send</button>
      <button @click="toggleRecording">{{ isRecording ? 'Stop Recording' : 'Start Recording' }}</button>
      <button v-if="audioUrl" @click="playRecording">Play Recording</button>
      <button v-if="audioUrl" :disabled="isSending" @click="sendAudio">{{ isSending ? 'Sending...' : 'Send Audio' }}</button>
      <button v-if="receivedAudioUrl && !isSending" @click="playReceivedAudio">Play Received Audio</button>
    </div>
  </div>
</template>

<script>
// const API_BASE_URL = "https://47.97.117.147";
const API_BASE_URL = "https://0.0.0.0:8000";

export default {
  data() {
    return {
      outputText: '',
      inputText: '',
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      audioUrl: null,
      isSending: false,
      receivedAudioUrl: null
    };
  },
  methods: {
    async sendMessage() {
      const userQuery = this.inputText;
      const requestBody = {
        user_query: userQuery
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        this.outputText = data.response;
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    async toggleRecording() {
      if (this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
      } else {
        this.audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(audioBlob);
          localStorage.setItem('recordedAudio', this.audioUrl);
        };
        this.mediaRecorder.start();
        this.isRecording = true;
      }
    },
    playRecording() {
      const audio = new Audio(this.audioUrl);
      audio.play();
    },
    async sendAudio() {
      this.isSending = true;
      const audioBlob = await fetch(this.audioUrl).then(res => res.blob());
      const formData = new FormData();
      formData.append('file', audioBlob, 'your_audio.wav');

      try {
        const response = await fetch(`${API_BASE_URL}/api/upload-wav`, {
          method: 'POST',
          body: formData
        });
        const receivedBlob = await response.blob();
        this.receivedAudioUrl = URL.createObjectURL(receivedBlob);
        localStorage.setItem('receivedAudio', this.receivedAudioUrl);
        console.log('Received the audio file');
      } catch (error) {
        console.error('Error uploading audio:', error);
      } finally {
        this.isSending = false;
      }
    },
    playReceivedAudio() {
      const storedReceivedAudioUrl = localStorage.getItem('receivedAudio');
      if (storedReceivedAudioUrl) {
        const audio = new Audio(storedReceivedAudioUrl);
        audio.play();
      }
    }
  },
  mounted() {
    const storedAudioUrl = localStorage.getItem('recordedAudio');
    if (storedAudioUrl) {
      this.audioUrl = storedAudioUrl;
    }
    const storedReceivedAudioUrl = localStorage.getItem('receivedAudio');
    if (storedReceivedAudioUrl) {
      this.receivedAudioUrl = storedReceivedAudioUrl;
    }
  }
};
</script>

<style scoped>
.chat-bot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.chat-bot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  border: 1px solid #ccc;
  padding: 20px;
  box-sizing: border-box;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.output {
  width: 100%;
  height: 200px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  padding: 10px;
  overflow-y: auto;
  box-sizing: border-box;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

button {
  padding: 10px 20px;
  margin: 5px;
  width: 100%;
  max-width: 200px;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .chat-bot {
    padding: 10px;
  }

  button {
    max-width: 100%;
  }
}
</style>