<template>
  <v-container fluid>
    <span class="title py-3"
      >Thanks for using App X!!! How likely are you to recommend it to your colleagues?</span
    >

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
      v-model="glistenWhisp.data.feedback"
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
    <feedback-list :feedbacks="feedbacks" @changeStatus="changeStatus" @setNotes="setNotes" />
  </v-container>
</template>

<script lang='ts'>
import { WhispService } from '../services/whisp.service';
import { Component, Prop, Inject, Provide, Vue, Watch } from 'vue-property-decorator';
import { IFeedback, FeedbackStatus } from '@/interfaces/feedback';
import FeedbackList from './FeedbackList.vue';
import {
  GET_ALL_FEEDBACKS,
  SUBCRIPTION_FEEDBACKS,
  CREATE_WHISP,
  UPDATE_WHISP,
} from '@/graphql/queries/whispQueries';

@Component({
  components: { FeedbackList },
  apollo: {
    feedbacks: {
      query: GET_ALL_FEEDBACKS,
      subscribeToMore: {
        document: SUBCRIPTION_FEEDBACKS,
        updateQuery: (previous, { subscriptionData }) => {
          // If we added the whisp already don't do anything
          // This can be caused by an update after a mutation
          const existingFeedbackIndex = previous.feedbacks.findIndex(
            (feedback: IFeedback) => feedback._id === subscriptionData.data.feedbackAdded._id,
          );

          if (existingFeedbackIndex >= 0) {
            return {
              feedbacks: Object.assign([], previous.feedbacks, {
                [existingFeedbackIndex]: subscriptionData.data.feedbackAdded,
              }),
            };
          }

          return { feedbacks: [subscriptionData.data.feedbackAdded, ...previous.feedbacks] };
        },
      },
    },
  },
})
export default class GlistenClient extends Vue {
  @Provide() public user = 'thomas';
  @Provide() public surveyQuestion = '';
  private data!: any;
  private glistenWhisp = {
    type: 'USER_FEEDBACK',
    applicationID: 'GLISTEN',
    openedById: '',
    data: {
      status: FeedbackStatus.ACTION_NEEDED, // OPENED | CLOSED | NONE
      anonymous: false,
      feedback: '',
      name: 'thomas',
      rating: 0,
      commentSentimentScore: 0,
    },
  };

  private newWhisp: any = '';

  private feedbacks: IFeedback[] = [];

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
    this.newWhisp = this.$apollo.mutate({
      mutation: CREATE_WHISP,
      variables: { whisp: this.glistenWhisp },
    });
  }

  private async changeStatus({
    feedback,
    status,
  }: {
    feedback: IFeedback;
    status: FeedbackStatus;
  }): Promise<void> {
    this.$apollo.mutate({
      mutation: UPDATE_WHISP,
      variables: {
        id: feedback._id,
        whisp: {
          ...feedback,
          data: { ...feedback.data, status },
        },
      },
    });
  }

  private async setNotes({
    feedback,
    notes,
  }: {
    feedback: IFeedback;
    notes: string;
  }): Promise<void> {
    this.$apollo.mutate({
      mutation: UPDATE_WHISP,
      variables: {
        id: feedback._id,
        whisp: {
          ...feedback,
          data: { ...feedback.data, notes },
        },
      },
    });
  }
}
</script>
