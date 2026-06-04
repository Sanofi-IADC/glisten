<template>
  <div>
    <div class="dashoard-container">
      <v-card class="filter pt-3">
        <filters
          v-model:start-date="startDate"
          v-model:end-date="endDate"
          v-model:filtered-applications="filteredApplications"
          :available-applications="availableApplications"
        />
      </v-card>

      <div class="nps-detail-card">
        <nps-details-card :ratings="ratings" />
      </div>
      <div class="csat-score-card">
        <csat-score-card :ratings="ratings" />
      </div>
      <div class="nps-score-gauge">
        <nps-score-gauge :ratings="ratings" />
      </div>
      <div class="nps-line-chart">
        <nps-line-chart
          :timed-ratings="timedRatings"
          time-period="week"
          display-date-format="MMM D YYYY"
        />
      </div>
      <div class="nps-bar-chart">
        <nps-bar-chart
          :timed-ratings="timedRatings"
          time-period="week"
          display-date-format="MMM D YYYY"
        />
      </div>
      <div class="feedback-list">
        <feedback-list
          :feedbacks="feedbacks"
          :loading="loading"
          :admin-permissions="adminPermissions"
          @change-status="changeStatus"
          @set-notes="setNotes"
          @remove-feedback="removeFeedback"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import FeedbackList from '@/components/FeedbackList.vue';
import Filters from '@/components/Filters.vue';
import NpsScoreGauge from '@/components/NpsScoreGauge.vue';
import NpsLineChart from '@/components/NpsLineChart.vue';
import NpsDetailsCard from '@/components/NpsDetailsCard.vue';
import CsatScoreCard from '@/components/CsatScoreCard.vue';
import NpsBarChart from '@/components/NpsBarChart.vue';
import {
  UPDATE_WHISP,
  GET_FEEDBACKS,
  type FeedbackQueryResult,
  type FeedbackQueryVariables,
  type FeedbackSubcriptionResult,
  type FeedbackQuerySortVariable,
  type UpdateWhispVariables,
  type UpdateWhispResult,
  type DeleteWhispResult,
  type DeleteWhispVariables,
  DELETE_WHISP,
} from '@/graphql/queries/whispQueries';
import {
  IFeedback,
  FeedbackStatus,
  WHISP_FEEDBACK_TYPE,
  WHISP_GQL_CLIENT,
  FeedbackSchema,
} from '@/types/whisps';
import type { TimedRating } from '@/types/charts';
import { chain } from 'lodash';
import dayjs from 'dayjs';
import * as z from 'zod';
import { useFeedbackSubscription } from '@/composables/useFeedbackSubscription';

const props = withDefaults(
  defineProps<{
    adminAccessRights?: boolean;
  }>(),
  {
    adminAccessRights: false,
  },
);

const adminPermissions = computed<boolean>(() => props.adminAccessRights ?? false);

const endDate = ref<Date>(new Date());
const startDate = ref<Date>(dayjs(endDate.value).subtract(2, 'month').toDate());

const filteredApplications = ref<string[]>([]);
const availableApplicationsCache = ref<string[]>([]);
const removedIds = ref<Set<string>>(new Set());

const queryFilter = computed<Partial<IFeedback>>(() => {
  let filter: any = {
    type: WHISP_FEEDBACK_TYPE,
    data: { $ne: null },
    'data.status': { $in: ['ACTION_NEEDED', 'ACTION_DONE', 'NO_ACTION_NEEDED'] },
    'data.feedback': { $ne: null },
    'data.rating': { $gte: 0, $lte: 5 },
  };

  if (startDate.value && endDate.value) {
    const startOfDay = (date: Date) => dayjs(date).startOf('day').toDate();
    const endOfDay = (date: Date) => dayjs(date).endOf('day').toDate();
    filter = {
      ...filter,
      timestamp: { $gte: startOfDay(startDate.value), $lte: endOfDay(endDate.value) },
    };
  }

  if (filteredApplications.value.length > 0) {
    filter = { ...filter, applicationID: { $in: filteredApplications.value } };
  }

  return filter;
});

const querySort = computed<FeedbackQuerySortVariable>(() => ({ timestamp: -1 }));

const {
  result,
  loading: queryLoading,
  subscribeToMore,
} = useQuery<FeedbackQueryResult, FeedbackQueryVariables>(
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

const loading = computed<boolean>(() => queryLoading.value);

const feedbacks = computed<IFeedback[]>(() => {
  if (!result.value?.feedbacks) {
    return [];
  }
  try {
    return z
      .array(FeedbackSchema)
      .parse(result.value.feedbacks)
      .filter((feedback) => !removedIds.value.has(feedback._id));
  } catch {
    return [];
  }
});

const ratings = computed<number[]>(() => feedbacks.value.map((x) => x.data.rating));

const timedRatings = computed<TimedRating[]>(() =>
  feedbacks.value.map((x) => ({ rating: x.data.rating, timestamp: x.timestamp })),
);

const availableApplications = computed<string[]>(() =>
  chain(feedbacks.value)
    .map((x) => x.applicationID)
    .filter((x): x is string => !!x)
    .concat(availableApplicationsCache.value ?? [])
    .uniq()
    .sort()
    .value(),
);

// Persist the union of applications seen so far so the filter list never shrinks
// when the active filter narrows the returned feedbacks.
watch(
  availableApplications,
  (apps) => {
    const prev = availableApplicationsCache.value ?? [];
    if (apps.length === prev.length && apps.every((app, i) => app === prev[i])) {
      return;
    }
    availableApplicationsCache.value = apps;
  },
  { flush: 'post' },
);

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

    if (dayjs(feedback.timestamp).isBetween(startDate.value, endDate.value, 'day', '[]')) {
      return { feedbacks: [feedback, ...previous.feedbacks] };
    }
  } catch {
    console.log('Invalid Data received.');
  }
  return previous;
}

const { mutate: updateWhisp } = useMutation<UpdateWhispResult, UpdateWhispVariables>(UPDATE_WHISP, {
  clientId: WHISP_GQL_CLIENT,
});

const { mutate: deleteWhisp } = useMutation<DeleteWhispResult, DeleteWhispVariables>(DELETE_WHISP, {
  clientId: WHISP_GQL_CLIENT,
});

async function changeStatus({
  feedback,
  status,
}: {
  feedback: IFeedback;
  status: FeedbackStatus;
}): Promise<void> {
  await updateWhisp({
    id: feedback._id,
    whisp: {
      ...feedback,
      data: { ...feedback.data, status },
    },
  });
}

async function setNotes({
  feedback,
  notes,
}: {
  feedback: IFeedback;
  notes: string;
}): Promise<void> {
  await updateWhisp({
    id: feedback._id,
    whisp: {
      ...feedback,
      data: { ...feedback.data, notes },
    },
  });
}

async function removeFeedback({ feedback }: { feedback: IFeedback }): Promise<void> {
  await deleteWhisp({ id: feedback._id });
  removedIds.value = new Set([...removedIds.value, feedback._id]);
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
  grid-template-rows: minmax(220px, auto) minmax(220px, auto) auto auto;
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
  width: 100%;
  min-width: 0;
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
  overflow: visible;
}

.nps-bar-chart {
  grid-area: nps-bar-chart;
  overflow: visible;
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
