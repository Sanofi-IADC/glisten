<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet">
      Add feedback
    </v-btn>
    <glisten-client
      :sheet="sheet"
      :applicationID="applicationID"
      :data="data"
      @close="toggleFeedback"
    />
  </v-app>
</template>

<script lang="ts">
import GlistenClient from './components/GlistenClient.vue';

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { WhispService } from './services/whisp.service';

/**
 * App component entry default
 */
@Component({
  components: {
    GlistenClient,
  },
})
export default class App extends Vue {
  public applicationID = 'GLISTEN';
  public data = {
    contextPortal: window.location.href,
    contextPage: '',
  };

  public sheet = false;

  constructor() {
    super();
    WhispService.httpURL = process.env.VUE_APP_WHISPR_API_HTTP_URL
      ? process.env.VUE_APP_WHISPR_API_HTTP_URL
      : '';
    WhispService.wsURL = process.env.VUE_APP_WHISPR_API_WS_URL
      ? process.env.VUE_APP_WHISPR_API_WS_URL
      : '';
  }

  private toggleFeedback(event: any) {
    this.sheet = false;
  }
}
</script>
