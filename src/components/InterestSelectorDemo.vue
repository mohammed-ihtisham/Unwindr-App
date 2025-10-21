<script setup lang="ts">
import { ref } from 'vue';
import InterestSelector from './InterestSelector.vue';
import { INTERESTS } from '../lib/interests';

const selectedTags = ref<string[]>([]);
const availableTags = INTERESTS;
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Interest Selector Demo</h1>
          <p class="text-gray-600">Try the modern interest selection component with AI-powered tag generation</p>
        </div>

        <div class="space-y-8">
          <!-- Component Demo -->
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-8">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Interest Selector Component</h2>
            <div class="flex items-center gap-4">
              <InterestSelector
                v-model:selected-tags="selectedTags"
                :available-tags="availableTags"
              />
            </div>
          </div>

          <!-- Selected Tags Display -->
          <div v-if="selectedTags.length > 0" class="bg-blue-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-3">Selected Tags</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Usage Instructions -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">How to Use</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start gap-3">
                <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <p>Click the "Interests" button to open the modal</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <p>Type a description of the vibe you're looking for (e.g., "cozy coffee shops with great wifi")</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <p>Click "Generate Tags" to let AI create relevant tags, or switch to manual mode</p>
              </div>
              <div class="flex items-start gap-3">
                <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <p>Add, remove, or modify tags as needed and click "Apply Tags"</p>
              </div>
            </div>
          </div>

          <!-- Features -->
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">✨ AI-Powered Generation</h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li>• Describe your ideal vibe in natural language</li>
                <li>• AI generates relevant tags automatically</li>
                <li>• Smart tag suggestions based on context</li>
              </ul>
            </div>
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">🎯 Manual Control</h3>
              <ul class="space-y-2 text-sm text-gray-600">
                <li>• Add custom tags manually</li>
                <li>• Remove unwanted tags easily</li>
                <li>• Full control over your selections</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
