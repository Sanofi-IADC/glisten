<template>
  <div class="container pa-4 d-flex flex-row align-center justify-center">
    <v-icon size="50" color="red lighten-1">
      mdi-heart
    </v-icon>
    <div class="d-flex flex-column ml-4">
      <span class="display-1">{{ meanRating.toFixed(1) }}</span>
      <span class="body-1">CSAT</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mean } from 'lodash';

@Component
export default class CsatScoreCard extends Vue {
  @Prop({ required: true }) public ratings!: number[];

  private get isEmpty(): boolean {
    return !this.ratings;
  }

  private get meanRating(): number {
    return mean(this.ratings);
  }
}
</script>
