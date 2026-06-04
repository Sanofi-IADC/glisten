import { createApp, h, provide } from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import apexcharts from './plugins/apexcharts';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { ApolloClients } from '@vue/apollo-composable';
import { apolloClients } from './graphql/apollo';
import { WHISP_GQL_CLIENT } from './types/whisps';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const clients = apolloClients(
  import.meta.env.VITE_WHISPR_API_HTTP_URL || '',
  import.meta.env.VITE_WHISPR_API_WS_URL || '',
);

// Avoid Apollo cache collisions between Cypress tests that issue the same query with different variables.
const isCypressRun =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('cypress');

if (isCypressRun) {
  const noCacheDefaults = {
    watchQuery: { fetchPolicy: 'no-cache' as const },
    query: { fetchPolicy: 'no-cache' as const },
    mutate: { fetchPolicy: 'no-cache' as const },
  };
  clients.default.defaultOptions = noCacheDefaults;
  clients[WHISP_GQL_CLIENT].defaultOptions = noCacheDefaults;
}

const app = createApp({
  setup() {
    provide(ApolloClients, clients);
  },
  render: () => h(App),
});

app.use(vuetify);
app.use(apexcharts);
app.mount('#app');
