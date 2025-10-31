<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    @click="toggle"
      :class="[
        'relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-earth-dark focus:ring-offset-2',
        modelValue ? 'bg-earth-dark' : 'bg-earth-gray',
      ]"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label || 'Toggle'"
  >
    <span
      :class="[
        'inline-block w-4 h-4 transform transition-transform bg-white rounded-full',
        modelValue ? 'translate-x-6' : 'translate-x-1',
      ]"
    />
  </button>
</template>

