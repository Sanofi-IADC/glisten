<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet">
      Add feedback
    </v-btn>
    <feedback-list :feedbacks="feedbacks" @changeStatus="changeStatus" @setNotes="setNotes" />

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
import FeedbackList from './components/FeedbackList.vue';
import {
  GET_ALL_FEEDBACKS,
  SUBCRIPTION_FEEDBACKS,
  CREATE_WHISP,
  UPDATE_WHISP,
} from '@/graphql/queries/whispQueries';
import { IFeedback, FeedbackStatus } from './interfaces/feedback';
/**
 * App component entry default
 */
@Component({
  components: { FeedbackList, GlistenClient },
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
export default class App extends Vue {
  private feedbacks: IFeedback[] = [];
  public applicationID = 'GLISTEN';
  public data = {
    contextPortal: window.location.href,
    contextPage: '',
  };

  public sheet = false;

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

  private toggleFeedback(event: any) {
    this.sheet = false;
  }
}
</script>
