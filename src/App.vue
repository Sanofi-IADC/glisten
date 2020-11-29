<template>
  <v-app>
    <glisten-client />
  </v-app>
</template>

<script lang="ts">
import GlistenClient from './components/GlistenClient.vue';

import Vue from 'vue';
import { Component } from 'vue-property-decorator';

/**
 * App component entry default
 */
@Component({
  components: {
    GlistenClient,
  },
})
export default class App extends Vue {}
</script>
