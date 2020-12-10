<template>
  <v-data-table :items="feedbacks" :headers="tableHeaders" :loading="loading">
    <template v-slot:[`item.context`]="{ item }">
      <div>Page : {{ item.data.contextPage }}</div>
      <div>URL : {{ item.data.contextPortal }}</div>
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
    <template v-slot:[`item.name`]="{ item }">
      <span>{{ item.data.anonymous ? 'anonymous' : item.data.name }}</span>
    </template>

    <template v-slot:[`item.rating`]="{ item }">
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
  </v-data-table>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, PropSync } from 'vue-property-decorator';
import { IFeedback, FeedbackStatus } from '@/interfaces/feedback';
import { DataTableHeader, DataOptions } from 'vuetify';
import { Color } from 'vuetify/lib/util/colors';
import { isPromoter, isNeutral, isDetractor } from '@/services/nps.service';

@Component({})
export default class FeedbackList extends Vue {
  @Prop({ required: true }) public feedbacks!: IFeedback[];
  @Prop({ required: true }) public loading!: boolean;

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
      { text: 'ID', value: '_id' },
      { text: 'Date', value: 'timestamp' },
      { text: 'Application', value: 'applicationID' },
      { text: 'Name', value: 'name' },
      { text: 'Feedback', value: 'data.feedback' },
      { text: 'Context', value: 'context' },
      { text: '❤', value: 'rating' },
      { text: '😊', value: 'data.commentSentimentScore' },
      { text: 'Status', value: 'status' },
      { text: 'Notes', value: 'notes' },
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
}
</script>

<style>
</style>
