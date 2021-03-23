import Vue, { VueConstructor } from 'vue';
import moment from 'moment';

export { default as GlistenClient } from '@/components/GlistenClient.vue';
export { default as GlistenDashboard } from '@/components/GlistenDashboard.vue';
export { default as GlistenCsat } from '@/components/GlistenCsat.vue';

const Plugin = {
  install: (vue: VueConstructor, options: any) => {
    Vue.prototype.moment = moment;
  },
};

export default Plugin;
