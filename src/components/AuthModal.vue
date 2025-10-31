<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();

// Form state
const mode = ref<'login' | 'register'>('login');
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const localError = ref('');

const isLoading = computed(() => authStore.isLoading);
const authError = computed(() => authStore.error);

// Form validation
const isFormValid = computed(() => {
  if (!username.value || !password.value) return false;
  if (mode.value === 'register') {
    return password.value === confirmPassword.value && password.value.length >= 6;
  }
  return true;
});

const handleSubmit = async () => {
  localError.value = '';
  authStore.clearError();

  if (!isFormValid.value) {
    localError.value = 'Please fill in all fields correctly';
    return;
  }

  let success = false;
  
  if (mode.value === 'login') {
    success = await authStore.login(username.value, password.value);
  } else {
    if (password.value !== confirmPassword.value) {
      localError.value = 'Passwords do not match';
      return;
    }
    success = await authStore.register(username.value, password.value);
  }

  if (success) {
    resetForm();
    emit('close');
  }
};

const resetForm = () => {
  username.value = '';
  password.value = '';
  confirmPassword.value = '';
  localError.value = '';
  authStore.clearError();
};

const switchMode = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  resetForm();
};

const handleClose = () => {
  resetForm();
  emit('close');
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal-backdrop fixed inset-0 z-[99997] flex items-center justify-center p-4 bg-black/50"
        @click.self="handleClose"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 pt-6 pb-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-earth-dark">
                {{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}
              </h2>
              <button
                @click="handleClose"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-sm text-earth-dark/70">
              {{ mode === 'login' 
                ? 'Sign in to access your personalized experience' 
                : 'Join Unwindr to discover hidden gems' 
              }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-4">
            <!-- Error Messages -->
            <div
              v-if="localError || authError"
              class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {{ localError || authError }}
            </div>

            <!-- Username Field -->
            <div>
              <label for="username" class="block text-sm font-medium text-earth-dark mb-1">
                Username
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 border border-earth-gray rounded-xl focus:ring-2 focus:ring-earth-dark focus:border-earth-dark transition-all disabled:bg-earth-cream disabled:cursor-not-allowed text-earth-dark placeholder-earth-dark/50 bg-white"
                placeholder="Enter your username"
              />
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-earth-dark mb-1">
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 border border-earth-gray rounded-xl focus:ring-2 focus:ring-earth-dark focus:border-earth-dark transition-all disabled:bg-earth-cream disabled:cursor-not-allowed text-earth-dark placeholder-earth-dark/50 bg-white"
                :placeholder="mode === 'register' ? 'At least 6 characters' : 'Enter your password'"
              />
            </div>

            <!-- Confirm Password Field (Register only) -->
            <div v-if="mode === 'register'">
              <label for="confirm-password" class="block text-sm font-medium text-earth-dark mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                type="password"
                required
                :disabled="isLoading"
                class="w-full px-4 py-3 border border-earth-gray rounded-xl focus:ring-2 focus:ring-earth-dark focus:border-earth-dark transition-all disabled:bg-earth-cream disabled:cursor-not-allowed text-earth-dark placeholder-earth-dark/50 bg-white"
                placeholder="Confirm your password"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="w-full py-3 px-4 bg-earth-dark hover:bg-earth-dark/90 disabled:bg-earth-dark/30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-[1.02] focus:ring-4 focus:ring-earth-dark/30"
            >
              <span v-if="!isLoading">
                {{ mode === 'login' ? 'Sign In' : 'Create Account' }}
              </span>
              <span v-else class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            </button>
          </form>

          <!-- Footer -->
          <div class="px-6 pb-6 text-center">
            <button
              @click="switchMode"
              :disabled="isLoading"
              class="text-sm text-earth-khaki hover:text-earth-khaki/80 font-medium disabled:text-earth-dark/40 disabled:cursor-not-allowed"
            >
              {{ mode === 'login' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in' 
              }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.25s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}

/* Ensure modal is above Leaflet maps and other components */
:global(.modal-backdrop) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 9999 !important;
}

/* Improve text visibility in input fields */
input[type="text"],
input[type="password"] {
  color: #111827 !important; /* text-gray-900 */
  background-color: #ffffff !important;
}

input[type="text"]::placeholder,
input[type="password"]::placeholder {
  color: #6b7280 !important; /* text-gray-500 */
  opacity: 1;
}

/* Ensure focus states are visible */
input[type="text"]:focus,
input[type="password"]:focus {
  color: #111827 !important;
  border-color: #3b82f6 !important; /* border-blue-500 */
}

/* Disabled state styling */
input[type="text"]:disabled,
input[type="password"]:disabled {
  color: #374151 !important; /* text-gray-700 */
  background-color: #f3f4f6 !important; /* bg-gray-100 */
}
</style>

