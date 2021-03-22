<template>
  <div style="width:100%">
    <v-data-table
      class="feedback-data-table"
      :items="feedbacks"
      :headers="tableHeaders"
      :loading="loading"
      show-expand
      item-key="_id"
      :expanded.sync="expanded"
    >
      <template v-slot:[`header.data.rating`]="{ head }">
        <v-icon dense>mdi-heart</v-icon>
      </template>

      <template v-slot:[`header.data.commentSentimentScore`]="{ head }">
        <v-icon dense>mdi-emoticon</v-icon>
      </template>

      <template v-slot:[`item._id`]="{ item }">
        <span class="feedback-id" :id="item._id" @click="copyToClipboard(item._id)">{{
          item._id
        }}</span>
      </template>

      <template v-slot:[`item.timestamp`]="{ item }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <span v-on="on" v-bind="attrs">
              {{ moment(item.timestamp).fromNow() }}
            </span>
          </template>
          <span>{{ moment(item.timestamp).format('LLL') }}</span>
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
            <div v-on="on" v-bind="attrs">
              <v-checkbox
                :disabled="!isActionNeeded(item)"
                :input-value="isActionDone(item)"
                @change="(value) => onActionToggled(item, value)"
              ></v-checkbox>
            </div>
          </template>
          <span v-if="!isActionNeeded(item)">No action needed for this feedback</span>
          <span v-else-if="isActionDone(item)">Action done</span>
          <span v-else-if="!isActionDone(item)">Action needed</span>
        </v-tooltip>
      </template>

      <template v-slot:[`item.notes`]="{ item }">
        <v-tooltip bottom :disabled="!item.data.notes">
          <template v-slot:activator="{ on, attrs }">
            <div v-on="on" v-bind="attrs">
              <v-menu :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-icon v-on="on" v-bind="attrs">{{
                    item.data.notes ? 'mdi-comment-text-outline' : 'mdi-comment-outline'
                  }}</v-icon>
                </template>
                <v-card>
                  <v-textarea
                    solo
                    class="pa-2"
                    placeholder="..."
                    :value="item.data.notes"
                    @change="(value) => setNotes(item, value)"
                  ></v-textarea>
                </v-card>
              </v-menu>
            </div>
          </template>
          <span>{{ item.data.notes }}</span>
        </v-tooltip>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length" class="pa-4">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><b>Context</b></v-list-item-title>
              <v-list-item-subtitle
                ><span
                  ><b> Page : </b>{{ item.data.contextPage || 'N/A' }} | <b>URL :</b>
                  {{ item.data.contextPortal || 'N/A' }}</span
                ></v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title><b>Notes</b></v-list-item-title>
              <v-list-item-subtitle
                ><span>{{ item.data.notes || 'N/A' }}</span></v-list-item-subtitle
              >
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
import { DataTableHeader } from 'vuetify';
import { isPromoter, isNeutral, isDetractor } from '@/services/nps.service';

@Component({})
export default class FeedbackList extends Vue {
  @Prop({ required: true }) public feedbacks!: IFeedback[];
  @Prop({ required: true }) public loading!: boolean;

  snackbar = false;
  copiedId: string | null = null;
  expanded: any[] = [];

  @Emit('changeStatus')
  private changeStatus(
    feedback: IFeedback,
    status: FeedbackStatus,
  ): { feedback: IFeedback; status: FeedbackStatus } {
    return { feedback, status };
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

  @Emit('setNotes')
  private setNotes(feedback: IFeedback, notes: string): { feedback: IFeedback; notes: string } {
    return { feedback, notes };
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
      { text: '', value: 'data-table-expand', width: '3em' },
    ];
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

.v-data-table__expanded__content {
  box-shadow: none !important;
}

.v-data-table-header__icon {
  position: absolute !important;
}
</style>
