import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ChatBot from '../components/chatbot/ChatBot.vue';
import ChatText from '../components/chatbot/ChatText.vue';
import ChatAudio from '../components/chatbot/ChatAudio.vue';

// const routes = [
//   // {
//   //   path: '/',
//   //   name: 'ChatBot',
//   //   component: ChatBot
//   // },
//   // {
//   //   path: '/chat-bot',
//   //   name: 'ChatBot',
//   //   component: ChatBot
//   // }
// ];


const routes = [
  { path: '/', redirect: '/chat-text' },
  { path: '/chat-text', component: ChatText },
  { path: '/chat-audio', component: ChatAudio }
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;