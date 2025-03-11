<template>
  <div class="chat-bot">
    <div class="output">
      <p>{{ outputText }}</p>
    </div>
    <input v-model="inputText" type="text" placeholder="Type your message here..." />
    <button @click="sendMessage">Send</button>
    <button @click="toggleRecording">{{ isRecording ? 'Stop Recording' : 'Start Recording' }}</button>
    <button v-if="audioUrl" @click="playRecording">Play Recording</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      outputText: '',
      inputText: '',
      isRecording: false,
      mediaRecorder: null,
      audioChunks: [],
      audioUrl: null
    };
  },
  methods: {
    async sendMessage() {
      // Placeholder for sending text to API
      // const response = await fetch('API_ENDPOINT', { method: 'POST', body: JSON.stringify({ message: this.inputText }) });
      // const data = await response.json();
      // this.outputText = data.reply;
      this.outputText = this.inputText; // Temporary echo for demonstration
      this.inputText = '';
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
    }
  },
  mounted() {
    const storedAudioUrl = localStorage.getItem('recordedAudio');
    if (storedAudioUrl) {
      this.audioUrl = storedAudioUrl;
    }
  }
};
</script>

<style scoped>
.chat-bot {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.output {
  width: 100%;
  height: 200px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  padding: 10px;
  overflow-y: auto;
}
input {
  width: 80%;
  padding: 10px;
  margin-bottom: 10px;
}
button {
  padding: 10px 20px;
  margin: 5px;
}
</style>