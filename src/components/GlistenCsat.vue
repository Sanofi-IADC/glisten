<template>
  <csat-score-card v-if="ratings.length > 0" :ratings="ratings" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import {
  type FeedbackQueryResult,
  type FeedbackQuerySortVariable,
  type FeedbackQueryVariables,
  type FeedbackSubcriptionResult,
  GET_FEEDBACKS,
} from '@/graphql/queries/whispQueries';
import { useFeedbackSubscription } from '@/composables/useFeedbackSubscription';
import { FeedbackSchema, IFeedback, WHISP_FEEDBACK_TYPE, WHISP_GQL_CLIENT } from '@/types/whisps';
import dayjs from 'dayjs';
import CsatScoreCard from '@/components/CsatScoreCard.vue';
import * as z from 'zod';

const props = withDefaults(
  defineProps<{
    endDate?: Date;
    startDate?: Date;
    filteredApplications?: string[];
  }>(),
  {
    endDate: () => new Date(),
    startDate: () => dayjs().subtract(2, 'month').toDate(),
    filteredApplications: () => [],
  },
);

const queryFilter = computed<Partial<IFeedback>>(() => {
  let filter: any = {
    type: WHISP_FEEDBACK_TYPE,
    data: { $ne: null },
    'data.status': { $in: ['ACTION_NEEDED', 'ACTION_DONE', 'NO_ACTION_NEEDED'] },
    'data.feedback': { $ne: null },
    'data.rating': { $gte: 0, $lte: 5 },
  };

  if (props.startDate && props.endDate) {
    const startOfDay = (date: Date) => dayjs(date).startOf('day').toDate();
    const endOfDay = (date: Date) => dayjs(date).endOf('day').toDate();
    filter = {
      ...filter,
      timestamp: { $gte: startOfDay(props.startDate), $lte: endOfDay(props.endDate) },
    };
  }

  if (props.filteredApplications.length > 0) {
    filter = { ...filter, applicationID: { $in: props.filteredApplications } };
  }

  return filter;
});

const querySort = computed<FeedbackQuerySortVariable>(() => ({ timestamp: -1 }));

const { result, subscribeToMore } = useQuery<FeedbackQueryResult, FeedbackQueryVariables>(
  GET_FEEDBACKS,
  () => ({
    filter: queryFilter.value,
    limit: 1000,
    sort: querySort.value,
  }),
  () => ({
    clientId: WHISP_GQL_CLIENT,
  }),
);

useFeedbackSubscription(subscribeToMore, updateFeedbacksOnSubscriptionEvent);

const feedbacks = computed<IFeedback[]>(() => {
  if (!result.value?.feedbacks) {
    return [];
  }
  try {
    return z.array(FeedbackSchema).parse(result.value.feedbacks);
  } catch {
    return [];
  }
});

const ratings = computed<number[]>(() => feedbacks.value.map((x) => x.data.rating));

function updateFeedbacksOnSubscriptionEvent(
  previous: FeedbackQueryResult,
  update: { subscriptionData: { data: FeedbackSubcriptionResult } },
): FeedbackQueryResult {
  const added = update.subscriptionData.data?.feedbackAdded;
  if (!added) {
    return previous;
  }

  try {
    const HasTypename = z.object({ __typename: z.string() });
    const Schema = FeedbackSchema.merge(HasTypename);

    const feedback = Schema.parse(added);
    const existingFeedbackIndex = previous.feedbacks.findIndex(
      (f: IFeedback) => feedback._id === f._id,
    );

    if (existingFeedbackIndex >= 0) {
      return {
        feedbacks: Object.assign([], previous.feedbacks, {
          [existingFeedbackIndex]: feedback,
        }),
      };
    }

    if (dayjs(feedback.timestamp).isBetween(props.startDate, props.endDate, 'day', '[]')) {
      return { feedbacks: [feedback, ...previous.feedbacks] };
    }
  } catch {
    console.log('Invalid Data received.');
  }

  return previous;
}
</script>
