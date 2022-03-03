<template>
  <csat-score-card v-if="ratings.length > 0" :ratings="ratings" />
</template>

<script lang="ts">
import {
  FeedbackQueryResult,
  FeedbackQuerySortVariable,
  FeedbackQueryVariables,
  FeedbackSubcriptionResult,
  FeedbackSubscriptionVariables,
  GET_FEEDBACKS,
  SUBCRIPTION_FEEDBACKS,
} from '@/graphql/queries/whispQueries';
import { FeedbackSchema, IFeedback, WHISP_FEEDBACK_TYPE, WHISP_GQL_CLIENT } from '@/types/whisps';
import dayjs from 'dayjs';
import { SmartQuery, SubscribeToMore } from 'vue-apollo-decorators';
import { Component, Prop, Vue } from 'vue-property-decorator';
import CsatScoreCard from '@/components/CsatScoreCard.vue';
import * as z from 'zod';

/**
 * @description Customer Satisfaction score for given applications in a period of time
 */
@Component({
  components: {
    CsatScoreCard,
  },
})
export default class GlistenCsat extends Vue {
  // Ending date of the interval
  @Prop({ default: () => new Date() })
  private endDate!: Date;

  // Starting date of the interval
  @Prop({
    default: () =>
      dayjs()
        .subtract(2, 'month')
        .toDate(),
  })
  private startDate!: Date;

  // Array of applications name
  @Prop({ required: true, default: [] })
  private filteredApplications!: string[];

  @SmartQuery<GlistenCsat, IFeedback[], FeedbackQueryVariables, FeedbackQueryResult>({
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
    GlistenCsat,
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

  private get ratings(): number[] {
    return this.feedbacks.map((x) => x.data.rating);
  }

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

    if (dayjs(feedback.timestamp).isBetween(this.startDate, this.endDate, 'days', '[]')) {
      return { feedbacks: [feedback, ...previous.feedbacks] };
    }

    return previous;
  }
}
</script>
