<template>
  <apexchart
    width="300px"
    type="donut"
    :options="chartOptions"
    :series="[promoters, neutrals, detractors]"
  ></apexchart>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IFeedback } from '@/interfaces/feedback';
import { isPromoter, isDetractor, isNeutral } from '@/services/nps.service';
import VueApexCharts from 'vue-apexcharts';
import { ApexOptions } from 'apexcharts';

@Component({ components: { apexchart: VueApexCharts } })
export default class NpsScoreCard extends Vue {
  @Prop({ required: true }) public ratings!: number[];

  private get promoters(): number {
    return this.ratings.filter(isPromoter).length;
  }

  private get detractors(): number {
    return this.ratings.filter(isDetractor).length;
  }

  private get neutrals(): number {
    return this.ratings.filter(isNeutral).length;
  }

  private get score(): string {
    return this.computeScore(this.promoters, this.neutrals, this.detractors);
  }

  private computeScore(promoters: number, neutral: number, detractors: number): string {
    return (((promoters - detractors) / (promoters + neutral + detractors)) * 100).toFixed(0);
  }

  private get chartOptions(): ApexOptions {
    return {
      chart: {
        type: 'donut',
      },
      labels: ['Promoters', 'Neutrals', 'Detractors'],
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      colors: ['#00E396', '#FEB019', '#FF4560'],
      tooltip: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'NPS',
                formatter: (w) => this.score,
              },
              value: {
                fontWeight: 'bold',
                fontSize: '30px',
              },
            },
          },
        },
      },
    };
  }
}
</script>

<style scoped>
</style>
