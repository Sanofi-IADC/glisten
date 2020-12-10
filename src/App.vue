<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet">
      Add feedback
    </v-btn>
    <dashboard/>
    <glisten-client
      :sheet="sheet"
      :applicationID="applicationID"
      :data="data"
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
  public data = {
    contextPortal: window.location.href,
    contextPage: '',
  };

  public sheet = false;

  private toggleFeedback(event: any) {
    this.sheet = false;
  }
}
</script>
