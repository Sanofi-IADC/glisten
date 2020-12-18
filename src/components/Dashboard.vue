<template>
  <v-row>
    <v-col cols="3 justify-center">
      <filters
        :startDate.sync="startDate"
        :endDate.sync="endDate"
        :availableApplications="availableApplications"
        :filteredApplications.sync="filteredApplications"
      />
      <nps-score-gauge :ratings="ratings" />
    </v-col>
    <v-col cols="9">
      <nps-bar-chart :timedRatings="timedRatings" timePeriod="days" displayDateFormat="LL" />
    </v-col>

    <v-col cols="12">
      <feedback-list
        :feedbacks="feedbacks"
        :loading="loading"
        @changeStatus="changeStatus"
        @setNotes="setNotes"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import FeedbackList from '@/components/FeedbackList.vue';
import Filters from '@/components/Filters.vue';
import NpsScoreGauge from '@/components/NpsScoreGauge.vue';
import NpsBarChart, { TimedRating } from '@/components/NpsBarChart.vue';
import {
  SUBCRIPTION_FEEDBACKS,
  CREATE_WHISP,
  UPDATE_WHISP,
  GET_FEEDBACKS,
  FeedbackQueryResult,
  FeedbackQueryVariables,
  FeedbackSubscriptionVariables,
  FeedbackSubcriptionResult,
  FeedbackQuerySortVariable,
} from '@/graphql/queries/whispQueries';
import { IFeedback, FeedbackStatus } from '@/types/whisps';
import _ from 'lodash';
import moment from 'moment';
import { DataOptions } from 'vuetify';
import { SmartQuery, SubscribeToMore } from 'vue-apollo-decorators';
import { feedbackSchema } from '@/types/whisps';
import * as z from 'zod';

/**
 * Dashboard component entry default
 */
@Component({
  components: { FeedbackList, NpsScoreGauge, NpsBarChart, Filters },
})
export default class Dashboard extends Vue {
  private get ratings(): number[] {
    return this.feedbacks.map((x) => x.data.rating);
  }

  private get timedRatings(): TimedRating[] {
    return this.feedbacks.map((x) => ({ rating: x.data.rating, timestamp: x.timestamp }));
  }

  private endDate: Date = new Date();
  private startDate: Date = moment(this.endDate).subtract(2, 'month').toDate();
  private filteredApplications: string[] = [];

  private _availableApplications: string[] = [];
  private get availableApplications(): string[] {
    const newAvailableApplications = _.chain(this.feedbacks)
      .map((x) => x.applicationID)
      .filter((x):x is string => !!x)
      .concat(this._availableApplications ?? [])
      .uniq()
      .sort()
      .value();

    this._availableApplications = newAvailableApplications;

    return newAvailableApplications;
  }

  private get loading(): boolean {
    return this.$apollo.loading;
  }

  private get queryFilter(): Partial<IFeedback> {
    let filter: any = { type: 'GLISTEN' };

    if (this.startDate && this.endDate) {
      filter = { ...filter, timestamp: { $gte: this.startDate, $lte: this.endDate } };
    }

    if (this.filteredApplications.length > 0) {
      filter = { ...filter, applicationID: { $in: this.filteredApplications } };
    }

    return filter;
  }

  private get querySort(): FeedbackQuerySortVariable {
    return { timestamp: -1 };
  }

  @SmartQuery<Dashboard, IFeedback[], FeedbackQueryVariables, FeedbackQueryResult>({
    query: GET_FEEDBACKS,
    update(data) { return z.array(feedbackSchema).parse(data.feedbacks); },
    variables() {
      return {
        filter: this.queryFilter,
        limit: 1000,
        sort: this.querySort,
      };
    },
  })
  @SubscribeToMore<Dashboard, {feedbacks: IFeedback[]}, FeedbackSubscriptionVariables, FeedbackSubcriptionResult>({
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

  private updateFeedbacksOnSubscriptionEvent(
    previous: {feedbacks: IFeedback[]},
    update: { subscriptionData: { data: FeedbackSubcriptionResult } },
  ): { feedbacks: IFeedback[] } {
    const feedback = feedbackSchema.parse(update.subscriptionData.data.feedbackAdded);

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

    if (moment(feedback.timestamp).isBetween(this.startDate, this.endDate)) {
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
