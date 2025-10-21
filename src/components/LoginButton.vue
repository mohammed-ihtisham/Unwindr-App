<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const handleLogout = async () => {
  await authStore.logout();
};
</script>

<template>
  <div v-if="!isAuthenticated">
    <button
      @click="emit('click')"
      class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
    >
      Sign in
    </button>
  </div>
  <div v-else class="flex items-center gap-3">
    <span class="text-sm text-gray-600">
      {{ user?.username }}
      <span v-if="user?.canModerate" class="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
        Moderator
      </span>
    </span>
    <button
      @click="handleLogout"
      class="text-sm text-gray-700 hover:text-red-600 font-medium transition-colors"
    >
      Logout
    </button>
  </div>
</template>
