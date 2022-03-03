<template>
  <div>
    <div class="dashoard-container">
      <v-card class="filter pt-3">
        <filters
          :start-date.sync="startDate"
          :end-date.sync="endDate"
          :available-applications="availableApplications"
          :filtered-applications.sync="filteredApplications"
        />
      </v-card>

      <div class="nps-detail-card">
        <nps-details-card v-if="ratings.length > 0" :ratings="ratings" />
      </div>
      <div class="csat-score-card">
        <csat-score-card v-if="ratings.length > 0" :ratings="ratings" />
      </div>
      <div class="nps-score-gauge">
        <nps-score-gauge v-if="ratings.length > 0" :ratings="ratings" />
      </div>
      <div class="nps-line-chart">
        <nps-line-chart
          :timed-ratings="timedRatings"
          time-period="weeks"
          display-date-format="MMM D YYYY"
        />
      </div>
      <div class="nps-bar-chart">
        <nps-bar-chart
          :timed-ratings="timedRatings"
          time-period="weeks"
          display-date-format="MMM D YYYY"
        />
      </div>
      <div class="feedback-list">
        <feedback-list
          :feedbacks="feedbacks"
          :loading="loading"
          @changeStatus="changeStatus"
          @setNotes="setNotes"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import FeedbackList from '@/components/FeedbackList.vue';
import Filters from '@/components/Filters.vue';
import NpsScoreGauge from '@/components/NpsScoreGauge.vue';
import NpsLineChart from '@/components/NpsLineChart.vue';
import NpsDetailsCard from '@/components/NpsDetailsCard.vue';
import CsatScoreCard from '@/components/CsatScoreCard.vue';
import NpsBarChart, { TimedRating } from '@/components/NpsBarChart.vue';
import {
  SUBCRIPTION_FEEDBACKS,
  UPDATE_WHISP,
  GET_FEEDBACKS,
  FeedbackQueryResult,
  FeedbackQueryVariables,
  FeedbackSubscriptionVariables,
  FeedbackSubcriptionResult,
  FeedbackQuerySortVariable,
  UpdateWhispVariables,
  UpdateWhispResult,
} from '@/graphql/queries/whispQueries';
import {
  IFeedback,
  FeedbackStatus,
  WHISP_FEEDBACK_TYPE,
  WHISP_GQL_CLIENT,
  FeedbackSchema,
} from '@/types/whisps';
import { chain } from 'lodash';
import dayjs from 'dayjs';
import { SmartQuery, SubscribeToMore } from 'vue-apollo-decorators';
import * as z from 'zod';
import { VCard } from 'vuetify/lib';

/**
 * @description All in one dashboard to display and filter feedbacks from glisten
 */
@Component({
  components: {
    FeedbackList,
    NpsScoreGauge,
    NpsLineChart,
    NpsBarChart,
    NpsDetailsCard,
    CsatScoreCard,
    Filters,
    VCard,
  },
})
export default class GlistenDashboard extends Vue {
  private get ratings(): number[] {
    return this.feedbacks.map((x) => x.data.rating);
  }

  private get timedRatings(): TimedRating[] {
    return this.feedbacks.map((x) => ({ rating: x.data.rating, timestamp: x.timestamp }));
  }

  private endDate: Date = new Date();
  private startDate: Date = dayjs(this.endDate)
    .subtract(2, 'month')
    .toDate();

  private filteredApplications: string[] = [];

  private _availableApplications: string[] = [];

  private hasMounted: boolean = false;

  mounted() {
    this.hasMounted = true;
  }

  private get availableApplications(): string[] {
    const newAvailableApplications = chain(this.feedbacks)
      .map((x) => x.applicationID)
      .filter((x): x is string => !!x)
      .concat(this._availableApplications ?? [])
      .uniq()
      .sort()
      .value();

    this._availableApplications = newAvailableApplications;

    return newAvailableApplications;
  }

  get loading(): boolean {
    if (this.hasMounted) {
      return this.$apollo.loading;
    }
    return true;
  }

  private get queryFilter(): Partial<IFeedback> {
    let filter: any = {
      type: WHISP_FEEDBACK_TYPE,
      data: { $ne: null },
      'data.status': { $in: ['ACTION_NEEDED', 'ACTION_DONE', 'NO_ACTION_NEEDED'] },
      'data.feedback': { $ne: null },
      'data.rating': { $gte: 0, $lte: 5 },
    };

    if (this.startDate && this.endDate) {
      const startOfDay = (date: Date) =>
        dayjs(date)
          .startOf('day')
          .toDate();
      const endOfDay = (date: Date) =>
        dayjs(date)
          .endOf('day')
          .toDate();
      filter = {
        ...filter,
        timestamp: { $gte: startOfDay(this.startDate), $lte: endOfDay(this.endDate) },
      };
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
    update(data) {
      return z.array(FeedbackSchema).parse(data.feedbacks);
    }, // validates data and trim extra properties
    variables() {
      return {
        filter: this.queryFilter,
        limit: 1000,
        sort: this.querySort,
      };
    },
    client: WHISP_GQL_CLIENT,
  })
  @SubscribeToMore<
    GlistenDashboard,
    FeedbackQueryResult,
    FeedbackSubscriptionVariables,
    FeedbackSubcriptionResult
  >({
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
    try {
      const HasTypename = z.object({ __typename: z.string() });

      // validates data but keep property __typename that is useful for caching purpose
      const Schema = FeedbackSchema.merge(HasTypename);

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

      if (dayjs(feedback.timestamp).isBetween(this.startDate, this.endDate, 'days', '[]')) {
        return { feedbacks: [feedback, ...previous.feedbacks] };
      }
    } catch (err) {
      console.log('Invalid Data received.');
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

<style lang="scss" scoped>
.no-data-label {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.dashoard-container {
  display: grid;
  grid-template-columns: 350px 1fr 1fr 1fr;
  grid-template-rows: 200px 200px auto auto;
  grid-template-areas:
    'filter nps-line-chart nps-line-chart nps-line-chart'
    'filter nps-line-chart nps-line-chart nps-line-chart'
    'nps-detail-card csat-score-card  nps-bar-chart nps-bar-chart'
    'nps-score-gauge csat-score-card  nps-bar-chart nps-bar-chart'
    'feedback-list feedback-list feedback-list feedback-list';
  gap: 10px 10px;
  padding: 10px;
}

.dashoard-container > * {
  display: grid;
  place-items: center;
}

.filter {
  grid-area: filter;
  overflow: scroll;
}

.csat-score-card {
  grid-area: csat-score-card;
}

.nps-score-gauge {
  grid-area: nps-score-gauge;
}

.nps-detail-card {
  grid-area: nps-detail-card;
}

.nps-line-chart {
  grid-area: nps-line-chart;
}

.nps-bar-chart {
  grid-area: nps-bar-chart;
}

.feedback-list {
  grid-area: feedback-list;
}

@media screen and (max-width: 600px) {
  .dashoard-container {
    width: 100%;
    grid-template-columns: 100%;
    grid-template-rows: repeat(6, auto);
    grid-template-areas:
      'filter'
      'nps-line-chart'
      'csat-score-card'
      'nps-detail-card'
      'nps-score-gauge'
      'nps-bar-chart'
      'feedback-list';
  }
}
</style>
