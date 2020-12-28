<template>
  <v-row>
    <v-col cols="3 justify-center">
      <filters
        :startDate.sync="startDate"
        :endDate.sync="endDate"
        :availableApplications="availableApplications"
        :filteredApplications.sync="filteredApplications"
      />
      <nps-details-card :ratings="ratings" />
      <nps-score-gauge :ratings="ratings" />
    </v-col>
    <v-col cols="9">
      <nps-line-chart :timedRatings="timedRatings" timePeriod="days" displayDateFormat="LL" />
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
import NpsLineChart from '@/components/NpsLineChart.vue';
import NpsDetailsCard from '@/components/NpsDetailsCard.vue';
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
  GQLCachedResult,
  GQLCachedResultSchema,
  UpdateWhispVariables,
  UpdateWhispResult,
} from '@/graphql/queries/whispQueries';
import { IFeedback, FeedbackStatus, WHISP_FEEDBACK_TYPE, WHISP_GQL_CLIENT } from '@/types/whisps';
import _ from 'lodash';
import moment from 'moment';
import { DataOptions } from 'vuetify';
import { SmartQuery, SubscribeToMore } from 'vue-apollo-decorators';
import { FeedbackSchema } from '@/types/whisps';
import * as z from 'zod';

/**
 * Dashboard component entry default
 */
@Component({
  components: { FeedbackList, NpsScoreGauge, NpsLineChart, NpsBarChart, NpsDetailsCard, Filters },
})
export default class GlistenDashboard extends Vue {
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
    let filter: any = { type: WHISP_FEEDBACK_TYPE };

    if (this.startDate && this.endDate) {
      const startOfDay = (date: Date) => moment(date).startOf('day').toDate();
      const endOfDay = (date: Date) => moment(date).endOf('day').toDate();
      filter = { ...filter, timestamp: { $gte: startOfDay(this.startDate), $lte: endOfDay(this.endDate) } };
    }

    if (this.filteredApplications.length > 0) {
      filter = { ...filter, applicationID: { $in: this.filteredApplications } };
    }

    return filter;
  }

  private get querySort(): FeedbackQuerySortVariable {
    return { timestamp: -1 };
  }

  @SmartQuery<GlistenDashboard, IFeedback[], FeedbackQueryVariables, FeedbackQueryResult>({
    query: GET_FEEDBACKS,
    update(data) { return z.array(FeedbackSchema).parse(data.feedbacks); }, // validates data and trim extra properties
    variables() {
      return {
        filter: this.queryFilter,
        limit: 1000,
        sort: this.querySort,
      };
    },
    client: WHISP_GQL_CLIENT,
  })
  @SubscribeToMore<GlistenDashboard, FeedbackQueryResult, FeedbackSubscriptionVariables, FeedbackSubcriptionResult>({
    document: SUBCRIPTION_FEEDBACKS,
    variables() {
      return {
        filter: {
          type: WHISP_FEEDBACK_TYPE,
        },
      };
    },
    updateQuery(previous, options) {
      return this.updateFeedbacksOnSubscriptionEvent(previous, options);
    },
  })
  private feedbacks: IFeedback[] = [];

  private updateFeedbacksOnSubscriptionEvent(
    previous: FeedbackQueryResult,
    update: { subscriptionData: { data: FeedbackSubcriptionResult } },
  ): FeedbackQueryResult {
    const HasTypename = z.object({ __typename: z.string() });
    const Schema = FeedbackSchema.merge(HasTypename); // validates data but keep property __typename that is useful for caching purpose

    const feedback = Schema.parse(update.subscriptionData.data.feedbackAdded);
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

    if (moment(feedback.timestamp).isBetween(this.startDate, this.endDate, 'days', '[]')) {
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
    this.$apollo.mutate<UpdateWhispResult, UpdateWhispVariables>({
      mutation: UPDATE_WHISP,
      client: WHISP_GQL_CLIENT,
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
    this.$apollo.mutate<UpdateWhispResult, UpdateWhispVariables>({
      mutation: UPDATE_WHISP,
      client: WHISP_GQL_CLIENT,
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
