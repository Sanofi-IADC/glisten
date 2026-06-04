<template>
  <div>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props: menuProps }">
        <v-btn v-bind="menuProps">
          {{ dayjs(startDate).format('LL') }} -
          {{ dayjs(endDate).format('LL') }}
        </v-btn>
      </template>
      <v-date-picker
        multiple="range"
        :model-value="dateRangeValue"
        class="pa-2"
        title="Select date range"
        @update:model-value="onDateRangeChange"
      />
    </v-menu>
    <div>
      <div class="text-h5">Applications</div>
      <v-checkbox
        v-for="application in availableApplications"
        :key="application"
        :model-value="isApplicationFiltered(application)"
        :label="application"
        @update:model-value="(evt) => applicationFilterToggled(application, !!evt)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';

const props = defineProps<{
  startDate: Date;
  endDate: Date;
  availableApplications: string[];
  filteredApplications: string[];
}>();

const emit = defineEmits<{
  (e: 'update:startDate', value: Date): void;
  (e: 'update:endDate', value: Date): void;
  (e: 'update:filteredApplications', value: string[]): void;
}>();

const dateRangeValue = computed(() => [
  dayjs(props.startDate).format('YYYY-MM-DD'),
  dayjs(props.endDate).format('YYYY-MM-DD'),
]);

function onDateRangeChange(value: string | string[] | Date | Date[] | null) {
  if (!value) {
    return;
  }

  const dates = (Array.isArray(value) ? value : [value]).map((entry) =>
    dayjs(entry).format('YYYY-MM-DD'),
  );

  if (dates.length < 2) {
    return;
  }

  const sorted = [...dates].sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());
  emit('update:startDate', dayjs(sorted[0]).toDate());
  emit('update:endDate', dayjs(sorted[sorted.length - 1]).toDate());
}

function isApplicationFiltered(application: string): boolean {
  return props.filteredApplications.indexOf(application) !== -1;
}

function applicationFilterToggled(application: string, value: boolean): void {
  const index = props.filteredApplications.indexOf(application);

  if (value && index === -1) {
    emit('update:filteredApplications', [application, ...props.filteredApplications]);
  } else if (!value && index !== -1) {
    emit(
      'update:filteredApplications',
      props.filteredApplications.filter((_, i) => i !== index),
    );
  }
}
</script>
