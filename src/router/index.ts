import { createRouter, createWebHistory } from 'vue-router';
import LandingView from '../views/LandingView.vue';
import InterestSelectorDemo from '../components/InterestSelectorDemo.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/demo/interest-selector',
      name: 'interest-selector-demo',
      component: InterestSelectorDemo,
    },
  ],
});

export default router;