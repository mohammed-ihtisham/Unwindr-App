<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch, nextTick } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: number | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const showDropdown = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const menuStyles = ref<Record<string, string>>({ top: '0px', left: '0px', minWidth: '160px', transform: 'translateX(-50%)' });

const distanceOptions = [
  { label: 'Any distance', value: null },
  { label: 'Up to 1 mi', value: 1 },
  { label: 'Up to 2 mi', value: 2 },
  { label: 'Up to 4 mi', value: 4 },
  { label: 'Up to 8 mi', value: 8 },
  { label: 'Up to 16 mi', value: 16 },
];

const selectedOption = computed(() => {
  return distanceOptions.find(option => option.value === props.modelValue) || distanceOptions[0];
});

const isActive = computed(() => props.modelValue !== null);

function selectOption(option: { label: string; value: number | null }) {
  emit('update:modelValue', option.value);
  showDropdown.value = false;
}

function positionMenu() {
  const el = triggerRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const top = rect.bottom + 6; // small gap
  const leftCenter = rect.left + rect.width / 2;
  const minWidth = Math.max(rect.width, 200);
  menuStyles.value = {
    top: `${top}px`,
    left: `${leftCenter}px`,
    minWidth: `${minWidth}px`,
    transform: 'translateX(-50%)',
  };
}

function handleWindowEvents() {
  if (!showDropdown.value) return;
  positionMenu();
}

function handleDocumentClick(e: MouseEvent) {
  const target = e.target as Node;
  if (triggerRef.value?.contains(target)) return;
  if (menuRef.value?.contains(target)) return;
  showDropdown.value = false;
}

watch(showDropdown, async (open) => {
  if (open) {
    await nextTick();
    positionMenu();
    window.addEventListener('scroll', handleWindowEvents, true);
    window.addEventListener('resize', handleWindowEvents, true);
    document.addEventListener('click', handleDocumentClick, true);
  } else {
    window.removeEventListener('scroll', handleWindowEvents, true);
    window.removeEventListener('resize', handleWindowEvents, true);
    document.removeEventListener('click', handleDocumentClick, true);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowEvents, true);
  window.removeEventListener('resize', handleWindowEvents, true);
  document.removeEventListener('click', handleDocumentClick, true);
});
</script>

<template>
  <div class="relative z-[60]">
    <button
      ref="triggerRef"
      @click="showDropdown = !showDropdown"
      :class="[
        'relative flex items-center justify-center px-4 pr-9 py-2.5 rounded-2xl hover:ring-brand-300 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-all duration-200 min-w-[140px] shadow-sm ring-1',
        isActive ? 'bg-brand-50 ring-brand-300' : 'bg-white/60 ring-earth-gray/40'
      ]"
    >
      <span class="text-earth-dark font-medium">{{ selectedOption.label }}</span>
      <ChevronDown :size="16" class="text-earth-dark/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </button>

    <Teleport to="body">
      <div
        v-if="showDropdown"
        ref="menuRef"
        class="fixed bg-white ring-1 ring-earth-gray/40 rounded-2xl shadow-lg z-[1000] overflow-hidden"
        :style="menuStyles"
      >
        <button
          v-for="option in distanceOptions"
          :key="`dist-${option.value}`"
          @click="selectOption(option)"
          :class="[
            'block w-full text-left px-4 py-3 hover:bg-earth-cream transition-colors text-sm',
            option.value === modelValue ? 'bg-earth-dark/10 text-earth-dark font-medium' : 'text-earth-dark',
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
