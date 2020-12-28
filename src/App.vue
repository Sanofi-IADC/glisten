<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet">
      Add feedback
    </v-btn>
    <glisten-dashboard />
    <glisten-client
      :sheet="sheet"
      :application-id="applicationID"
      :user-name="userName"
      :custom-tracker="customTracker"
      @close="toggleFeedback"
    />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import GlistenDashboard from './components/GlistenDashboard.vue';
import GlistenClient from './components/GlistenClient.vue';

/**
 * App component entry default
 */
@Component({
  components: { GlistenDashboard, GlistenClient },
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
