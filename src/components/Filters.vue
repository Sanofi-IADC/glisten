<template>
  <v-menu>
    <template v-slot:activator="{on, attrs}">
      <v-btn v-bind="attrs" v-on="on">{{moment(syncedStartDate).format('LL')}} - {{moment(syncedEndDate).format('LL')}}</v-btn>
    </template>
    <v-date-picker class="pa-2" v-model="internalStartDate"></v-date-picker>
    <v-date-picker class="pa-2" v-model="internalEndDate"></v-date-picker>
  </v-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue, PropSync } from 'vue-property-decorator';
import moment from 'moment';

@Component({})
export default class Filters extends Vue {
  @PropSync('startDate', { required: true }) public syncedStartDate!: Date;
  @PropSync('endDate', { required: true }) public syncedEndDate!: Date;

  get internalStartDate(): string {
    return moment(this.syncedStartDate).format('YYYY-MM-DD');
  }

  set internalStartDate(value: string) {
    this.syncedStartDate = moment(value).toDate();
  }

  get internalEndDate(): string {
    return moment(this.syncedEndDate).format('YYYY-MM-DD');
  }

  set internalEndDate(value: string) {
    this.syncedEndDate = moment(value).toDate();
  }
}
</script>

<style scoped>
</style>
