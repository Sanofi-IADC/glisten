import VueApollo from 'vue-apollo';
import { VueConstructor } from 'vue';

export { default as GlistenClient } from '@/components/GlistenClient.vue';
export { default as Dashboard } from '@/components/Dashboard.vue';

const Plugin = {
  install: (Vue: VueConstructor, options: any) => {
    Vue.use(VueApollo);
  },
};

export default Plugin;
