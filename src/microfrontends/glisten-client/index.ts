import './config/set-public-path';
import 'babel-polyfill';
import Vue from 'vue';
import 'vuetify/dist/vuetify.min.css';
import vuetify from '@/plugins/vuetify';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { apolloProvider } from '@/graphql/apollo';
import VueApollo from 'vue-apollo';
import singleSpaVue from 'single-spa-vue';
import MicrofrontendGlistenClient from '@/microfrontends/glisten-client/components/MicrofrontendGlistenClient.vue';
import runtimeEnvironmentVariables from '@/microfrontends/common/environment-variables';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

Vue.prototype.dayjs = dayjs;
Vue.config.productionTip = false;

Vue.use(VueApollo);

const variables = runtimeEnvironmentVariables();

const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render(h: (component: Vue.Component) => HTMLElement) {
      return h(MicrofrontendGlistenClient);
    },
    vuetify,
    apolloProvider: apolloProvider(
      variables.VUE_APP_WHISPR_BASE_URL || '',
      variables.VUE_APP_WHISPR_BASE_WS || '',
    ),
  },
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;
