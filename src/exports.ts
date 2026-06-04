import type { App } from 'vue';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { ApolloClients } from '@vue/apollo-composable';
import { apolloClients } from '@/graphql/apollo';
import apexcharts from '@/plugins/apexcharts';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export { default as GlistenClient } from '@/components/GlistenClient.vue';
export { default as GlistenDashboard } from '@/components/GlistenDashboard.vue';
export { default as GlistenCsat } from '@/components/GlistenCsat.vue';

export { apolloClient, apolloClients } from '@/graphql/apollo';
// Re-export the injection key so consumers can `app.provide(ApolloClients, ...)`
// themselves if they already manage their own Apollo clients.
export { ApolloClients } from '@vue/apollo-composable';

export interface GlistenPluginOptions {
  httpURL?: string;
  wsURL?: string;
  token?: string;
}

const Plugin = {
  /**
   * Registers Glisten on a Vue app.
   *
   * Glisten's components query the `whispr` Apollo client. If `httpURL` is
   * provided here, the plugin creates and provides the required clients
   * (`default` + `whispr`) for you. Otherwise the host app is responsible for
   * providing them via `app.provide(ApolloClients, { default, whispr })`.
   */
  install: (app: App, options: GlistenPluginOptions = {}) => {
    app.config.globalProperties.dayjs = dayjs;
    app.use(apexcharts);

    if (options.httpURL) {
      app.provide(ApolloClients, apolloClients(options.httpURL, options.wsURL, options.token));
    }
  },
};

export default Plugin;
