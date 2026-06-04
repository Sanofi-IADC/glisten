<template>
  <div class="container pa-4 d-flex flex-column align-center" style="min-height: 200px">
    <apexchart
      width="280"
      height="200"
      type="radialBar"
      :options="chartOptions"
      :series="[normalizedScore * 100]"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isPromoter, isDetractor, isNeutral, computeNPSScore } from '@/services/nps.service';
import type { ApexOptions } from 'apexcharts';

const props = defineProps<{
  ratings: number[];
}>();

const promoters = computed<number>(() => props.ratings.filter(isPromoter).length);
const detractors = computed<number>(() => props.ratings.filter(isDetractor).length);
const neutrals = computed<number>(() => props.ratings.filter(isNeutral).length);
const score = computed<number>(() =>
  computeNPSScore(promoters.value, neutrals.value, detractors.value),
);
const normalizedScore = computed<number>(() => (100 + score.value) / 200);

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'radialBar',
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  colors: [score.value > 0 ? '#00E396' : '#FF4560'],
  tooltip: {
    enabled: false,
    enabledOnSeries: undefined,
    onDatasetHover: {
      highlightDataSeries: false,
    },
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      dataLabels: {
        show: true,
        total: {
          show: true,
          label: score.value.toFixed(0),
          fontSize: '30px',
          formatter: () => 'NPS',
        },
        value: {
          fontSize: '20px',
        },
      },
    },
  },
}));
</script>

<style lang="scss" scoped>
.container :deep(.apexcharts-datalabels-group) {
  transform: translateY(-30px);
}
</style>
