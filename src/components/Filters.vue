<template>
  <div>
    <v-menu>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-bind="attrs" v-on="on"
          >{{ dayjs(syncedStartDate).format('LL') }} -
          {{ dayjs(syncedEndDate).format('LL') }}</v-btn
        >
      </template>
      <v-date-picker class="pa-2" v-model="internalStartDate"></v-date-picker>
      <v-date-picker class="pa-2" v-model="internalEndDate"></v-date-picker>
    </v-menu>
    <div>
      <div class="headline">Applications</div>
      <v-checkbox
        v-for="application in availableApplications"
        :key="application"
        :value="isApplicationFiltered(application)"
        @change="(evt) => applicationFilterToggled(application, evt)"
        :label="application"
      ></v-checkbox>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, PropSync } from 'vue-property-decorator';
import dayjs from 'dayjs';

@Component({})
export default class Filters extends Vue {
  @PropSync('startDate', { required: true }) public syncedStartDate!: Date;
  @PropSync('endDate', { required: true }) public syncedEndDate!: Date;

  @Prop({ required: true }) public availableApplications!: string[];
  @PropSync('filteredApplications', { required: true })
  public syncedFilteredApplications!: string[];

  get internalStartDate(): string {
    return dayjs(this.syncedStartDate).format('YYYY-MM-DD');
  }

  set internalStartDate(value: string) {
    this.syncedStartDate = dayjs(value).toDate();
  }

  get internalEndDate(): string {
    return dayjs(this.syncedEndDate).format('YYYY-MM-DD');
  }

  set internalEndDate(value: string) {
    this.syncedEndDate = dayjs(value).toDate();
  }

  private isApplicationFiltered(application: string): boolean {
    return this.syncedFilteredApplications.indexOf(application) !== -1;
  }

  private applicationFilterToggled(application: string, value: boolean): void {
    const index = this.syncedFilteredApplications.indexOf(application);

    if (value && index === -1) {
      this.syncedFilteredApplications = [application, ...this.syncedFilteredApplications];
    } else if (!value && index !== -1) {
      this.syncedFilteredApplications = this.syncedFilteredApplications.filter(
        (_, i) => i !== index,
      );
    }
  }
}
</script>

<style scoped></style>
