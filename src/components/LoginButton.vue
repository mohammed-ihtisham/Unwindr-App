<script setup lang="ts">
import { computed } from 'vue';
import { LogOut } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const userInitial = computed(() => {
  const name = user.value?.username || '';
  return name ? name.charAt(0).toUpperCase() : 'U';
});

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
      class="px-4 py-2 rounded-full border border-earth-gray text-earth-dark hover:bg-earth-cream font-medium transition-colors shadow-sm"
    >
      Sign in
    </button>
  </div>
  <div v-else class="flex items-center gap-3">
    <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-earth-cream border border-earth-gray shadow-sm">
      <div class="w-7 h-7 rounded-full bg-earth-dark text-white flex items-center justify-center text-xs font-semibold">
        {{ userInitial }}
      </div>
      <span class="text-sm text-earth-dark font-medium">{{ user?.username }}</span>
      <span
        v-if="user?.canModerate"
        class="text-[10px] uppercase tracking-wide bg-earth-khaki/15 text-earth-khaki border border-earth-khaki/30 px-2 py-0.5 rounded-full"
      >
        Moderator
      </span>
    </div>
    <button
      @click="handleLogout"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-earth-gray text-earth-dark hover:bg-earth-cream transition-colors shadow-sm"
      aria-label="Logout"
    >
      <LogOut :size="16" />
      <span class="text-sm font-medium">Logout</span>
    </button>
  </div>
</template>
