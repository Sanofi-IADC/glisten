<template>
  <v-app>
    <v-row>
      <v-col cols="3">
        <filters :startDate.sync="startDate" :endDate.sync="endDate"/>
        <nps-score-gauge :ratings="ratings"/></v-col>
      <v-col cols="9">
        <nps-bar-chart :timedRatings="timedRatings" timePeriod="days" displayDateFormat="LL"
      /></v-col>
    </v-row>

    <feedback-list
      :feedbacks="feedbacks"
      :loading="loading"
      @changeStatus="changeStatus"
      @setNotes="setNotes"
    />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import FeedbackList from '@/components/FeedbackList.vue';
import Filters from '@/components/Filters.vue';
import NpsScoreGauge from '@/components/NpsScoreGauge.vue';
import NpsBarChart, { TimedRating } from '@/components/NpsBarChart.vue';
import {
  GET_ALL_FEEDBACKS,
  SUBCRIPTION_FEEDBACKS,
  CREATE_WHISP,
  UPDATE_WHISP,
  SubcriptionsFeedbackResult,
} from '@/graphql/queries/whispQueries';
import { IFeedback, FeedbackStatus } from '@/interfaces/feedback';
import _ from 'lodash';
import moment from 'moment';
import { DataOptions } from 'vuetify';
import { SmartQuery, SubscribeToMore } from 'vue-apollo-decorators';

/**
 * Dashboard component entry default
 */
@Component({
  components: { FeedbackList, NpsScoreGauge, NpsBarChart, Filters },
})
export default class Dashboard extends Vue {
  private get ratings(): number[] {
    return this.feedbacks.map((x) => x.data.rating).filter((x) => x);
  }

  private get timedRatings(): TimedRating[] {
    return this.feedbacks.map((x) => ({ rating: x.data.rating, timestamp: x.timestamp }));
  }

  public startDate: Date = new Date('2020/11/01');
  public endDate: Date = new Date('2020/12/01');

  private get loading(): boolean {
    return this.$apollo.loading;
  }

  @SmartQuery<Dashboard>({
    query: GET_ALL_FEEDBACKS,
    variables() {
      return {
        filter: {
          type: 'GLISTEN',
          timestamp: {
            $gte: this.startDate,
            $lte: this.endDate,
          },
        },
        limit: 1000,
        sort: {},
      };
    },
  })
  @SubscribeToMore<Dashboard>({
    document: SUBCRIPTION_FEEDBACKS,
    variables() {
      return {
        filter: {
          type: 'GLISTEN',
        },
      };
    },
    updateQuery(previous, options) {
      return this.updateFeedbacksOnSubscriptionEvent(previous, options);
    },
  })
  private feedbacks: IFeedback[] = [];

  public updateFeedbacksOnSubscriptionEvent(
    previous: { feedbacks: IFeedback[] },
    update: { subscriptionData: { data: SubcriptionsFeedbackResult } },
  ): { feedbacks: IFeedback[] } {
    const feedback = update.subscriptionData.data.feedbackAdded;

    const existingFeedbackIndex = previous.feedbacks.findIndex(
      (f: IFeedback) => feedback._id === f._id,
    );

    // If the whisp is already in the collection we update it
    // Else we add it to the top
    if (existingFeedbackIndex >= 0) {
      return {
        feedbacks: Object.assign([], previous.feedbacks, {
          [existingFeedbackIndex]: feedback,
        }),
      };
    }

    if (feedback.timestamp >= this.startDate && feedback.timestamp <= this.endDate) {
      return { feedbacks: [feedback, ...previous.feedbacks] };
    }

    return previous;
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
        timestamp: new Date(feedback.timestamp),
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
        timestamp: new Date(feedback.timestamp),
      },
    });
  }
}
</script>
