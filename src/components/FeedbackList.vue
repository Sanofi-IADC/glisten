<template>
  <div style="width:100%">
    <v-dialog
      v-if="confirmationDialog.visible"
      v-model="confirmationDialog.visible"
      width="500"
    >
      <v-card>
        <v-card-title class="text-h5 white--text primary">
          {{ confirmationDialog.title }}
        </v-card-title>
        <v-card-text>
          <div class="mt-5">{{ confirmationDialog.description }}</div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="flex justify-end">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="onAcceptConfirmationDialog"
          >
            Confirm
          </v-btn>
          <v-btn
            text
            @click="onCancelConfirmationDialog"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-data-table
      class="feedback-data-table"
      :items="feedbacks"
      :headers="tableHeaders"
      :loading="loading"
      show-expand
      item-key="_id"
      :expanded.sync="expanded"
    >
      <template v-slot:[`header.data.rating`]="{}">
        <v-icon dense>
          mdi-heart
        </v-icon>
      </template>

      <template v-slot:[`header.data.commentSentimentScore`]="{}">
        <v-icon dense>
          mdi-emoticon
        </v-icon>
      </template>

      <template v-slot:[`item._id`]="{ item }">
        <span :id="item._id" class="feedback-id" @click="copyToClipboard(item._id)">{{
          item._id
        }}</span>
      </template>

      <template v-slot:[`item.timestamp`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on">
              {{ dayjs(item.timestamp).fromNow() }}
            </span>
          </template>
          <span>{{ dayjs(item.timestamp).format('LLL') }}</span>
        </v-tooltip>
      </template>

      <template v-slot:[`item.data.name`]="{ item }">
        <span>{{ item.data.anonymous ? 'anonymous' : item.data.name }}</span>
      </template>

      <template v-slot:[`item.data.rating`]="{ item }">
        <v-chip :color="getColor(item.data.rating)" dark>
          {{ item.data.rating }}
        </v-chip>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <div v-bind="attrs" v-on="on">
              <v-checkbox
                :disabled="!isActionNeeded(item)"
                :input-value="isActionDone(item)"
                @change="(value) => onActionToggled(item, value)"
              />
            </div>
          </template>
          <span v-if="!isActionNeeded(item)">No action needed for this feedback</span>
          <span v-else-if="isActionDone(item)">Action done</span>
          <span v-else-if="!isActionDone(item)">Action needed</span>
        </v-tooltip>
      </template>

      <template v-slot:[`item.notes`]="{ item }">
        <v-tooltip bottom :disabled="!item.data.notes">
          <template v-slot:activator="scopeDataFromVTooltip">
            <div v-bind="scopeDataFromVTooltip.attrs" v-on="scopeDataFromVTooltip.on">
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="scopeDataFromVMenu">
                  <v-icon v-bind="scopeDataFromVMenu.attrs" v-on="scopeDataFromVMenu.on">
                    {{ item.data.notes ? 'mdi-comment-text-outline' : 'mdi-comment-outline' }}
                  </v-icon>
                </template>
                <v-textarea
                  solo
                  class="pa-2"
                  placeholder="..."
                  :value="item.data.notes"
                  @change="(value) => setNotes(item, value)"
                />
              </v-menu>
            </div>
          </template>
          <span>{{ item.data.notes }}</span>
        </v-tooltip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-menu offset-y>
          <template v-slot:activator="scopeActionDataFromVTooltip">
            <v-icon
              dense
              v-bind="scopeActionDataFromVTooltip.attrs"
              v-on="scopeActionDataFromVTooltip.on"
            >
              mdi-dots-vertical
            </v-icon>
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
                  <v-icon dense :color="actionItem.iconColor">
                    {{ actionItem.icon }}
                  </v-icon>
                  <span class="ml-2">
                    {{ actionItem.text }}
                  </span>
                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="pa-4">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><b>Context</b></v-list-item-title>
              <v-list-item-subtitle>
                <span
                  ><b> Page : </b>{{ item.data.contextPage || 'N/A' }} | <b>URL :</b>
                  {{ item.data.contextPortal || 'N/A' }}</span
                >
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><b>Notes</b></v-list-item-title>
              <v-list-item-subtitle>
                <span>{{ item.data.notes || 'N/A' }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </td>
      </template>
    </v-data-table>
    <v-snackbar v-model="snackbar">
      <span
        ><v-icon left color="white">mdi-content-copy</v-icon>{{ copiedId }} copied to clipboard
        !</span
      >
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit } from 'vue-property-decorator';
import { IFeedback, FeedbackStatus } from '@/types/whisps';
import { isPromoter, isNeutral, isDetractor } from '@/services/nps.service';
import {
  VDataTable,
  VIcon,
  VSnackbar,
  VTooltip,
  VList,
  VListItem,
  VListItemContent,
  VListItemTitle,
  VListItemSubtitle,
  VMenu,
  VTextarea,
  VCheckbox,
  VChip,
  VDialog,
  VDivider,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSpacer,
  VBtn,
} from 'vuetify/lib';
import { DataTableHeader } from 'vuetify';
import { ConfirmationDialog, ItemActionTypes } from '@/types/feedbackList';

@Component({
  components: {
    VDataTable,
    VIcon,
    VSnackbar,
    VTooltip,
    VList,
    VListItem,
    VListItemContent,
    VListItemTitle,
    VListItemSubtitle,
    VMenu,
    VTextarea,
    VCheckbox,
    VChip,
    VDialog,
    VDivider,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VSpacer,
    VBtn,
  },
})
export default class FeedbackList extends Vue {
  @Prop({ required: true }) public feedbacks!: IFeedback[];
  @Prop({ required: true }) public loading!: boolean;
  @Prop({ required: true }) public adminPermissions!: boolean;

  snackbar = false;
  copiedId: string | null = null;
  expanded: any[] = [];
  confirmationDialog: ConfirmationDialog = {
    confirmCallback: () => {},
    title: 'Warning',
    description: 'Confirmation of the operation will cause irreversible changes, do you want to confirm ?',
    visible: false,
  };

  @Emit('changeStatus')
  private changeStatus(
    feedback: IFeedback,
    status: FeedbackStatus,
  ): { feedback: IFeedback; status: FeedbackStatus } {
    return { feedback, status };
  }

  @Emit('removeFeedback')
  private removeFeedback(feedback: IFeedback) {
    return { feedback };
  }

  private isActionNeeded(feedback: IFeedback): boolean {
    return feedback.data.status && feedback.data.status !== FeedbackStatus.NO_ACTION_NEEDED;
  }

  private isActionDone(feedback: IFeedback): boolean {
    return feedback.data.status === FeedbackStatus.ACTION_DONE;
  }

  private onActionToggled(feedback: IFeedback, value: boolean): void {
    if (this.isActionNeeded(feedback)) {
      this.changeStatus(
        feedback,
        value ? FeedbackStatus.ACTION_DONE : FeedbackStatus.ACTION_NEEDED,
      );
    }
  }

  private openConfirmationDialog({ confirmCallback }: { confirmCallback: ConfirmationDialog['confirmCallback'] }) {
    this.confirmationDialog.visible = true;
    this.confirmationDialog.confirmCallback = confirmCallback;
  }

  private onAcceptConfirmationDialog() {
    this.confirmationDialog.confirmCallback();
    this.onCancelConfirmationDialog();
  }

  private onCancelConfirmationDialog() {
    this.confirmationDialog.visible = false;
    this.confirmationDialog.confirmCallback = () => {};
  }

  @Emit('setNotes')
  private setNotes(feedback: IFeedback, notes: string): { feedback: IFeedback; notes: string } {
    return { feedback, notes };
  }

  private get itemActionTypes(): ItemActionTypes {
    return [
      {
        text: 'Remove',
        icon: 'mdi-trash-can-outline',
        iconColor: 'red',
        onClickHandler: (feedback: IFeedback) => this.openConfirmationDialog({
          confirmCallback: () => this.removeFeedback(feedback),
        }),
      },
    ];
  }

  private get tableHeaders(): DataTableHeader[] {
    return [
      { text: 'ID', value: '_id', sortable: false, width: '6ch' },
      { text: 'Date', value: 'timestamp', width: '10em' },
      { text: 'Application', value: 'applicationID', width: '10em' },
      { text: 'Name', value: 'data.name', width: '10em' },
      { text: 'Feedback', value: 'data.feedback', sortable: false, width: '100%' },
      { text: 'rating', value: 'data.rating', sortable: true, align: 'center', width: '7em' },
      {
        text: 'commentSentimentScore',
        value: 'data.commentSentimentScore',
        sortable: true,
        align: 'center',
        width: '6em',
      },
      { text: 'Status', value: 'status', sortable: false, width: '3em' },
      { text: 'Notes', value: 'notes', sortable: false, width: '3em' },
      {
        text: 'Actions',
        value: 'actions',
        width: '3em',
        align: 'center',
        adminPermission: true,
      },
      { text: '', value: 'data-table-expand', width: '3em' },
    ].filter((header) => header.adminPermission ? this.adminPermissions : true) as DataTableHeader[];
  }

  private getColor(rating: number): string {
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

  copyToClipboard(id: string) {
    const el = document.createElement('textarea');
    el.value = id;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.copiedId = id;
    this.snackbar = true;
  }
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
