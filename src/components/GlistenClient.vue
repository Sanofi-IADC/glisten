<template>
  <v-container fluid>
    <v-text
      class="title py-3"
    >Thanks for using App X!!! How likely are you to recommend it to your colleagues?</v-text>

    <v-rating
      v-model="glistenWhisp.data.rating"
      color="red"
      background-color="grey darken-1"
      half-increments
      hover
      x-large
      empty-icon="mdi-heart-outline"
      full-icon="mdi-heart"
      half-icon="mdi-heart-half-full"
    ></v-rating>
    <v-textarea
      v-model="glistenWhisp.data.comment"
      outlined
      name="input-7-4"
      label="Leave us a comment"
      auto-grow
      rows="2"
    ></v-textarea>

    <v-switch
      v-model="glistenWhisp.data.anonymous"
      class="my-0 py-0 px-1"
      label="Make my feedback anonymous"
    ></v-switch>

    <v-btn color="primary" @click="submitFeedback">Submit feedback</v-btn>
  </v-container>
</template>

<script lang='ts'>
import { WhispService } from '../services/whisp.service';
import { Component, Prop, Inject, Provide, Vue, Watch } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class GlistenClient extends Vue {
  @Provide() public user = 'user not set';
  @Provide() public surveyQuestion = '';
  private data!: any;
  private glistenWhisp = {
    type: 'USER_FEEDBACK',
    applicationID: 'GLISTEN',
    openedById: '',
    data: {
      anonymous: false,
      comment: '',
      rating: 0,
      commentSentimentScore: 0,
    },
  };

  private newWhisp: any = '';

  constructor() {
    super();
    this.data = [];
  }

  @Watch('glistenWhisp.data.anonymous', { immediate: true })
  private onAnonymousChanged(val: boolean, oldVal: boolean) {
    this.glistenWhisp.openedById = val ? '' : this.user;
  }

  private async submitFeedback() {
    // this.sentimentScore = calculateSentiment(this.comment);
    this.newWhisp = await WhispService.createWhisp(this.glistenWhisp);
  }
}
</script>
