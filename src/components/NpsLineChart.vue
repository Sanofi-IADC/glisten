<template>
  <div class="pa-4" style="width:100%">
    <apexchart
      v-if="!isEmpty"
      type="line"
      height="400px"
      :options="chartOptions"
      :series="[{ name: 'NPS', data: npsScores }]"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { computeNPSScoreEvolution } from '@/services/nps.service';
import VueApexCharts from 'vue-apexcharts';
import { ApexOptions } from 'apexcharts';
import dayjs, { Dayjs } from 'dayjs';
import { chain } from 'lodash';
import { DurationUnitType } from 'dayjs/plugin/duration';

export interface TimedRating {
  rating: number;
  timestamp: string;
}

@Component({
  components: {
    apexchart: VueApexCharts,
  },
})
export default class NpsLineChart extends Vue {
  @Prop({ required: true }) public timedRatings!: TimedRating[];
  @Prop({ required: true }) public timePeriod!: DurationUnitType;
  @Prop({ default: 'LL' }) public displayDateFormat!: string;

  private get npsScores(): number[] {
    return computeNPSScoreEvolution(this.ratingsPerTimePeriod);
  }

  private get isEmpty(): boolean {
    return !this.timedRatings;
  }

  private getTimePeriodIndex(timestamp: Dayjs): number {
    return Math.floor(timestamp.diff(this.firstDate) / this.timePeriodDuration);
  }

  private get ratingsPerTimePeriod(): number[][] {
    const ratingsPerTimePeriod: number[][] = Array.from(
      Array(this.timePeriodsCount),
    ).map((x) => []);

    for (const timedRating of this.timedRatings) {
      const index = this.getTimePeriodIndex(dayjs(timedRating.timestamp));
      if (ratingsPerTimePeriod[index]) {
        ratingsPerTimePeriod[index].push(timedRating.rating);
      }
    }

    return ratingsPerTimePeriod;
  }

  private get firstDate(): Dayjs {
    const minTimestamp = chain(this.timedRatings)
      .map((x) => dayjs(x.timestamp))
      .min()
      .value();

    return dayjs(minTimestamp).startOf(this.timePeriod);
  }

  private get lastDate(): Dayjs {
    const maxTimestamp = chain(this.timedRatings)
      .map((x) => dayjs(x.timestamp))
      .max()
      .value();

    return dayjs(maxTimestamp).startOf(this.timePeriod);
  }

  private get timePeriodsCount(): number {
    return Math.floor(this.lastDate.diff(this.firstDate) / this.timePeriodDuration) + 1;
  }

  private get timePeriodDuration(): number {
    return dayjs.duration(1, this.timePeriod).asMilliseconds();
  }

  private get timePeriods(): string[] {
    const timePeriods = [this.firstDate];

    for (let index = 1; index < this.timePeriodsCount; index++) {
      const lastDate = timePeriods[timePeriods.length - 1];
      timePeriods.push(lastDate.clone().add(this.timePeriodDuration, 'ms'));
    }
    return timePeriods.map((x) => x.format(this.displayDateFormat));
  }

  private get chartOptions(): ApexOptions {
    return {
      title: {
        text: 'Net Promoter Score (week over week) ',
      },
      chart: {
        type: 'line',
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
      stroke: {
        curve: 'straight',
      },
      xaxis: {
        categories: this.timePeriods,
        labels: {
          format: 'MMM d yyyy',
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => value.toFixed(0),
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
    };
  }
}
</script>
