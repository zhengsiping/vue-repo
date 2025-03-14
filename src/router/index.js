import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import ChatBot from '../components/chatbot/ChatBot.vue';

const routes = [
  {
    path: '/',
    name: 'ChatBot',
    component: ChatBot
  },
  // {
  //   path: '/chat-bot',
  //   name: 'ChatBot',
  //   component: ChatBot
  // }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;