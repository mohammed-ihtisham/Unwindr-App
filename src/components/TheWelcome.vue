<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
</script>

<template>
  <div class="welcome">
    <h1>Welcome to Unwindr App</h1>
    <p>
      You've successfully created a Vue.js application with TypeScript, Vue Router, and Pinia state management.
    </p>

    <WelcomeItem>
      <template #icon>
        <span class="icon">📚</span>
      </template>
      <template #heading>Documentation</template>
      Check out the
      <a href="https://vuejs.org/" target="_blank" rel="noopener">official Vue.js documentation</a>
      to learn more about building Vue applications.
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <span class="icon">🛠️</span>
      </template>
      <template #heading>Tooling</template>
      This project includes Vite for fast development, Vue Router for navigation, and Pinia for state management.
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <span class="icon">🚀</span>
      </template>
      <template #heading>Get Started</template>
      Run <code>npm install</code> to install dependencies, then <code>npm run dev</code> to start the development server.
    </WelcomeItem>
  </div>
</template>

<style scoped>
.welcome {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-heading);
}

p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}

code {
  background-color: var(--color-background-soft);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.icon {
  font-size: 2rem;
}
</style>

