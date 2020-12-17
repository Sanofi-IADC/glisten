import VueApollo from 'vue-apollo';
import Vue, { VueConstructor } from 'vue';
import moment from 'moment';

export { default as GlistenClient } from '@/components/GlistenClient.vue';
export { default as Dashboard } from '@/components/Dashboard.vue';

const Plugin = {
  install: (vue: VueConstructor, options: any) => {
    Vue.prototype.moment = moment;
  },
};

export default Plugin;
