<template>
  <div class="pa-4 d-flex flex-column align-center" style="width: 100%; min-height: 200px">
    <apexchart
      type="bar"
      height="200"
      width="100%"
      :options="chartOptions"
      :series="[{ data: [promoters, neutrals, detractors] }]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isPromoter, isDetractor, isNeutral } from '@/services/nps.service';
import type { ApexOptions } from 'apexcharts';

const props = defineProps<{
  ratings: number[];
}>();

const promoters = computed<number>(() => {
  if (props.ratings.length === 0) {
    return 0;
  }
  return (props.ratings.filter(isPromoter).length / props.ratings.length) * 100;
});
const detractors = computed<number>(() => {
  if (props.ratings.length === 0) {
    return 0;
  }
  return (props.ratings.filter(isDetractor).length / props.ratings.length) * 100;
});
const neutrals = computed<number>(() => {
  if (props.ratings.length === 0) {
    return 0;
  }
  return (props.ratings.filter(isNeutral).length / props.ratings.length) * 100;
});

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    stacked: true,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
    },
  },
  legend: {
    show: false,
  },
  xaxis: {
    categories: ['Promoters', 'Neutrals', 'Detractors'],
  },
  colors: ['#00E396', '#FEB019', '#FF4560'],
  tooltip: {
    enabled: false,
    enabledOnSeries: undefined,
    onDatasetHover: {
      highlightDataSeries: false,
    },
  },
  dataLabels: {
    formatter: (value: number) => value.toFixed(0) + '%',
  },
}));
</script>
