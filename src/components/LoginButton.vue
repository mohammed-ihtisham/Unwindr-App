<script setup lang="ts">
const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    @click="emit('click')"
    class="text-gray-700 hover:text-blue-600 font-medium transition-colors"
  >
    Sign in
  </button>
</template>

