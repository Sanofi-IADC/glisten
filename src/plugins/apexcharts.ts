import type { App } from 'vue';
import VueApexCharts from 'vue3-apexcharts';

export default {
  install(app: App) {
    // vue3-apexcharts registers under the lowercase `apexchart` tag name.
    // eslint-disable-next-line vue/component-definition-name-casing -- library convention
    app.component('apexchart', VueApexCharts);
  },
};
