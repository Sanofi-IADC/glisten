<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet"> Add feedback </v-btn>
    <glisten-dashboard />
    <glisten-client
      :sheet="sheet"
      :application-id="applicationID"
      :user-name="userName"
      :custom-tracker="customTracker"
      text-field-label="Speak your mind"
      greetings="We're always looking to improve. Please share your feedback with us!"
      heart-color="#7A00E6"
      @close="toggleFeedback"
    />
    <glisten-csat :filtered-applications="['iadc-portal']" />
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GlistenDashboard from './components/GlistenDashboard.vue';
import GlistenClient from './components/GlistenClient.vue';
import GlistenCsat from '@/components/GlistenCsat.vue';

const applicationID = 'GLISTEN';
const userName = 'User';

const customTracker = {
  contextPortal: window.location.href,
  contextPage: '',
  categories: [
    'Usability',
    'Design',
    'Content',
    'Performance',
    'Customer service',
    'Security',
    'Accessibility',
  ],
};

const sheet = ref(false);

function toggleFeedback() {
  sheet.value = false;
}
</script>
