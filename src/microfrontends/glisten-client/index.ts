import './config/set-public-path';
import { createApp, h } from 'vue';
import vuetify from '@/plugins/vuetify';
import apexcharts from '@/plugins/apexcharts';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { ApolloClients } from '@vue/apollo-composable';
import { apolloClients } from '@/graphql/apollo';
import singleSpaVue from 'single-spa-vue';
import MicrofrontendGlistenClient from '@/microfrontends/glisten-client/components/MicrofrontendGlistenClient.vue';
import runtimeEnvironmentVariables from '@/microfrontends/common/environment-variables';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const variables = runtimeEnvironmentVariables();

const clients = apolloClients(
  variables.VITE_WHISPR_BASE_URL || variables.VUE_APP_WHISPR_BASE_URL || '',
  variables.VITE_WHISPR_BASE_WS || variables.VUE_APP_WHISPR_BASE_WS || '',
);

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(MicrofrontendGlistenClient);
    },
  },
  handleInstance(app) {
    app.config.globalProperties.dayjs = dayjs;
    app.use(vuetify);
    app.use(apexcharts);
    app.provide(ApolloClients, clients);
  },
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;
