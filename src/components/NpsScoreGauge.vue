<template>
  <div class="container pa-4 d-flex flex-column align-center">
    <div ref="chartContainer">
      <apexchart
        width="300px"
        height="400px"
        type="radialBar"
        :options="chartOptions"
        :series="[normalizedScore * 100]"
      ></apexchart>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IFeedback } from '@/interfaces/feedback';
import { isPromoter, isDetractor, isNeutral, computeNPSScore } from '@/services/nps.service';
import VueApexCharts from 'vue-apexcharts';
import { ApexOptions } from 'apexcharts';

@Component({ components: { apexchart: VueApexCharts } })
export default class NpsScoreGauge extends Vue {
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

  private get score(): number {
    return computeNPSScore(this.promoters, this.neutrals, this.detractors);
  }

  private get normalizedScore(): number {
    return (100 + this.score) / 200;
  }

  private get chartOptions(): ApexOptions {
    return {
      chart: {
        type: 'radialBar',
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      colors: [this.score > 0 ? '#00E396' : '#FF4560'],
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
              label: this.score.toFixed(0),
              fontSize: '30px',
              formatter: () => 'NPS',
            },
            value: {
              fontSize: '20px',
            },
          },
        },
      },
    };
  }
}
</script>

<style scoped>
.container >>> .apexcharts-datalabels-group {
  transform: translateY(-30px);
}
</style>
