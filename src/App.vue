<template>
  <v-app>
    <v-btn color="green" dark @click="sheet = !sheet">
      Add feedback
    </v-btn>
    <v-row>
      <v-col cols="3"><nps-score-card :ratings="ratings"/></v-col>
      <v-col cols="9">
        <nps-bar-chart
          :timedRatings="timedRatings"
          timePeriod="hours"
          displayDateFormat="LL hh[:00]"
      /></v-col>
    </v-row>

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
import NpsScoreCard from './components/NpsScoreCard.vue';
import NpsBarChart, { TimedRating } from './components/NpsBarChart.vue';
import {
  GET_ALL_FEEDBACKS,
  SUBCRIPTION_FEEDBACKS,
  CREATE_WHISP,
  UPDATE_WHISP,
} from '@/graphql/queries/whispQueries';
import { IFeedback, FeedbackStatus } from './interfaces/feedback';
import _ from 'lodash';
import moment from 'moment';

/**
 * App component entry default
 */
@Component({
  components: { FeedbackList, GlistenClient, NpsScoreCard, NpsBarChart },
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
  private get ratings(): number[] {
    return this.feedbacks.map((x) => x.data.rating).filter((x) => x);
  }

  private get timedRatings(): TimedRating[] {
    return this.feedbacks.map((x) => ({ rating: x.data.rating, timestamp: x.timestamp }));
  }

  public applicationID = 'GLISTEN';
  public data = {
    contextPortal: window.location.href,
    contextPage: '',
  };

  public sheet = false;
  private feedbacks: IFeedback[] = [];

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
