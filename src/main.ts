import 'babel-polyfill';
import Vue from 'vue';
import App from './App.vue';
import 'vuetify/dist/vuetify.min.css';
import vuetify from './plugins/vuetify';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { apolloProvider } from './graphql/apollo';
import VueApollo from 'vue-apollo';

dayjs.extend(isBetween);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

Vue.prototype.dayjs = dayjs;
Vue.config.productionTip = false;

Vue.use(VueApollo);

new Vue({
  vuetify,
  apolloProvider: apolloProvider(
    process.env.VUE_APP_WHISPR_API_HTTP_URL || '',
    process.env.VUE_APP_WHISPR_API_WS_URL || '',
    process.env.VUE_APP_SECURE_TOKEN || '',
  ),
  render: (h) => h(App),
}).$mount('#app');
