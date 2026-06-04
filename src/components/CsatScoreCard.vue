<template>
  <div class="container pa-4 d-flex flex-row align-center justify-center">
    <v-icon size="50" color="red-lighten-1" :icon="mdiHeart" />
    <div class="d-flex flex-column ml-4">
      <span class="text-h4">{{ meanRating.toFixed(1) }}</span>
      <span class="text-body-1">CSAT</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { mean } from 'lodash';
import { mdiHeart } from '@mdi/js';

const props = defineProps<{
  ratings: number[];
}>();

const meanRating = computed<number>(() => (props.ratings.length > 0 ? mean(props.ratings) : 0));
</script>
