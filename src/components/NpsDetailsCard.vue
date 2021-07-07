<template>
  <div class="pa-4 d-flex flex-column align-center" style="width:100%">
    <div v-if="!isEmpty" ref="chartContainer">
      <apexchart
        type="bar"
        :options="chartOptions"
        :series="[{ data: [promoters, neutrals, detractors] }]"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isPromoter, isDetractor, isNeutral } from '@/services/nps.service';
import VueApexCharts from 'vue-apexcharts';
import { ApexOptions } from 'apexcharts';

@Component({
  components: {
    apexchart: VueApexCharts,
  },
})
export default class NpsDetailsCard extends Vue {
  @Prop({ required: true }) public ratings!: number[];

  private get isEmpty(): boolean {
    return !this.ratings;
  }

  private get promoters(): number {
    return (this.ratings.filter(isPromoter).length / this.ratings.length) * 100;
  }

  private get detractors(): number {
    return (this.ratings.filter(isDetractor).length / this.ratings.length) * 100;
  }

  private get neutrals(): number {
    return (this.ratings.filter(isNeutral).length / this.ratings.length) * 100;
  }

  private get chartOptions(): ApexOptions {
    return {
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
        formatter: (value) => Number(value).toFixed(0) + '%',
      },
    };
  }
}
</script>
