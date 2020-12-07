<template>
  <div class="container d-flex flex-column align-center">
    <div>
      <div ref="chartContainer" :style="containerStyle">
        <apexchart
          type="donut"
          :options="chartOptions"
          :series="[detractors, promoters]"
        ></apexchart>
      </div>
    </div>
    <span class="display-1">{{ score.toFixed(0) }}</span>
    <span class="heading">NPS</span>
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

  private async mounted(): Promise<void> {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  }

  private beforeDestroy(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  private adjustedPadding: number = 0;

  private get containerStyle(): any {
    return {
      'margin-bottom': this.adjustedPadding + 'px',
    };
  }

  private handleResize(): void {
    const el = this.$refs.chartContainer as Element;
    this.adjustedPadding = -(el?.clientHeight ?? 0) / 2 * 3 / 2;
  }

  private get chartOptions(): ApexOptions {
    return {
      chart: {
        type: 'donut',
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      colors: ['#FF4560', '#00E396'],
      tooltip: {
        enabled: false,
      },
      labels: ['Detractors', 'Promoters'],
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
        },
      },
    };
  }

  public testScore: number = 0.01;
}
</script>

<style scoped>
.container {
  width: 300px;
}
</style>
