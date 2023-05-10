import Vue, { VueConstructor } from 'vue';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export { default as GlistenClient } from '@/components/GlistenClient.vue';
export { default as GlistenDashboard } from '@/components/GlistenDashboard.vue';
export { default as GlistenCsat } from '@/components/GlistenCsat.vue';

export { apolloProvider as ApolloProvider } from '@/graphql/apollo';

const Plugin = {
  install: (vue: VueConstructor, options: any) => {
    Vue.prototype.dayjs = dayjs;
  },
};

export default Plugin;
