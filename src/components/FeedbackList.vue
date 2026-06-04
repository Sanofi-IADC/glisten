<template>
  <div style="width: 100%">
    <v-dialog v-if="confirmationDialog.visible" v-model="confirmationDialog.visible" width="500">
      <v-card>
        <v-card-title class="text-h5 text-white bg-primary">
          {{ confirmationDialog.title }}
        </v-card-title>
        <v-card-text>
          <div class="mt-5">{{ confirmationDialog.description }}</div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-end">
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="onAcceptConfirmationDialog"> Confirm </v-btn>
          <v-btn variant="text" @click="onCancelConfirmationDialog"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
      v-model:expanded="expanded"
      class="feedback-data-table"
      :items="feedbacks"
      :headers="tableHeaders"
      :loading="loading"
      show-expand
      item-value="_id"
    >
      <template #[`header.data.rating`]>
        <v-icon density="compact" :icon="mdiHeart" />
      </template>

      <template #[`header.data.commentSentimentScore`]>
        <v-icon density="compact" :icon="mdiEmoticon" />
      </template>

      <template #[`item._id`]="{ item }">
        <span :id="item._id" class="feedback-id" @click="copyToClipboard(item._id)">{{
          item._id
        }}</span>
      </template>

      <template #[`item.timestamp`]="{ item }">
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              {{ dayjs(item.timestamp).fromNow() }}
            </span>
          </template>
          <span>{{ dayjs(item.timestamp).format('LLL') }}</span>
        </v-tooltip>
      </template>

      <template #[`item.data.name`]="{ item }">
        <span>{{ item.data.anonymous ? 'anonymous' : item.data.name }}</span>
      </template>

      <template #[`item.data.rating`]="{ item }">
        <v-chip :color="getColor(item.data.rating)" variant="flat">
          {{ item.data.rating }}
        </v-chip>
      </template>

      <template #[`item.status`]="{ item }">
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltipProps }">
            <div v-bind="tooltipProps">
              <v-checkbox
                :disabled="!isActionNeeded(item)"
                :model-value="isActionDone(item)"
                :aria-label="isActionDone(item) ? 'Action done' : 'Action needed'"
                hide-details
                @update:model-value="(value) => onActionToggled(item, !!value)"
              />
            </div>
          </template>
          <span v-if="!isActionNeeded(item)">No action needed for this feedback</span>
          <span v-else-if="isActionDone(item)">Action done</span>
          <span v-else-if="!isActionDone(item)">Action needed</span>
        </v-tooltip>
      </template>

      <template #[`item.notes`]="{ item }">
        <v-tooltip location="bottom" :disabled="!item.data.notes">
          <template #activator="{ props: tooltipProps }">
            <div v-bind="tooltipProps">
              <v-menu :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                  <v-icon
                    v-bind="menuProps"
                    :icon="item.data.notes ? mdiCommentTextOutline : mdiCommentOutline"
                  />
                </template>
                <v-textarea
                  variant="solo"
                  class="pa-2"
                  placeholder="..."
                  :model-value="item.data.notes"
                  @update:model-value="(value) => setNotes(item, value)"
                />
              </v-menu>
            </div>
          </template>
          <span>{{ item.data.notes }}</span>
        </v-tooltip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-menu offset="8">
          <template #activator="{ props: menuProps }">
            <v-icon density="compact" v-bind="menuProps" :icon="mdiDotsVertical" />
          </template>
          <v-list>
            <v-list-item
              v-for="(actionItem, index) in itemActionTypes"
              :key="`${actionItem.text}-${index}-action`"
              :value="actionItem.text"
              @click="actionItem.onClickHandler(item)"
            >
              <v-list-item-title>
                <div class="d-flex align-center">
                  <v-icon density="compact" :color="actionItem.iconColor" :icon="actionItem.icon" />
                  <span class="ml-2">
                    {{ actionItem.text }}
                  </span>
                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template #expanded-row="{ columns, item }">
        <tr>
          <td :colspan="columns.length" class="pa-4">
            <v-list-item>
              <v-list-item-title><b>Context</b></v-list-item-title>
              <v-list-item-subtitle>
                <span
                  ><b> Page : </b>{{ item.data.contextPage || 'N/A' }} | <b>URL :</b>
                  {{ item.data.contextPortal || 'N/A' }}</span
                >
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title><b>Notes</b></v-list-item-title>
              <v-list-item-subtitle>
                <span>{{ item.data.notes || 'N/A' }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </td>
        </tr>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar">
      <span
        ><v-icon class="mr-1" color="white" :icon="mdiContentCopy" />{{ copiedId }} copied to
        clipboard !</span
      >
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  mdiHeart,
  mdiEmoticon,
  mdiCommentTextOutline,
  mdiCommentOutline,
  mdiDotsVertical,
  mdiContentCopy,
  mdiTrashCanOutline,
} from '@mdi/js';
import { IFeedback, FeedbackStatus } from '@/types/whisps';
import { isPromoter, isNeutral, isDetractor } from '@/services/nps.service';
import dayjs from 'dayjs';
import type {
  ConfirmationDialog,
  ItemActionTypes,
  FeedbackTableHeader,
} from '@/types/feedbackList';

const props = defineProps<{
  feedbacks: IFeedback[];
  loading: boolean;
  adminPermissions: boolean;
}>();

const emit = defineEmits<{
  (e: 'changeStatus', payload: { feedback: IFeedback; status: FeedbackStatus }): void;
  (e: 'removeFeedback', payload: { feedback: IFeedback }): void;
  (e: 'setNotes', payload: { feedback: IFeedback; notes: string }): void;
}>();

const snackbar = ref(false);
const copiedId = ref<string | null>(null);
const expanded = ref<string[]>([]);
const confirmationDialog = ref<ConfirmationDialog>({
  confirmCallback: () => {},
  title: 'Warning',
  description:
    'Confirmation of the operation will cause irreversible changes, do you want to confirm ?',
  visible: false,
});

function changeStatus(feedback: IFeedback, status: FeedbackStatus): void {
  emit('changeStatus', { feedback, status });
}

function removeFeedback(feedback: IFeedback): void {
  emit('removeFeedback', { feedback });
}

function setNotes(feedback: IFeedback, notes: string): void {
  emit('setNotes', { feedback, notes });
}

function isActionNeeded(feedback: IFeedback): boolean {
  return !!feedback.data.status && feedback.data.status !== FeedbackStatus.NO_ACTION_NEEDED;
}

function isActionDone(feedback: IFeedback): boolean {
  return feedback.data.status === FeedbackStatus.ACTION_DONE;
}

function onActionToggled(feedback: IFeedback, value: boolean): void {
  if (isActionNeeded(feedback)) {
    changeStatus(feedback, value ? FeedbackStatus.ACTION_DONE : FeedbackStatus.ACTION_NEEDED);
  }
}

function openConfirmationDialog({
  confirmCallback,
}: {
  confirmCallback: ConfirmationDialog['confirmCallback'];
}) {
  confirmationDialog.value.visible = true;
  confirmationDialog.value.confirmCallback = confirmCallback;
}

function onAcceptConfirmationDialog() {
  confirmationDialog.value.confirmCallback();
  onCancelConfirmationDialog();
}

function onCancelConfirmationDialog() {
  confirmationDialog.value.visible = false;
  confirmationDialog.value.confirmCallback = () => {};
}

const itemActionTypes = computed<ItemActionTypes>(() => [
  {
    text: 'Remove',
    icon: mdiTrashCanOutline,
    iconColor: 'red',
    onClickHandler: (feedback: IFeedback) =>
      openConfirmationDialog({
        confirmCallback: () => removeFeedback(feedback),
      }),
  },
]);

const tableHeaders = computed<FeedbackTableHeader[]>(
  () =>
    [
      { title: 'ID', key: '_id', sortable: false, width: '6ch' },
      { title: 'Date', key: 'timestamp', width: '10em' },
      { title: 'Application', key: 'applicationID', width: '10em' },
      { title: 'Name', key: 'data.name', width: '10em' },
      { title: 'Feedback', key: 'data.feedback', sortable: false, width: '100%' },
      { title: 'rating', key: 'data.rating', sortable: true, align: 'center', width: '7em' },
      {
        title: 'commentSentimentScore',
        key: 'data.commentSentimentScore',
        sortable: true,
        align: 'center',
        width: '6em',
      },
      { title: 'Status', key: 'status', sortable: false, width: '3em' },
      { title: 'Notes', key: 'notes', sortable: false, width: '3em' },
      {
        title: 'Actions',
        key: 'actions',
        width: '3em',
        align: 'center',
        adminPermission: true,
      },
      { title: '', key: 'data-table-expand', width: '3em' },
    ].filter((header) =>
      header.adminPermission ? props.adminPermissions : true,
    ) as FeedbackTableHeader[],
);

function getColor(rating: number): string {
  if (isPromoter(rating)) {
    return 'green';
  }
  if (isNeutral(rating)) {
    return 'orange';
  }
  if (isDetractor(rating)) {
    return 'red';
  }
  return '';
}

async function copyToClipboard(id: string) {
  try {
    await navigator.clipboard.writeText(id);
  } catch {
    const el = document.createElement('textarea');
    el.value = id;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
  copiedId.value = id;
  snackbar.value = true;
}
</script>

<style>
.feedback-id {
  display: block;
  cursor: pointer;
  max-width: 6ch;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  direction: rtl;
}
.feedback-data-table .v-menu__content,
.feedback-data-table .v-data-table__expanded__content {
  box-shadow: none !important;
}

.feedback-data-table .v-data-table-header__icon {
  position: absolute !important;
}
</style>
