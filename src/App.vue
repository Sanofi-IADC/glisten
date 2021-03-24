<template>
  <v-app>
    <v-btn
      color="green"
      dark
      @click="sheet = !sheet"
    >
      Add feedback
    </v-btn>
    <dashboard />
    <glisten-client
      :sheet="sheet"
      :application-id="applicationID"
      :user-name="userName"
      :custom-tracker="customTracker"
      @close="toggleFeedback"
    />
    <glisten-csat :filtered-applications="['iadc-portal']" />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import Dashboard from './components/GlistenDashboard.vue';
import GlistenClient from './components/GlistenClient.vue';
import GlistenCsat from '@/components/GlistenCsat.vue';

/**
 * App component entry default
 */
@Component({
  components: { Dashboard, GlistenClient, GlistenCsat },
})
export default class App extends Vue {
  public applicationID = 'GLISTEN';
  public userName = 'User';

  public customTracker = {
    contextPortal: window.location.href,
    contextPage: '',
  };

  public sheet = false;

  private toggleFeedback(event: any) {
    this.sheet = false;
  }
}
</script>
