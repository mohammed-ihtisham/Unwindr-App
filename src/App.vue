<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

// Initialize auth on app mount
onMounted(() => {
  authStore.initialize();
});
</script>

<template>
  <RouterView />
</template>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
</style>
