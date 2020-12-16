<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet">
      Add feedback
    </v-btn>
    <dashboard />
    <glisten-client
      :sheet="sheet"
      :applicationID="applicationID"
      :userName="userName"
      :customTracker="customTracker"
      @close="toggleFeedback"
    />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import Dashboard from './components/Dashboard.vue';
import GlistenClient from './components/GlistenClient.vue';

/**
 * App component entry default
 */
@Component({
  components: { Dashboard, GlistenClient },
})
export default class App extends Vue {
  public applicationID = 'GLISTEN';
  public userName = 'User';

  public customTracker = {
    contextPortal: window.location.href,
    contextPage: '',
    // categories: [
    //   { text: 'Idea/Improvement', value: 'idea_improvement' },
    //   { text: 'Event/Todo/Info/Handover', value: 'event' },
    //   { text: 'General usage/performance', value: 'performance' },
    //   { text: 'Device issue', value: 'device_issue' },
    //   { text: 'Other', value: 'other' },
    // ],
  };

  public sheet = false;

  private toggleFeedback(event: any) {
    this.sheet = false;
  }
}
</script>
