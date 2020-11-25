<template>
  <v-app>
    <glisten-client />
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
  constructor() {
    super();
    WhispService.httpURL = process.env.VUE_APP_WHISPR_API_HTTP_URL
      ? process.env.VUE_APP_WHISPR_API_HTTP_URL
      : '';
    WhispService.wsURL = process.env.VUE_APP_WHISPR_API_WS_URL
      ? process.env.VUE_APP_WHISPR_API_WS_URL
      : '';
  }
}
</script>
