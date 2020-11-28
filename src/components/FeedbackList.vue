<template>
  <v-data-table :items="feedbacks" :headers="tableHeaders">
    <template v-slot:[`item.context`]="{ item }">
      <div>Page : {{ item.data.contextPage }}</div>
      <div>URL : {{ item.data.contextPortal }}</div>
    </template>
  </v-data-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { IFeedback } from '@/interfaces/feedback';
import { DataTableHeader } from 'vuetify';

@Component({})
export default class FeedbackList extends Vue {
  @Prop({ required: true }) public feedbacks!: IFeedback[];

  private get tableHeaders(): DataTableHeader[] {
    return [
      { text: 'ID', value: '_id' },
      { text: 'Application', value: 'applicationID' },
      { text: 'Name', value: 'data.name' },
      { text: 'Feedback', value: 'data.feedback' },
      { text: 'Context', value: 'context' },
      { text: '❤', value: 'data.rating' },
      { text: '😊', value: 'data.sentiment' },
      { text: 'Status', value: '' },
      { text: 'Notes', value: '' },
    ];
  }
}
</script>

<style>
</style>
