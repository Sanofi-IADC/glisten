<template>
  <div class="pa-4" style="width: 100%; min-height: 400px">
    <apexchart
      type="bar"
      height="400"
      width="100%"
      :options="chartOptions"
      :series="[
        { name: 'Promoters', data: promoters },
        { name: 'Neutrals', data: neutrals },
        { name: 'Detractors', data: detractors },
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isPromoter, isDetractor, isNeutral } from '@/services/nps.service';
import type { ApexOptions } from 'apexcharts';
import dayjs, { type Dayjs } from 'dayjs';
import type { DurationUnitType } from 'dayjs/plugin/duration';
import { chain } from 'lodash';
import type { TimedRating } from '@/types/charts';

const props = withDefaults(
  defineProps<{
    timedRatings: TimedRating[];
    timePeriod: DurationUnitType;
    displayDateFormat?: string;
  }>(),
  {
    displayDateFormat: 'LL',
  },
);

const isEmpty = computed<boolean>(() => props.timedRatings.length === 0);

const timePeriodDuration = computed<number>(() =>
  dayjs.duration(1, props.timePeriod).asMilliseconds(),
);

const firstDate = computed<Dayjs>(() => {
  if (props.timedRatings.length === 0) {
    return dayjs().startOf(props.timePeriod);
  }

  const minTimestamp = chain(props.timedRatings)
    .map((x) => dayjs(x.timestamp))
    .min()
    .value();

  return dayjs(minTimestamp).startOf(props.timePeriod);
});

const lastDate = computed<Dayjs>(() => {
  if (props.timedRatings.length === 0) {
    return dayjs().startOf(props.timePeriod);
  }

  const maxTimestamp = chain(props.timedRatings)
    .map((x) => dayjs(x.timestamp))
    .max()
    .value();

  return dayjs(maxTimestamp).startOf(props.timePeriod);
});

const timePeriodsCount = computed<number>(
  () => Math.floor(lastDate.value.diff(firstDate.value) / timePeriodDuration.value) + 1,
);

function getTimePeriodIndex(timestamp: Dayjs): number {
  return Math.floor(timestamp.diff(firstDate.value) / timePeriodDuration.value);
}

const ratingsPerTimePeriod = computed<number[][]>(() => {
  const ratings: number[][] = Array.from(Array(timePeriodsCount.value)).map(() => []);

  for (const timedRating of props.timedRatings) {
    const index = getTimePeriodIndex(dayjs(timedRating.timestamp));
    if (ratings[index]) {
      ratings[index].push(timedRating.rating);
    }
  }

  return ratings;
});

const timePeriods = computed<string[]>(() => {
  const periods = [firstDate.value];

  for (let index = 1; index < timePeriodsCount.value; index++) {
    const last = periods[periods.length - 1];
    periods.push(last.clone().add(timePeriodDuration.value, 'ms'));
  }

  return periods.map((x) => x.format(props.displayDateFormat));
});

const promoters = computed<number[]>(() =>
  ratingsPerTimePeriod.value.map((ratings) => ratings.filter(isPromoter).length),
);
const detractors = computed<number[]>(() =>
  ratingsPerTimePeriod.value.map((ratings) => ratings.filter(isDetractor).length),
);
const neutrals = computed<number[]>(() =>
  ratingsPerTimePeriod.value.map((ratings) => ratings.filter(isNeutral).length),
);

const chartOptions = computed<ApexOptions>(() => ({
  title: {
    text: 'Responses (week over week) ',
  },
  noData: {
    text: isEmpty.value ? 'No data available' : undefined,
  },
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
  xaxis: {
    categories: timePeriods.value,
  },
  colors: ['#00E396', '#FEB019', '#FF4560'],
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
}));
</script>
