<template>
  <div class="text-center">
    <v-bottom-sheet
      :model-value="props.sheet"
      scroll-strategy="none"
      inset
      @update:model-value="onSheetUpdate"
    >
      <v-sheet class="text-center sheet--feedback">
        <v-container fluid>
          <div class="text-h6 py-3">
            {{ greetings }}
          </div>

          <v-rating
            v-model="glistenWhisp.data.rating"
            :color="heartColor"
            half-increments
            hover
            clearable
            size="x-large"
            :empty-icon="mdiHeartOutline"
            :full-icon="mdiHeart"
            :half-icon="mdiHeartHalfFull"
          />

          <v-select
            v-if="customTracker && customTracker.categories"
            v-model="glistenWhisp.data.category"
            :items="customTracker.categories"
            label="Choose category"
            variant="outlined"
          />

          <v-textarea
            v-model="glistenWhisp.data.feedback"
            variant="outlined"
            name="input-7-4"
            :label="textFieldLabel"
            rows="4"
          />
          <v-row no-gutters>
            <v-col cols="12" sm="6" md="4">
              <v-switch
                v-model="glistenWhisp.data.anonymous"
                class="my-0 py-0 px-1"
                color="primary"
                hide-details
                density="compact"
                label="Make my feedback anonymous"
              />
              <v-switch
                v-model="actionRequired"
                class="my-0 py-0 px-1"
                color="primary"
                hide-details
                density="compact"
                label="Action expected"
              />
            </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-if="glistenWhisp.data.anonymous === false"
                v-model="glistenWhisp.data.name"
                variant="outlined"
                label="Your name"
              />
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            :disabled="!glistenWhisp.data.feedback || submitting"
            :loading="submitting"
            @click="submitFeedback"
          >
            Submit feedback
          </v-btn>
        </v-container>
      </v-sheet>
    </v-bottom-sheet>

    <v-snackbar
      v-model="snackbarDisplayed"
      :timeout="snackbarTimeout"
      :color="snackbarColor"
      variant="outlined"
      class="glisten-snackbar pa-10"
    >
      <p>{{ snackbarText }}</p>
      <template #actions>
        <v-btn color="primary" variant="text" @click="snackbarDisplayed = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { mdiHeart, mdiHeartOutline, mdiHeartHalfFull } from '@mdi/js';
import { IFeedback, FeedbackStatus, WHISP_FEEDBACK_TYPE, WHISP_GQL_CLIENT } from '@/types/whisps';
import {
  CREATE_WHISP,
  type CreateWhispVariables,
  type CreateWhispResult,
} from '@/graphql/queries/whispQueries';
import { getWhisprClient } from '@/graphql/apollo';
// @ts-expect-error - wink-sentiment ships without bundled type declarations
import sentiment from 'wink-sentiment';

const props = withDefaults(
  defineProps<{
    sheet: boolean;
    userName: string;
    customTracker: any;
    applicationId: string;
    greetings?: string;
    textFieldLabel?: string;
    heartColor?: string;
  }>(),
  {
    greetings:
      "Thank you so much for taking the time to share your feedback with us! We appreciate hearing your thoughts on how we're doing, and we're excited to use your feedback to become even better.",
    textFieldLabel: "We're always looking to improve. Please share your feedback with us",
    heartColor: 'red',
  },
);

const emit = defineEmits<{
  (e: 'close', value: unknown): void;
}>();

function onSheetUpdate(value: boolean) {
  if (!value) {
    emit('close', value);
  }
}

const actionRequired = ref(false);
const submitting = ref(false);
const snackbarDisplayed = ref(false);
const snackbarTimeout = ref(3000);
const snackbarText = ref('');
const snackbarColor = ref('success');

type GlistenWhisp = Omit<IFeedback, '_id' | 'readableID' | 'timestamp' | 'updated'>;

const glistenWhisp = reactive<GlistenWhisp>({
  type: WHISP_FEEDBACK_TYPE,
  applicationID: props.applicationId,
  openedBy: '',
  description: '',
  data: {
    status: FeedbackStatus.NO_ACTION_NEEDED,
    anonymous: false,
    feedback: null,
    rating: 4.5,
    name: '',
    commentSentimentScore: 0,
    category: null,
  },
});

watch(
  () => glistenWhisp.data.anonymous,
  (val) => {
    glistenWhisp.data.name = val ? '' : props.userName;
  },
  { immediate: true },
);

watch(
  actionRequired,
  (val) => {
    glistenWhisp.data.status = val ? FeedbackStatus.ACTION_NEEDED : FeedbackStatus.NO_ACTION_NEEDED;
  },
  { immediate: true },
);

watch(
  () => props.applicationId,
  (val) => {
    glistenWhisp.applicationID = val;
  },
  { immediate: true },
);

// Use the named `whispr` client when it has been registered; otherwise fall back to
// the default Apollo client so the component never throws "Apollo client with id whispr
// not found" when the host app wires GraphQL up differently.
const { mutate: createWhisp } = useMutation<CreateWhispResult, CreateWhispVariables>(CREATE_WHISP, {
  clientId: getWhisprClient() ? WHISP_GQL_CLIENT : undefined,
});

function calculateSentiment(comment: string): number {
  const sentimentResult = sentiment(comment);
  return sentimentResult.normalizedScore;
}

function truncateDescription(str: string): string {
  const n = 200;
  if (str.length <= n) {
    return str;
  }
  const subString = str.substr(0, n - 1);
  return subString.substr(0, subString.lastIndexOf(' ')) + '...';
}

async function submitFeedback() {
  if (!glistenWhisp.data.feedback) {
    return;
  }

  submitting.value = true;

  glistenWhisp.data.commentSentimentScore = calculateSentiment(glistenWhisp.data.feedback);
  glistenWhisp.openedBy = glistenWhisp.data.name ?? '';
  glistenWhisp.description = truncateDescription(glistenWhisp.data.feedback);
  glistenWhisp.data = { ...glistenWhisp.data, ...props.customTracker };

  try {
    const res = await createWhisp({ whisp: glistenWhisp as CreateWhispVariables['whisp'] });

    if (res?.data) {
      const name = glistenWhisp.openedBy ? glistenWhisp.openedBy : '';
      snackbarText.value = `Thanks for your feedback ${name} !`;
      snackbarColor.value = 'success';
      snackbarDisplayed.value = true;
      glistenWhisp.data = {
        ...glistenWhisp.data,
        status: FeedbackStatus.NO_ACTION_NEEDED,
        feedback: null,
        rating: 4.5,
        commentSentimentScore: 0,
        category: null,
      };
    } else {
      throw new Error('No data returned from createWhisp mutation');
    }
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    snackbarText.value = 'An error occured';
    snackbarColor.value = 'error';
    snackbarDisplayed.value = true;
  } finally {
    submitting.value = false;
  }

  actionRequired.value = false;

  emit('close', glistenWhisp);
}
</script>

<style lang="scss" scoped>
.sheet--feedback {
  border-radius: 15px 15px 0px 0px;
}
</style>
