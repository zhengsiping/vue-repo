<template>
    <div class="chat-container">
        <h2>雁荡山聊天助手</h2>
        <h3>请问关于雁荡山的问题</h3>
      <div class="output">
        <p>{{ outputText }}</p>
      </div>
      <input v-model="inputText" type="text" placeholder="输入问题..." />
      <button @click="sendMessage" :disabled="isSending">
        {{ isSending ? '发送中...' : '发送' }}
      </button>
      <button @click="switchToAudioChat">跳转至语音助手</button>
    </div>
  </template>
  
  <script>
  const API_BASE_URL = "https://0.0.0.0:8000";
  
  export default {
    data() {
      return {
        outputText: '',
        inputText: '',
        isSending: false // ✅ Track sending state
      };
    },
    methods: {
      async sendMessage() {
        if (!this.inputText.trim()) return; // Prevent empty messages
        this.isSending = true; // ✅ Disable button while sending
  
        const requestBody = { user_query: this.inputText };
  
        try {
          const response = await fetch(`${API_BASE_URL}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          const data = await response.json();
          this.outputText = data.response;
        } catch (error) {
          console.error('Error sending message:', error);
        } finally {
          this.isSending = false; // ✅ Re-enable button after response
        }
      },
      switchToAudioChat() {
        window.location.href = '/chat-audio'; // ✅ Refresh page when switching
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
  .output {
    min-height: 100px;
    border: 1px solid #ccc;
    margin-bottom: 10px;
    padding: 10px;
    overflow-y: auto;
  }
  input, button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  </style>